import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Increase JSON and urlencoded body limits for base64 file payloads
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Helper to load/save JSON data
function readData<T>(file: string, defaultValue: T): T {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return defaultValue;
}

function writeData<T>(file: string, data: T): void {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

// Multer storage for uploaded files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
  fileFilter: (req, file, cb) => {
    const allowedMime = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMime.includes(file.mimetype) || file.originalname.match(/\.(pdf|txt|md|docx?)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يرجى رفع ملف PDF أو TXT أو Markdown.'));
    }
  }
});

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Gemini calls will fail if invoked.');
    }
    const client = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    // Wrap generateContent with automatic 503 fallback
    const originalGenerateContent = client.models.generateContent.bind(client.models);
    client.models.generateContent = (async (params: any) => {
      const fallbackModels = [
        params.model || MODEL_NAME,
        'gemini-flash-latest',
        'gemini-3.1-flash-lite'
      ];
      const uniqueModels = Array.from(new Set(fallbackModels));
      let lastErr: any = null;
      for (const m of uniqueModels) {
        try {
          return await originalGenerateContent({ ...params, model: m });
        } catch (err: any) {
          lastErr = err;
          const msg = String(err?.message || err);
          if (
            msg.includes('503') ||
            msg.includes('high demand') ||
            msg.includes('UNAVAILABLE') ||
            msg.includes('overloaded')
          ) {
            console.warn(`Model ${m} busy (503), retrying with fallback...`);
            continue;
          }
          throw err;
        }
      }
      throw lastErr;
    }) as any;

    geminiClient = client;
  }
  return geminiClient;
}

// Model alias
const MODEL_NAME = 'gemini-3.8-flash';

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET all documents
app.get('/api/documents', (req, res) => {
  const docs = readData<any[]>(DOCUMENTS_FILE, []);
  res.json({ documents: docs });
});

// GET document by ID
app.get('/api/documents/:id', (req, res) => {
  const docs = readData<any[]>(DOCUMENTS_FILE, []);
  const doc = docs.find((d) => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'الملف غير موجود' });
  }
  res.json({ document: doc });
});

// DELETE document
app.delete('/api/documents/:id', (req, res) => {
  let docs = readData<any[]>(DOCUMENTS_FILE, []);
  const initialLength = docs.length;
  docs = docs.filter((d) => d.id !== req.params.id);
  if (docs.length === initialLength) {
    return res.status(404).json({ error: 'الملف غير موجود' });
  }
  writeData(DOCUMENTS_FILE, docs);
  res.json({ success: true, message: 'تم حذف الملزمة بنجاح' });
});

// UPDATE document progress
app.put('/api/documents/:id/progress', (req, res) => {
  const docs = readData<any[]>(DOCUMENTS_FILE, []);
  const index = docs.findIndex((d) => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'الملف غير موجود' });
  }
  const { progressPercent, lastTopicId, completedTopicId, studyTimeMinutes } = req.body;
  if (progressPercent !== undefined) docs[index].progressPercent = progressPercent;
  if (lastTopicId) docs[index].lastTopicId = lastTopicId;
  docs[index].lastStudiedAt = new Date().toISOString();

  if (completedTopicId && Array.isArray(docs[index].topics)) {
    const topic = docs[index].topics.find((t: any) => t.id === completedTopicId);
    if (topic) topic.isCompleted = true;
  }

  writeData(DOCUMENTS_FILE, docs);
  res.json({ success: true, document: docs[index] });
});

// UPLOAD and ANALYZE DOCUMENT
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    let fileBuffer: Buffer | null = null;
    let fileName = 'مستند دراسي';
    let fileMime = 'application/pdf';
    let rawText = '';
    let pageCount = 1;

    if (req.file) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
      fileMime = req.file.mimetype;
    } else if (req.body.text) {
      // Manual text paste
      rawText = req.body.text;
      fileName = req.body.title || 'ملاحظات دراسية ملصوقة';
      fileMime = 'text/plain';
      fileBuffer = Buffer.from(rawText, 'utf-8');
    } else {
      return res.status(400).json({ error: 'لم يتم توفير ملف أو نص للتحليل.' });
    }

    // 1. Calculate SHA-256 Hash for duplicate detection
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const existingDocs = readData<any[]>(DOCUMENTS_FILE, []);
    const duplicate = existingDocs.find((d) => d.fileHash === fileHash);
    if (duplicate && !req.query.forceReanalyze) {
      return res.json({
        document: duplicate,
        isDuplicate: true,
        message: 'تم العثور على نفس الملف في مكتبتك مسبقًا!'
      });
    }

    // 2. Parse PDF or Text for structural diagnostics
    let isScanned = false;
    let textQuality: 'ممتازة' | 'جيدة' | 'متوسطة' | 'تحتاج مراجعة' = 'ممتازة';
    let pdfType: 'Text PDF' | 'Scanned PDF' | 'Mixed PDF' = 'Text PDF';

    if (fileMime === 'application/pdf' && fileBuffer) {
      try {
        const parsed = await pdfParse(fileBuffer);
        pageCount = parsed.numpages || 1;
        rawText = parsed.text || '';
        const wordCount = rawText.trim().split(/\s+/).length;

        if (wordCount < 50 && pageCount >= 1) {
          isScanned = true;
          pdfType = 'Scanned PDF';
          textQuality = 'تحتاج مراجعة';
        } else if (wordCount / pageCount < 60) {
          pdfType = 'Mixed PDF';
          textQuality = 'متوسطة';
        } else {
          pdfType = 'Text PDF';
          textQuality = 'ممتازة';
        }
      } catch (pdfErr) {
        console.warn('Local pdf-parse warning, will rely on Gemini multimodal vision:', pdfErr);
        isScanned = true;
        pdfType = 'Mixed PDF';
        textQuality = 'جيدة';
      }
    } else {
      pageCount = Math.max(1, Math.ceil(rawText.length / 2000));
    }

    // 3. Multimodal Analysis with Gemini 3.8 Flash
    const ai = getGemini();
    const prompt = `أنت المدرس والمحلل الأكاديمي لمنصة "دَرّسني".
المطلوب منك تحليل هذه الملزمة/المستند الدراسي تحليلاً شاملاً ودقيقاً للغاية.
أهم القواعد:
1. استخرج المواضيع الحقيقية المذكورة في الملف بالتحديد، مع المحافظة على المصطلحات الإنجليزية العلمية/الطبية المهمة (مثل Pathophysiology, Differential Diagnosis, Pharmacokinetics, Newton's Laws).
2. لا تخترع أي معلومات غير موجودة في المستند.
3. حدد أرقام الصفحات أو الأقسام الحقيقية إذا أمكن.
4. أخرج النتيجة بصيغة JSON حصراً وتطابق المخطط التالي.

المخطط المطلوب:
{
  "title": "عنوان دقيق للملزمة أو المادة",
  "summary": "ملخص شامل وواضح للمادة الدراسية في 3 إلى 5 فقرات مركزة",
  "difficulty": "سهل" أو "متوسط" أو "صعب" أو "متقدم / امتحاني",
  "estimatedStudyTime": "مثال: ساعتان ونصف أو 4 ساعات",
  "topics": [
    {
      "id": "topic-1",
      "title": "عنوان الموضوع بالعربي",
      "titleEn": "Topic Title in English",
      "pageReference": "الصفحة التقريبية مثل: ص 1-4",
      "summary": "ملخص هذا الموضوع بالتحديد",
      "keyConcepts": ["مفهوم 1", "مفهوم 2", "مفهوم 3"],
      "subtopics": ["عنوان فرعي 1", "عنوان فرعي 2"],
      "difficulty": "متوسط"
    }
  ],
  "importantTerms": [
    {
      "term": "المصطلح بالعربي أو المعرب",
      "termEn": "English Term",
      "definition": "تعريف دقيق ومبسط",
      "clinicalSignificance": "الأهمية السريرية أو التطبيقية إن وجدت",
      "page": "رقم الصفحة"
    }
  ],
  "tables": [
    {
      "id": "tab-1",
      "title": "عنوان الجدول أو المقارنة",
      "description": "ما يحتويه الجدول ولماذا هو مهم",
      "page": "ص 3",
      "keyComparison": "ملخص المقارنة"
    }
  ],
  "figures": [
    {
      "id": "fig-1",
      "title": "عنوان الرسمة أو المخطط البياني أو الصورة",
      "description": "شرح لما يوضحه المخطط أو الصورة",
      "page": "ص 5",
      "keyObservations": "أبرز النقاط المستنتجة من الرسم"
    }
  ],
  "highYieldPoints": [
    {
      "category": "تصنيف مثل: تعريفات، أرقام وإحصائيات، فوارق جوهرية، أسئلة امتحانات",
      "point": "نص النقطة المهمة جداً",
      "examRelevance": "عالية جدًا 🔥"
    }
  ],
  "studyPlan": [
    {
      "day": 1,
      "title": "اليوم الأول: الأساسيات والمفاهيم الأولية",
      "topicIds": ["topic-1"],
      "estimatedMinutes": 45,
      "isDone": false
    }
  ]
}`;

    let contents: any[] = [];
    if (fileMime === 'application/pdf' && fileBuffer) {
      // Direct multimodal PDF upload to Gemini 3.8 Flash!
      contents = [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: fileBuffer.toString('base64')
          }
        },
        { text: prompt }
      ];
    } else {
      contents = [
        { text: `محتوى المستند الدراسي:\n\n${rawText.slice(0, 50000)}\n\n---\n${prompt}` }
      ];
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text || '{}';
    let analysisData: any = {};
    try {
      analysisData = JSON.parse(responseText);
    } catch (parseErr) {
      // Regex recovery if wrapped in markdown
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        analysisData = JSON.parse(match[0]);
      } else {
        throw new Error('فشل في قراءة مخرجات الذكاء الاصطناعي كبيانات منظمة.');
      }
    }

    // Build finalized Document object
    const docId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newDoc = {
      id: docId,
      title: analysisData.title || fileName.replace(/\.[^/.]+$/, ''),
      fileName,
      fileSize: fileBuffer ? fileBuffer.length : rawText.length,
      fileHash,
      pageCount: pageCount || 1,
      summary: analysisData.summary || 'ملزمة دراسية تم تحليلها بنجاح.',
      difficulty: analysisData.difficulty || 'متوسط',
      estimatedStudyTime: analysisData.estimatedStudyTime || 'ساعتان',
      createdAt: new Date().toISOString(),
      lastStudiedAt: new Date().toISOString(),
      progressPercent: 0,
      lastTopicId: analysisData.topics?.[0]?.id || '',
      topics: (analysisData.topics || []).map((t: any, idx: number) => ({
        ...t,
        id: t.id || `topic-${idx + 1}`,
        isCompleted: false
      })),
      importantTerms: analysisData.importantTerms || [],
      tables: analysisData.tables || [],
      figures: analysisData.figures || [],
      highYieldPoints: analysisData.highYieldPoints || [],
      qualityReport: {
        textQuality,
        scannedPagesDetected: isScanned,
        imageDetection: (analysisData.figures && analysisData.figures.length > 0),
        notes: isScanned
          ? 'تم تحليل المستند بواسطة الرؤية البصرية المتعددة للذكاء الاصطناعي لوجود صفحات مصورة.'
          : 'تم استخراج النص والمخططات بنجاح تام وبدقة عالية.',
        isPartial: isScanned && (analysisData.topics || []).length < 2,
        pdfType
      },
      studyPlan: (analysisData.studyPlan || []).map((sp: any, i: number) => ({
        ...sp,
        day: sp.day || i + 1,
        isDone: false
      })),
      extractedTextSample: rawText.slice(0, 10000)
    };

    // Save to persistent file store
    existingDocs.unshift(newDoc);
    writeData(DOCUMENTS_FILE, existingDocs);

    res.json({
      document: newDoc,
      isDuplicate: false,
      message: 'تم تحليل الملزمة بنجاح!'
    });
  } catch (error: any) {
    console.error('Upload & analyze error:', error);
    res.status(500).json({
      error: 'صار خلل أثناء قراءة أو تحليل الملزمة. تأكد من سلامة الملف وحاول مرة ثانية.',
      details: error?.message || String(error)
    });
  }
});

// EXPLAIN TOPIC ("اشرحلي")
app.post('/api/explain-topic', async (req, res) => {
  try {
    const {
      documentId,
      topicId,
      level = 'medium',
      style = 'tutor',
      variation = 1,
      isReExplain = false,
      userPreferences = {},
      customPrompt = ''
    } = req.body;

    const docs = readData<any[]>(DOCUMENTS_FILE, []);
    const doc = docs.find((d) => d.id === documentId);
    if (!doc) {
      return res.status(404).json({ error: 'الملف غير موجود' });
    }

    const topic = (doc.topics || []).find((t: any) => t.id === topicId) || doc.topics?.[0];

    // Dialect & variation strategy
    const dialect = userPreferences.dialect || 'iraqi';
    const isIraqi = dialect === 'iraqi';

    let reExplainStyle = '';
    if (isReExplain) {
      if (variation === 2) {
        reExplainStyle = 'المستخدم قال "عيدها"، لذلك لا تكرر نفس الشرح إطلاقاً! اشرح الفكرة هذه المرة باستخدام مثال تطبيقي وسيناريو واقعي ملموس.';
      } else if (variation === 3) {
        reExplainStyle = 'المستخدم قال "عيدها" للمرة الثانية! اشرح الموضوع بتشبيه ذكي (Analogy) يقرب الفكرة لأبسط مستوى يومي.';
      } else {
        reExplainStyle = 'المستخدم يريد إعادة الشرح! قسّم المفهوم إلى 3 أو 4 خطوات متسلسلة (Step-by-step) واضحة ومحددة جداً.';
      }
    }

    const ai = getGemini();

    const systemInstruction = `أنت أفضل مدرس خصوصي ذكي في العراق والعالم العربي في منصة "دَرّسني".
مهمتك شرح الموضوع الدراسي للطلاب بأسلوب شيق وذكي وواضح جداً.

قواعد الشرح الصارمة:
1. اللهجة: استخدم اللهجة العراقية الحبيبة الطبيعية السلسة المحبوبة للطلاب الجامعيين والثانويين (مثل: "شوف عيني"، "الـPathophysiology مالت هذا المرض يعني ببساطة..."، "خليني أوضحلك السالفة"، "ركزلي على هاي النقطة لأن تجيك بالامتحان").
2. المصطلحات العلمية والطبية: احتفظ بالمصطلحات الإنجليزية العلمية والطبية كما هي بحروف إنجليزية (مثل: Action Potential, Glycolysis, Myocardial Infarction, Osmosis) ولا تترجمها ترجمة حرفية ركيكة تفقدها معناها الأكاديمي.
3. الدقة ومنع الاختلاق: استند كلياً إلى سياق الملزمة المرفوعة أدناه.
4. مستوى الشرح المطلوب: ${level} (إذا كان طبي: ركز على Etiology, Pathophysiology, Clinical Features, Diagnosis, Management).
5. أسلوب الشرح: ${style}.
${reExplainStyle}
6. في نهاية الشرح دائماً، اطرح سؤال تحقق تفاعلي قصير وسريع لقياس فهم الطالب.`;

    const prompt = `الملزمة: ${doc.title}
الموضوع: ${topic?.title || 'موضوع دراسي'} (${topic?.titleEn || ''})
ملخص الموضوع: ${topic?.summary || ''}
المفاهيم المفتاحية: ${(topic?.keyConcepts || []).join('، ')}

${customPrompt ? `طلب خاص من الطالب: ${customPrompt}\n` : ''}
اشرح هذا الموضوع الآن بالطريقة المحددة وأعطني سؤال التحقق التفاعلي في النهاية.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction
      }
    });

    res.json({
      explanation: response.text || '',
      topicId: topic?.id,
      topicTitle: topic?.title,
      variation
    });
  } catch (err: any) {
    console.error('Explain error:', err);
    res.status(500).json({
      error: 'صار خلل أثناء تجهيز الشرح، حاول مرة ثانية عيني.',
      details: err?.message
    });
  }
});

// CHAT WITH DOCUMENT
app.post('/api/chat', async (req, res) => {
  try {
    const { documentId, topicId, messages = [], question, userLevel = 'جامعي' } = req.body;

    const docs = readData<any[]>(DOCUMENTS_FILE, []);
    const doc = docs.find((d) => d.id === documentId);
    if (!doc) {
      return res.status(404).json({ error: 'الملزمة غير موجودة' });
    }

    const currentTopic = (doc.topics || []).find((t: any) => t.id === topicId);

    const ai = getGemini();

    const systemInstruction = `أنت المساعد الدراسي الذكي لملزمة "${doc.title}" في منصة "دَرّسني".
المستخدم يتحدث معك حول هذه الملزمة.

قواعد الأمان والنزاهة الصارمة (Anti-Hallucination):
1. المصدر الأساسي والوحيد المعتمد هو محتوى هذه الملزمة.
2. إذا كان السؤال عن معلومة غير موجودة إطلاقاً في الملزمة، يحظر عليك اختلاقها أو نسبها للملزمة. يجب أن تقول بوضوح باللهجة العراقية:
"هاي المعلومة مو مذكورة بالملزمة، بس أگدر أشرحلك إياها من معلوماتي العامة إذا تريد."
3. إذا كنت متأكداً من الصفحة أو القسم، اذكر المرجع بصراحة (مثال: [صفحة 4] أو [قسم: Diagnosis]). وإذا لم تكن متأكداً تماماً من رقم الصفحة، فلا تخترع رقماً عشوائياً.
4. حافظ على المصطلحات العلمية الطبية والأكاديمية باللغة الإنجليزية كما وردت.
5. أجب بأسلوب مشجع وممتع باللهجة العراقية اللطيفة المريحة للطالب.`;

    const context = `
معلومات الملزمة:
العنوان: ${doc.title}
الملخص: ${doc.summary}
الموضوع النشط حالياً: ${currentTopic ? currentTopic.title : 'عام في الملزمة'}
أهم المصطلحات: ${(doc.importantTerms || []).slice(0, 15).map((t: any) => `${t.term} (${t.termEn || ''}): ${t.definition}`).join('\n')}
أهم النقاط الامتحانية: ${(doc.highYieldPoints || []).slice(0, 10).map((h: any) => h.point).join('\n')}
`;

    const historyContents = messages.slice(-6).map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const currentTurn = {
      role: 'user',
      parts: [{ text: `${context}\n\nسؤال الطالب: ${question}` }]
    };

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [...historyContents, currentTurn],
      config: {
        systemInstruction
      }
    });

    const replyText = response.text || '';
    const isExternalKnowledge = replyText.includes('مو مذكورة بالملزمة');

    res.json({
      reply: replyText,
      isExternalKnowledge
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({
      error: 'صار خلل بالرد، جرّب تسأل السؤال مرة ثانية.',
      details: err?.message
    });
  }
});

// GENERATE QUIZ
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { documentId, topicId, count = 5, difficulty = 'Medium', strictlyFromDoc = true } = req.body;

    const docs = readData<any[]>(DOCUMENTS_FILE, []);
    const doc = docs.find((d) => d.id === documentId);
    if (!doc) {
      return res.status(404).json({ error: 'الملزمة غير موجودة' });
    }

    const topic = (doc.topics || []).find((t: any) => t.id === topicId);
    const numQuestions = Math.min(50, Math.max(3, parseInt(count) || 5));

    const ai = getGemini();

    const prompt = `أنشئ اختبار كويز (Quiz) احترافي متكامل مكون من ${numQuestions} أسئلة اختيار من متعدد (MCQ) لملزمة "${doc.title}".
${topic ? `التركيز على موضوع: ${topic.title} (${topic.titleEn || ''})` : 'الأسئلة تغطي مختلف مواضيع الملزمة'}
مستوى الصعوبة: ${difficulty}
${strictlyFromDoc ? 'شرط حاسم: جميع الأسئلة والإجابات يجب أن تكون مستخرجة من محتوى الملزمة فقط ولا تضف معلومات غير موجودة بها.' : ''}

القواعد:
1. كل سؤال يحتوي على 4 خيارات حقيقية ومنطقية.
2. احتفظ بالمصطلحات الطبية والعلمية باللغة الإنجليزية في نص السؤال والخيارات.
3. حدد الخيار الصحيح بـ index من 0 إلى 3.
4. اذكر تفسيراً تعليمياً مقنعاً وواضحاً بالعراقي لسبب صحة هذا الخيار.
5. أرجع الناتج بصيغة JSON حصراً.

المخطط المطلوب:
{
  "questions": [
    {
      "id": "q-1",
      "question": "نص السؤال الواضح مع المصطلحات الإنجليزية",
      "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
      "correctIndex": 1,
      "explanation": "ليش هذا الخيار صح؟ الشرح بالأسلوب العراقي البسيط",
      "sourceCitation": "صفحة 2 أو قسم Pathophysiology",
      "topicId": "${topic ? topic.id : 'all'}"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{"questions":[]}');
    res.json({ questions: parsed.questions || [] });
  } catch (err: any) {
    console.error('Quiz error:', err);
    res.status(500).json({
      error: 'تعذر توليد الاختبار حالياً. حاول تقليل عدد الأسئلة أو إعادة المحاولة.',
      details: err?.message
    });
  }
});

// GENERATE FLASHCARDS
app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { documentId, topicId, count = 10 } = req.body;

    const docs = readData<any[]>(DOCUMENTS_FILE, []);
    const doc = docs.find((d) => d.id === documentId);
    if (!doc) {
      return res.status(404).json({ error: 'الملزمة غير موجودة' });
    }

    const topic = (doc.topics || []).find((t: any) => t.id === topicId);
    const ai = getGemini();

    const prompt = `أنشئ مجموعة بطاقات استذكار Flashcards حقيقية وذكية مأخوذة من ملزمة "${doc.title}".
${topic ? `التركيز على موضوع: ${topic.title}` : 'تغطي أهم المفاهيم والمصطلحات في الملزمة ككل'}
العدد المطلوب: ${count} بطاقة.

القواعد:
1. الوجه الأمامي (Front): سؤال مباشر، مصطلح طبي/علمي، أو مفهوم محوري.
2. الوجه الخلفي (Back): إجابة مركزة، تعريف دقيق، أو نقاط أساسية سهلة التذكر مع المصطلحات الإنجليزية.
3. التنسيق: JSON حصراً.

المخطط:
{
  "flashcards": [
    {
      "id": "card-1",
      "front": "ما هو تعريف الـ ... وما هي مسبباته؟",
      "back": "الجواب المركز والمباشر",
      "page": "ص 4"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{"flashcards":[]}');
    const cards = (parsed.flashcards || []).map((c: any, i: number) => ({
      ...c,
      id: c.id || `card-${i + 1}`,
      documentId,
      topicId: topic?.id,
      repetitions: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
      status: 'new'
    }));

    res.json({ flashcards: cards });
  } catch (err: any) {
    console.error('Flashcards error:', err);
    res.status(500).json({
      error: 'تعذر استخراج البطاقات، يرجى إعادة المحاولة.',
      details: err?.message
    });
  }
});

// GENERATE SUMMARY (Quick, Medium, Detailed, Exam)
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { documentId, summaryType = 'medium' } = req.body;

    const docs = readData<any[]>(DOCUMENTS_FILE, []);
    const doc = docs.find((d) => d.id === documentId);
    if (!doc) {
      return res.status(404).json({ error: 'الملزمة غير موجودة' });
    }

    const ai = getGemini();

    let stylePrompt = '';
    if (summaryType === 'quick') {
      stylePrompt = 'ملخص سريع جداً في نقاط مكثفة (TL;DR) يمكن قراءته في دقيقتين.';
    } else if (summaryType === 'detailed') {
      stylePrompt = 'ملخص مفصل وشامل يمر على كل الأقسام والمواضيع والتفاصيل الفرعية والمصطلحات.';
    } else if (summaryType === 'exam') {
      stylePrompt = 'ملخص امتحاني يركز على الأسئلة المحتملة، الفروقات الهامة، والنقاط التي يخطئ فيها الطلاب عادة.';
    } else {
      stylePrompt = 'ملخص متوسط متوازن يجمع بين وضوح المفاهيم وأهم التفاصيل.';
    }

    const prompt = `اكتب ${stylePrompt} لملزمة "${doc.title}".
استخدم لغة عربية سليمة مطعمة بالمصطلحات الإنجليزية الطبية والعلمية.
نظم الشرح في عناوين واضحة وفقرات منظمة ونقاط بارزة بصيغة Markdown.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt
    });

    res.json({ summary: response.text || '' });
  } catch (err: any) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'تعذر إنشاء الملخص', details: err?.message });
  }
});

// GENERATE CHEAT SHEET ("ورقة الإنقاذ")
app.post('/api/generate-cheatsheet', async (req, res) => {
  try {
    const { documentId } = req.body;

    const docs = readData<any[]>(DOCUMENTS_FILE, []);
    const doc = docs.find((d) => d.id === documentId);
    if (!doc) {
      return res.status(404).json({ error: 'الملزمة غير موجودة' });
    }

    const ai = getGemini();

    const prompt = `أنشئ "ورقة الإنقاذ" (High-Yield Cheat Sheet) الخاصة بملزمة "${doc.title}".
هذه الورقة مخصصة لليلة الامتحان أو المراجعة السريعة قبل الدخول للقاعة.
المطلوب تصنيف المحتوى إلى الأقسام الستة التالية حصراً بصيغة JSON:
1. definitions: أهم 6-10 تعريفات لا يخلو منها امتحان.
2. numbersAndStats: أهم الأرقام، النسب، التراكيز، أو الجرعات أو الإحصائيات الواردة.
3. facts: حقائق قطعية وقواعد ذهبية (Golden Rules).
4. clinicalPoints: نقاط سريرية وعملية جوهرية (مثل: First line treatment, Most common cause, Gold standard).
5. differences: مقارنات وفروقات ثنائية حاسمة (Comparison table/bullets).
6. examPearls: ملاحظات ذكية وفخاخ شائعة (Common Traps & Exam Pearls).

أخرج النتيجة بصيغة JSON:
{
  "title": "ورقة الإنقاذ: ${doc.title}",
  "definitions": [{"term": "...", "termEn": "...", "text": "..."}],
  "numbersAndStats": [{"label": "...", "value": "...", "context": "..."}],
  "facts": ["نص حقيقة 1", "نص حقيقة 2"],
  "clinicalPoints": [{"label": "...", "point": "..."}],
  "differences": [{"feature": "...", "itemA": "...", "itemB": "..."}],
  "examPearls": ["نص الفخ الامتحاني أو اللؤلؤة الامتحانية"]
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ cheatSheet: parsed });
  } catch (err: any) {
    console.error('Cheat sheet error:', err);
    res.status(500).json({ error: 'تعذر إنشاء ورقة الإنقاذ', details: err?.message });
  }
});

// EXPLAIN MEDIA (Table or Figure)
app.post('/api/explain-media', async (req, res) => {
  try {
    const { documentId, mediaType, itemTitle, itemDescription, action } = req.body;

    const docs = readData<any[]>(DOCUMENTS_FILE, []);
    const doc = docs.find((d) => d.id === documentId);
    if (!doc) {
      return res.status(404).json({ error: 'الملزمة غير موجودة' });
    }

    const ai = getGemini();

    let actionPrompt = 'اشرحلي هذا الجزء بالتفصيل باللهجة العراقية الطبيعية.';
    if (action === 'compare') {
      actionPrompt = 'قارنلي بين عناصر هذا الجدول وبين الفوارق الجوهرية التي يسأل عنها الأساتذة.';
    } else if (action === 'important') {
      actionPrompt = 'شنو أهم شي لازم أحفظه وأفهمه من هذا المخطط/الجدول؟ وشنو الأسئلة اللي ممكن تجي عليه؟';
    }

    const prompt = `في ملزمة "${doc.title}":
نوع العنصر: ${mediaType === 'table' ? 'جدول / مقارنة' : 'رسمة توضيحية / مخطط بياني'}
العنوان: ${itemTitle}
الوصف المستخرج: ${itemDescription}
طلب الطالب: ${actionPrompt}

المطلوب: شرح ذكي وشامل وبسيط بالعراقي مع الحفاظ على المصطلحات الإنجليزية.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt
    });

    res.json({ explanation: response.text || '' });
  } catch (err: any) {
    console.error('Media explain error:', err);
    res.status(500).json({ error: 'تعذر شرح العنصر', details: err?.message });
  }
});

// QUICK STUDY SESSION ("ما عندي وقت" أو 5 دقائق)
app.post('/api/quick-study', async (req, res) => {
  try {
    const { documentId, durationMinutes = 5 } = req.body;

    const docs = readData<any[]>(DOCUMENTS_FILE, []);
    const doc = docs.find((d) => d.id === documentId);
    if (!doc) {
      return res.status(404).json({ error: 'الملزمة غير موجودة' });
    }

    const ai = getGemini();

    const prompt = `الطالب عنده وقت ضيق جداً مقداره (${durationMinutes} دقيقة) لدراسة ملزمة "${doc.title}".
أنشئ جلسة دراسية فائقة التركيز مبنية هندسياً على الوقت المحدد بالضبط.
أخرج النتيجة بصيغة JSON:
{
  "durationMinutes": ${durationMinutes},
  "headline": "خطة الإنقاذ السريع لـ ${durationMinutes} دقيقة",
  "focusTopics": ["الموضوع 1", "الموضوع 2"],
  "mustKnowPoints": [
    "النقطة الأولى الأكثر تكراراً بالامتحانات",
    "النقطة الثانية الحيوية",
    "النقطة الثالثة الجوهرية"
  ],
  "quickCheckQuestion": {
    "question": "سؤال سريع لقياس فهمك لأخطر نقطة",
    "answer": "الجواب الصحيح باختصار"
  },
  "tutorMessage": "رسالة تشجيعية عاجلة ومحفزة باللهجة العراقية"
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ quickSession: parsed });
  } catch (err: any) {
    console.error('Quick study error:', err);
    res.status(500).json({ error: 'تعذر تجهيز الجلسة السريعة', details: err?.message });
  }
});

// VOICE CHAT INTERACTION
app.post('/api/voice-chat', async (req, res) => {
  try {
    const { documentId, topicId, transcript, dialect = 'iraqi' } = req.body;

    const docs = readData<any[]>(DOCUMENTS_FILE, []);
    const doc = docs.find((d) => d.id === documentId);
    const docTitle = doc ? doc.title : 'الملزمة الدراسية';

    const ai = getGemini();

    const prompt = `أنت في محادثة صوتية مع طالب يدرس ملزمة "${docTitle}".
الطالب قال بصوته: "${transcript}"
المطلوب الرد عليه باللهجة العراقية الحبيبة بصوت طبيعي ومباشر كما لو كنت تتحدث معه في مكالمة هاتفية أو جلسة وجهاً لوجه.
اجعل الرد مختصراً ومركزاً (من فقرة إلى فقرتين) حتى يسهل قراءته بالصوت، مع ذكر المصطلحات الإنجليزية بوضوح.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt
    });

    res.json({ replyText: response.text || '' });
  } catch (err: any) {
    console.error('Voice chat error:', err);
    res.status(500).json({ error: 'تعذر معالجة الصوت', details: err?.message });
  }
});

// USER PROFILE ROUTES
app.get('/api/profile', (req, res) => {
  const users = readData<any[]>(USERS_FILE, []);
  const user = users[0] || {
    id: 'user_default',
    name: 'طالب دَرّسني',
    email: 'student@darrasni.iq',
    isGuest: false,
    specialization: 'Medicine',
    academicLevel: 'السنة الثالثة',
    dialect: 'iraqi',
    explanationLevel: 'medium',
    explanationStyle: 'tutor',
    keepEnglishTerms: true,
    useAnalogies: true,
    useEmojis: true,
    theme: 'system',
    xp: 250,
    level: 2,
    streak: 3,
    lastStudyDate: new Date().toISOString(),
    totalStudyMinutes: 45,
    topicsCompletedCount: 4,
    quizzesTakenCount: 2,
    flashcardsMasteredCount: 15
  };
  res.json({ profile: user });
});

app.put('/api/profile', (req, res) => {
  const users = readData<any[]>(USERS_FILE, []);
  const updatedUser = { ...(users[0] || {}), ...req.body };
  writeData(USERS_FILE, [updatedUser]);
  res.json({ profile: updatedUser });
});

// AWARD XP & STATS HELPER
app.post('/api/award-xp', (req, res) => {
  const { amount = 50, action = 'study' } = req.body;
  const users = readData<any[]>(USERS_FILE, []);
  const user = users[0] || {
    id: 'user_default',
    name: 'طالب دَرّسني',
    xp: 0,
    level: 1,
    streak: 1,
    totalStudyMinutes: 0
  };

  user.xp = (user.xp || 0) + amount;
  user.level = Math.floor(user.xp / 200) + 1;

  if (action === 'timer' && req.body.minutes) {
    user.totalStudyMinutes = (user.totalStudyMinutes || 0) + req.body.minutes;
  } else if (action === 'topic') {
    user.topicsCompletedCount = (user.topicsCompletedCount || 0) + 1;
  } else if (action === 'quiz') {
    user.quizzesTakenCount = (user.quizzesTakenCount || 0) + 1;
  } else if (action === 'flashcard') {
    user.flashcardsMasteredCount = (user.flashcardsMasteredCount || 0) + 1;
  }

  writeData(USERS_FILE, [user]);
  res.json({ success: true, xp: user.xp, level: user.level, awarded: amount });
});

// ==========================================
// VITE MIDDLEWARE & SERVER STARTUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`دَرّسني Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
