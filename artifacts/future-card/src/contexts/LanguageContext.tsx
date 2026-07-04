import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.create': 'Create Memory',
    'hero.title': 'A Letter to the Future',
    'hero.subtitle': 'Create a sacred, beautiful digital memory card for your little one. Let them see who they can become, and hear how much you believe in them.',
    'hero.cta': 'Start Creating',
    'step.1': 'Photo',
    'step.2': 'Profession',
    'step.3': 'Voice',
    'step.4': 'Magic',
    'step1.title': 'Upload a photo of your little one',
    'step1.subtitle': 'We will use this to generate a realistic future memory.',
    'step1.drag': 'Drag & drop a photo here',
    'step1.or': 'or',
    'step1.browse': 'Browse Files',
    'step1.takePhoto': 'Take Photo',
    'step2.title': 'What do they dream of becoming?',
    'step2.subtitle': 'Choose a future profession to inspire them.',
    'step2.other': 'Other...',
    'step2.otherPlaceholder': 'Type a custom profession',
    'step3.title': 'Record your message',
    'step3.subtitle': 'Leave a voice note they will treasure forever.',
    'step3.prompt': '"Dear my little one... if you\'re listening to this, I\'m so proud of you..."',
    'step3.record': 'Record',
    'step3.stop': 'Stop',
    'step3.play': 'Play',
    'step3.rerecord': 'Record Again',
    'step3.upload': 'Upload Audio',
    'step4.title': 'Creating your memory...',
    'step4.wait': 'Please wait while we craft something beautiful.',
    'step4.uploading': 'Uploading photo ☁️',
    'step4.generating': 'Generating realistic future outfit 🎨',
    'step4.enhancing': 'Enhancing image ✨',
    'step4.saving': 'Saving memory 💾',
    'step4.creatingQr': 'Creating QR Code 📱',
    'common.next': 'Continue',
    'common.back': 'Back',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.share': 'Share',
    'common.download': 'Download',
    'dashboard.title': 'Your Memories',
    'dashboard.empty': 'Create your first memory card',
    'dashboard.stats.total': 'Total Cards',
    'dashboard.stats.completed': 'Completed',
    'dashboard.stats.generating': 'In Progress',
    'card.status.draft': 'Draft',
    'card.status.generating': 'Generating...',
    'card.status.completed': 'Ready',
    'card.playMessage': 'Play Voice Message',
    'card.scanToShare': 'Scan to share this memory',
    'card.createAnother': 'Create Another Card',
    'card.print': 'Print Card',
    'prof.doctor': 'Doctor',
    'prof.pilot': 'Pilot',
    'prof.engineer': 'Engineer',
    'prof.teacher': 'Teacher',
    'prof.police': 'Police Officer',
    'prof.firefighter': 'Firefighter',
    'prof.astronaut': 'Astronaut',
    'prof.chef': 'Chef',
    'prof.football': 'Football Player',
    'prof.scientist': 'Scientist',
    'prof.artist': 'Artist',
    'prof.entrepreneur': 'Entrepreneur',
    'prof.other': 'Other',
    'memory.brand': 'Future Card',
  },
  ar: {
    'nav.dashboard': 'لوحة التحكم',
    'nav.create': 'إنشاء ذكرى',
    'hero.title': 'رسالة إلى المستقبل',
    'hero.subtitle': 'اصنع بطاقة ذكرى رقمية مقدسة وجميلة لصغيرك. دعهم يرون من يمكنهم أن يصبحوا، ويستمعون إلى مدى إيمانك بهم.',
    'hero.cta': 'ابدأ الإنشاء',
    'step.1': 'الصورة',
    'step.2': 'المهنة',
    'step.3': 'الصوت',
    'step.4': 'السحر',
    'step1.title': 'ارفع صورة لصغيرك',
    'step1.subtitle': 'سنستخدم هذا لإنشاء ذكرى مستقبلية واقعية.',
    'step1.drag': 'اسحب وأفلت صورة هنا',
    'step1.or': 'أو',
    'step1.browse': 'تصفح الملفات',
    'step1.takePhoto': 'التقط صورة',
    'step2.title': 'بماذا يحلمون أن يصبحوا؟',
    'step2.subtitle': 'اختر مهنة مستقبلية لإلهامهم.',
    'step2.other': 'أخرى...',
    'step2.otherPlaceholder': 'اكتب مهنة مخصصة',
    'step3.title': 'سجل رسالتك',
    'step3.subtitle': 'اترك ملاحظة صوتية سيعتزون بها إلى الأبد.',
    'step3.prompt': '"عزيزي الصغير... إذا كنت تستمع إلى هذا، فأنا فخور جداً بك..."',
    'step3.record': 'تسجيل',
    'step3.stop': 'إيقاف',
    'step3.play': 'تشغيل',
    'step3.rerecord': 'إعادة التسجيل',
    'step3.upload': 'رفع ملف صوتي',
    'step4.title': 'جاري إنشاء ذكراك...',
    'step4.wait': 'يرجى الانتظار بينما نصنع شيئاً جميلاً.',
    'step4.uploading': 'جاري رفع الصورة ☁️',
    'step4.generating': 'جاري إنشاء الزي المستقبلي 🎨',
    'step4.enhancing': 'جاري تحسين الصورة ✨',
    'step4.saving': 'جاري حفظ الذكرى 💾',
    'step4.creatingQr': 'جاري إنشاء رمز QR 📱',
    'common.next': 'متابعة',
    'common.back': 'رجوع',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.share': 'مشاركة',
    'common.download': 'تحميل',
    'dashboard.title': 'ذكرياتك',
    'dashboard.empty': 'أنشئ بطاقة ذكراك الأولى',
    'dashboard.stats.total': 'إجمالي البطاقات',
    'dashboard.stats.completed': 'مكتملة',
    'dashboard.stats.generating': 'قيد المعالجة',
    'card.status.draft': 'مسودة',
    'card.status.generating': 'جاري الإنشاء...',
    'card.status.completed': 'جاهز',
    'card.playMessage': 'استمع للرسالة',
    'card.scanToShare': 'امسح لمشاركة هذه الذكرى',
    'card.createAnother': 'إنشاء بطاقة أخرى',
    'card.print': 'طباعة البطاقة',
    'prof.doctor': 'طبيب',
    'prof.pilot': 'طيار',
    'prof.engineer': 'مهندس',
    'prof.teacher': 'معلم',
    'prof.police': 'ضابط شرطة',
    'prof.firefighter': 'رجل إطفاء',
    'prof.astronaut': 'رائد فضاء',
    'prof.chef': 'طاهٍ',
    'prof.football': 'لاعب كرة قدم',
    'prof.scientist': 'عالم',
    'prof.artist': 'فنان',
    'prof.entrepreneur': 'رائد أعمال',
    'prof.other': 'أخرى',
    'memory.brand': 'بطاقة المستقبل',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    if (language === 'ar') {
      document.body.style.fontFamily = 'var(--font-arabic)';
    } else {
      document.body.style.fontFamily = 'var(--font-sans)';
    }
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL: language === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
