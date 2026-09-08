import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Upload, 
  Flame, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  FileText, 
  ShieldAlert, 
  Image as ImageIcon, 
  Clock, 
  ArrowLeft,
  ChevronLeft,
  Zap,
  Award,
  Stethoscope,
  Brain
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onTryDemo: () => void;
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onTryDemo, onOpenLogin }) => {
  const features = [
    {
      title: 'رفع وتحليل الملازم بدقة',
      description: 'نظام رؤية بصرية للتعامل مع ملفات PDF المصورة والنصية والجداول والمخططات بدون فقدان الصفحات.',
      icon: Upload,
      badge: 'Vision & Text'
    },
    {
      title: 'شرح عراقي طبيعي وسلس',
      description: 'مدرسك الخصوصي يشرحلك بلهجتنا اليومية المريحة، مع الحفاظ على المصطلحات العلمية والطبية بالإنجليزية.',
      icon: Sparkles,
      badge: 'عراقي 100%'
    },
    {
      title: 'Chat ذكي مرتبط بالملزمة',
      description: 'اسأل عن أي نقطة؛ الذكاء الاصطناعي يستند للملزمة فقط ويمنع الفبركة، وإذا مو مذكورة يوضحلك ذلك.',
      icon: Brain,
      badge: 'Zero Hallucination'
    },
    {
      title: 'اختبارات Quiz تفاعلية',
      description: 'اختر عدد الأسئلة والصعوبة مع تحليل لنقاط ضعفك وقوتك وتوصيات امتحانية دقيقة.',
      icon: HelpCircle,
      badge: 'MCQs & Analytics'
    },
    {
      title: 'بطاقات فلاش كاردز (SRS)',
      description: 'خوارزمية التكرار المتباعد (Spaced Repetition) لتثبيت أصعب المفاهيم والجرعات والتعريفات في الذاكرة طويلة المدى.',
      icon: Layers,
      badge: 'Spaced Repetition'
    },
    {
      title: '🔥 ورقة الإنقاذ (Cheat Sheet)',
      description: 'صفحة مكثفة لليلة الامتحان تحتوي على أهم الأرقام، الفروقات، الفخاخ، والـ High-Yield Facts.',
      icon: ShieldAlert,
      badge: 'High-Yield'
    },
    {
      title: 'شرح الصور والمخططات',
      description: 'تحديد الجداول والرسومات البيانية في ملزمتك وشرحها والمقارنة بين عناصرها بضغطة زر واحدة.',
      icon: ImageIcon,
      badge: 'Visual Tutor'
    },
    {
      title: 'وضع "ما عندي وقت"',
      description: 'عندك 10 دقائق أو نصف ساعة قبل المحاضرة؟ دَرّسني يركزلك على أخطر النقاط التي تسألون عنها دائماً.',
      icon: Clock,
      badge: 'Fast Cramming'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-500">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight">دَرّسني</span>
            <span className="mr-1.5 text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 font-semibold">
              AI Tutor
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLogin}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            تسجيل الدخول
          </button>
          <button
            onClick={onStart}
            className="px-4 sm:px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-indigo-600/20 active:scale-95 transition-all"
          >
            ابدأ الدراسة الآن
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>منصة الدراسة الذكية للطلاب والجامعيين</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.25] mb-6">
            دَرّسني
            <span className="block text-2xl sm:text-3xl font-medium text-slate-600 dark:text-slate-300 mt-3">
              "أرفع ملزمتك... وخلي الباقي علينا."
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            مدرسك الذكي الذي يقرأ ملزمتك، يفهمها، ويشرحها إلك بطريقة تناسبك. من تلخيص الفصول المعقدة إلى اختبارات الـ MCQs وشرح الجداول باللهجة العراقية.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>ابدأ الدراسة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Stethoscope className="w-4 h-4 text-rose-500" />
              <span>جرّب ملزمة طبية جاهزة</span>
            </button>
          </div>

          {/* Highlights Row */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">PDF & Scanned</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">تحليل النصوص والصور</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">عراقي 100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">شرح عفوي ومفهوم</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Spaced Repetition</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">بطاقات ذكية للمذاكرة</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-amber-500">ورقة الإنقاذ</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ملخصات ليلة الامتحان</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            كل الأدوات التي يحتاجها الطالب في مكان واحد
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            صممنا "دَرّسني" ليتعامل مع أدق التفاصيل الأكاديمية والطبية والهندسية بدون فبركة أو إجابات سطحية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all text-right group shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                    {f.badge}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Sample Explanation Preview Box */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-semibold text-slate-500 mr-2">
                معاينة حية لأسلوب الشرح العراقي
              </span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium">
              Medical Mode • Pathophysiology
            </span>
          </div>

          <div className="space-y-3 font-sans text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            <p className="font-semibold text-indigo-600 dark:text-indigo-400">
              سؤال الطالب: "ممكن تشرحلي ليش يصير Orthopnea في مرضى الـ Heart Failure؟"
            </p>
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <p className="mb-2">
                "شوف عيني، الـ <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">Orthopnea</span> مالت المريض سالفتها ببساطة فيزيائية بحتة:
              </p>
              <p className="mb-2">
                لما المريض يكون واگف أو گاعد، الجاذبية الأرضية تجمع السوائل بالـ lower limbs. بس أول ما يمدد مستوي على ظهره، تقريباً 500 إلى 1000 مل من الدم ترجع فجأة للقلب (<span className="font-semibold">Venous Return</span> يزيد).
              </p>
              <p>
                الـ Left Ventricle التعبان ميكدر يضخ هاي الكمية الزايدة، فيصير <span className="font-semibold">Back Pressure</span> على الأوعية الرئوية ويرتفع الضغط الشعيري، وتبدي السوائل تطلع للحويصلات الهوائية فيحس المريض كأنه ديختنگ ويضطر يگعد فوراً!"
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              هل أعجبك الأسلوب؟ جرب رفع ملزمتك الآن واحصل على نفس الشرح الفوري.
            </span>
            <button
              onClick={onStart}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              جرّب ملزمتك الآن
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="mb-1 font-semibold text-slate-700 dark:text-slate-300">دَرّسني - المنصة الأكاديمية الذكية</p>
        <p>"أرفع ملزمتك... وخلي الباقي علينا." • بنيت لخدمة الطلاب والجامعيين في العراق والعالم العربي</p>
      </footer>
    </div>
  );
};
