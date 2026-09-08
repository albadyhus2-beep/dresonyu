# دليل رفع ونشر تطبيق دَرّسني

## لماذا مو Netlify أو Cloudflare Pages؟
تطبيقك عنده سيرفر Node.js حقيقي (Express) يسوي:
- استدعاء Gemini API بمفتاح سري من السيرفر
- رفع ومعالجة ملفات PDF (multer + pdf-parse)
- تخزين بيانات بملفات JSON على القرص (data/documents.json, data/users.json)

هذا النوع من التطبيقات يحتاج سيرفر يشتغل باستمرار (long-running process)، وهذا غير متوفر
بشكل مباشر بـ Netlify / Cloudflare Pages (مصممة للمواقع الثابتة أو دوال قصيرة العمر بلا حالة).
لذلك الخيار الصحيح هو **Render** أو **Railway** — نفس فكرة Cloud Run اللي كان AI Studio يستخدمها.

ملاحظة عن التخزين: على الخطة المجانية بـ Render، ملفات data/*.json تنمسح كل ما تعيد نشر
التطبيق (النظام مؤقت/ephemeral). إذا تريد تخزين دائم فعلاً، بعدين نقدر نربطه بقاعدة بيانات
مثل Postgres أو نستخدم Render Disk (تخزين دائم مدفوع بسيط).

---

## الخطوة 1: رفع المشروع على GitHub

المشروع جاهز الحين وفيه git repo محلي وأول commit. اسوي هذا من جهازك (مو من هنا، لأن
عندي أنا وصول محظور للإنترنت تماماً):

1. سوي مستودع جديد فاضي على GitHub (بدون README أو .gitignore جاهز): https://github.com/new
2. حمّل مجلد المشروع (ZIP) اللي راح أرفعه لك وفكه عندك.
3. من داخل مجلد المشروع، بالـ Terminal:

```bash
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

(بدّل USERNAME/REPO_NAME باسم حسابك واسم المستودع.)

---

## الخطوة 2: النشر على Render (الطريقة الموصى فيها)

1. سوي حساب مجاني على https://render.com وربطه بحساب GitHub مالك.
2. اضغط **New +** → **Web Service** واختار المستودع اللي رفعته.
3. Render رح يقرأ ملف `render.yaml` الموجود بالمشروع تلقائياً ويعبي الإعدادات:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. بس لازم تضيف يدوياً متغير البيئة السري (ما ينحط بملف render.yaml لأسباب أمنية):
   - `GEMINI_API_KEY` = مفتاح Gemini API مالك (تحصله من https://aistudio.google.com/apikey)
5. اضغط **Create Web Service** وانتظر البناء (أول مرة تاخذ 3-5 دقائق).
6. بعد ما يخلص، رح يعطيك رابط شكله: `https://darrasni.onrender.com`

**ملاحظة:** الخطة المجانية بـ Render "تنام" التطبيق إذا ما فيه زيارات لمدة 15 دقيقة، وأول
طلب بعدها ياخذ 30-50 ثانية للاستيقاظ. إذا مضايقتك هاي، بعدين ترقي لخطة مدفوعة رخيصة.

---

## بديل: Railway

نفس الفكرة تماماً:
1. https://railway.app → New Project → Deploy from GitHub repo
2. أضف متغير البيئة `GEMINI_API_KEY`
3. Railway يكتشف تلقائياً `npm run build` و `npm start` من package.json

---

## تشغيل محلي للتجربة قبل الرفع

```bash
npm install
cp .env.example .env.local
# عدّل .env.local وحط مفتاح GEMINI_API_KEY الحقيقي
npm run dev
```

يفتح على http://localhost:3000
