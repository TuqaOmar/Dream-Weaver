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
    'nav.toggleLanguage': 'Toggle language',
    'hero.title': 'A Letter to the Future',
    'hero.subtitle': 'Create a sacred, beautiful digital memory card for your little one. Let them see who they can become, and hear how much you believe in them.',
    'hero.cta': 'Start Creating',
    'hero.badge': 'A magical keepsake for your child',
    'home.magic.title': 'A touch of magic',
    'home.magic.description': 'Preserve their photo as a beautiful memory for the future.',
    'home.voice.title': 'A voice to remember',
    'home.voice.description': 'Leave a voice message they can listen to whenever they need it.',
    'home.qr.title': 'A memory to share',
    'home.qr.description': 'Print it and share it with family through a QR code.',
    'step.1': 'Photo',
    'step.2': 'Voice',
    'step.3': 'Finishing',
    'step1.title': 'Upload a photo of your little one',
    'step1.subtitle': 'We will use this to generate a realistic future memory.',
    'step1.drag': 'Drag & drop a photo here',
    'step1.or': 'or',
    'step1.browse': 'Browse Files',
    'step1.takePhoto': 'Take Photo',
    'step1.change': 'Change Photo',
    'step1.name': 'Child name',
    'step1.namePlaceholder': 'Write your child’s name',
    'step3.title': 'Record your message',
    'step3.subtitle': 'Leave a voice note they will treasure forever.',
    'step3.prompt': '"Dear my little one... if you\'re listening to this, I\'m so proud of you..."',
    'step3.record': 'Record',
    'step3.stop': 'Stop',
    'step3.play': 'Play',
    'step3.rerecord': 'Record Again',
    'step3.upload': 'Upload Audio',
    'step3.audioReady': 'Audio ready',
    'step3.writtenMessage': 'Write a message (optional)',
    'step3.writtenPlaceholder': 'I will always be your biggest fan...',
    'step4.title': 'Preserving your memory...',
    'step4.wait': 'Please wait while we add the finishing touches.',
    'step4.uploading': 'Uploading photo ☁️',
    'step4.generating': 'Preserving the original photo 🎨',
    'step4.enhancing': 'Adding a beautiful memory frame ✨',
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
    'common.loading': 'Loading...',
    'common.cardNotFound': 'Card not found.',
    'common.memoryNotFound': 'Memory not found.',
    'common.noImage': 'No image available.',
    'common.noImageGenerated': 'No image has been prepared yet.',
    'common.generatingQr': 'Generating QR code...',
    'common.noQr': 'No QR code',
    'common.linkCopied': 'Link copied to clipboard!',
    'common.confirmDelete': 'Are you sure you want to delete this memory?',
    'common.childPhotoAlt': 'Child photo',
    'common.qrAlt': 'QR code',
    'dashboard.title': 'Your Memories',
    'dashboard.description': 'Manage and cherish your digital memories.',
    'dashboard.searchPlaceholder': 'Search by child name...',
    'dashboard.empty': 'Create your first memory card',
    'dashboard.emptyDescription': 'Your memories will appear here. Start creating your first beautiful keepsake.',
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
    'card.backDashboard': 'Back to Dashboard',
    'card.preparing': 'Preparing your framed memory...',
    'card.shareMemoryTitle': 'Share this memory',
    'card.shareLink': 'Share link',
    'card.storageTitle': 'About memory storage',
    'card.storageDescription': 'This memory is securely stored. You can access it anytime from your dashboard or through its unique link.',
    'memory.listen': 'Listen to the message',
    'memory.createdOn': 'Created on:',
    'error.genericTitle': 'Something went wrong',
    'error.tryAgain': 'Please try again later.',
    'error.finishTitle': 'We could not finish your memory',
    'error.finishDescription': 'Please try again. Your photo and message are safe.',
    'error.microphone': 'Could not access the microphone. Please check permissions or upload an audio file instead.',
    'notFound.title': '404 Page Not Found',
    'notFound.description': 'The page you are looking for could not be found.',
    'memory.brand': 'Future Card',
  },
  ar: {
    'nav.dashboard': 'لوحة التحكم',
    'nav.create': 'إنشاء ذكرى',
    'nav.toggleLanguage': 'تغيير اللغة',
    'hero.title': 'رسالة إلى المستقبل',
    'hero.subtitle': 'اصنع بطاقة ذكرى رقمية مقدسة وجميلة لصغيرك. دعهم يرون من يمكنهم أن يصبحوا، ويستمعون إلى مدى إيمانك بهم.',
    'hero.cta': 'ابدأ الإنشاء',
    'hero.badge': 'ذكرى جميلة لطفلك',
    'home.magic.title': 'لمسة من الخيال',
    'home.magic.description': 'احفظ صورته كذكرى جميلة للمستقبل.',
    'home.voice.title': 'صوت لا يُنسى',
    'home.voice.description': 'اترك رسالة صوتية ليستمع إليها كلما احتاج إليها.',
    'home.qr.title': 'ذكرى قابلة للمشاركة',
    'home.qr.description': 'اطبعها وشاركها مع العائلة عبر رمز QR.',
    'step.1': 'الصورة',
    'step.2': 'الصوت',
    'step.3': 'التجهيز',
    'step1.title': 'ارفع صورة لصغيرك',
    'step1.subtitle': 'سنستخدم هذا لإنشاء ذكرى مستقبلية واقعية.',
    'step1.drag': 'اسحب وأفلت صورة هنا',
    'step1.or': 'أو',
    'step1.browse': 'تصفح الملفات',
    'step1.takePhoto': 'التقط صورة',
    'step1.change': 'تغيير الصورة',
    'step1.name': 'اسم الطفل',
    'step1.namePlaceholder': 'اكتب اسم طفلك',
    'step3.title': 'سجل رسالتك',
    'step3.subtitle': 'اترك ملاحظة صوتية سيعتزون بها إلى الأبد.',
    'step3.prompt': '"عزيزي الصغير... إذا كنت تستمع إلى هذا، فأنا فخور جداً بك..."',
    'step3.record': 'تسجيل',
    'step3.stop': 'إيقاف',
    'step3.play': 'تشغيل',
    'step3.rerecord': 'إعادة التسجيل',
    'step3.upload': 'رفع ملف صوتي',
    'step3.audioReady': 'الصوت جاهز',
    'step3.writtenMessage': 'اكتب رسالة (اختياري)',
    'step3.writtenPlaceholder': 'سأبقى دائماً أكبر مشجع لك...',
    'step4.title': 'جاري تجهيز ذكراك...',
    'step4.wait': 'يرجى الانتظار بينما نضيف اللمسات الأخيرة.',
    'step4.uploading': 'جاري رفع الصورة ☁️',
    'step4.generating': 'جاري الحفاظ على الصورة الأصلية 🎨',
    'step4.enhancing': 'جاري إضافة إطار جميل للذكرى ✨',
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
    'common.loading': 'جاري التحميل...',
    'common.cardNotFound': 'لم يتم العثور على البطاقة.',
    'common.memoryNotFound': 'لم يتم العثور على الذكرى.',
    'common.noImage': 'لا توجد صورة متاحة.',
    'common.noImageGenerated': 'لم يتم تجهيز الصورة بعد.',
    'common.generatingQr': 'جاري إنشاء رمز QR...',
    'common.noQr': 'لا يوجد رمز QR',
    'common.linkCopied': 'تم نسخ الرابط!',
    'common.confirmDelete': 'هل أنت متأكد من حذف هذه الذكرى؟',
    'common.childPhotoAlt': 'صورة الطفل',
    'common.qrAlt': 'رمز QR',
    'dashboard.title': 'ذكرياتك',
    'dashboard.description': 'احفظ ذكرياتك الرقمية واعتز بها.',
    'dashboard.searchPlaceholder': 'ابحث باسم الطفل...',
    'dashboard.empty': 'أنشئ بطاقة ذكراك الأولى',
    'dashboard.emptyDescription': 'ستظهر ذكرياتك هنا. ابدأ بإنشاء أول بطاقة جميلة.',
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
    'card.backDashboard': 'العودة إلى لوحة التحكم',
    'card.preparing': 'جاري تجهيز إطار الذكرى...',
    'card.shareMemoryTitle': 'مشاركة هذه الذكرى',
    'card.shareLink': 'مشاركة الرابط',
    'card.storageTitle': 'حول حفظ الذكرى',
    'card.storageDescription': 'تم حفظ هذه الذكرى بأمان. يمكنك الوصول إليها في أي وقت من لوحة التحكم أو عبر الرابط الفريد.',
    'memory.listen': 'استمع إلى الرسالة',
    'memory.createdOn': 'تاريخ الإنشاء:',
    'error.genericTitle': 'حدث خطأ',
    'error.tryAgain': 'يرجى المحاولة مرة أخرى لاحقاً.',
    'error.finishTitle': 'تعذر إكمال الذكرى',
    'error.finishDescription': 'حاول مرة أخرى. صورتك ورسالتك محفوظتان.',
    'error.microphone': 'تعذر الوصول إلى الميكروفون. يرجى التحقق من الأذونات أو رفع ملف صوتي بدلاً من ذلك.',
    'notFound.title': '404 الصفحة غير موجودة',
    'notFound.description': 'تعذر العثور على الصفحة التي تبحث عنها.',
    'memory.brand': 'بطاقة المستقبل',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

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
