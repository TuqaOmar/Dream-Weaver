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
    "nav.dashboard": "My cards",
    "nav.create": "New card",
    "nav.toggleLanguage": "Language",
    "memory.brand": "Future Card",
    "hero.badge": "A keepsake card with a voice inside",
    "hero.title": "A framed photo that speaks when it’s scanned",
    "hero.subtitle": "Upload a photo, add a voice message, and print a beautiful card. Scanning its QR code opens the recording on Google Drive — instantly, on any phone.",
    "hero.cta": "Create a card",
    "hero.secondary": "View my cards",
    "hero.point1": "Voice saved to Google Drive",
    "hero.point2": "Print-ready PNG",
    "hero.point3": "Original photo, never cropped",
    "home.demoName": "Areej",
    "home.how.eyebrow": "How it works",
    "home.how.title": "Three steps from photo to printed keepsake",
    "home.step1.title": "Add the photo",
    "home.step1.body": "Upload or snap a photo and write the child’s name. It is framed exactly as it is — no cropping.",
    "home.step2.title": "Record the voice",
    "home.step2.body": "Record a message, upload an audio file, or paste a Google Drive link.",
    "home.step3.title": "Print & scan",
    "home.step3.body": "Download the framed card. Anyone who scans the QR code hears the message on Google Drive.",
    "home.band.title": "Ready to make one?",
    "home.band.body": "It takes about two minutes.",
    "wizard.progress": "Progress",
    "step.1": "Photo",
    "step.2": "Voice",
    "step.3": "Done",
    "step1.title": "Start with a photo",
    "step1.subtitle": "Choose a clear photo — it will be framed without cropping.",
    "step1.drag": "Drop a photo or click to choose",
    "step1.hint": "JPG, PNG or HEIC",
    "step1.browse": "Choose photo",
    "step1.takePhoto": "Use camera",
    "step1.change": "Change photo",
    "step1.lowRes": "This photo is small and may print blurry.",
    "step1.goodRes": "Great quality for printing",
    "step1.name": "Child’s name",
    "step1.namePlaceholder": "e.g. Areej",
    "step3.title": "Add the voice message",
    "step3.subtitle": "This is what people will hear when they scan the card.",
    "step3.note.driveAuto": "Your recording will be uploaded to Google Drive. The QR code opens it directly.",
    "step3.note.driveLink": "The QR code will open this Google Drive link directly.",
    "step3.note.site": "Google Drive isn’t connected on the server yet, so the recording is saved on this site and the QR opens its listening page. To use Drive now, choose “Drive link”.",
    "step3.tab.record": "Record",
    "step3.tab.upload": "Upload file",
    "step3.tab.drive": "Drive link",
    "step3.prompt": "“My little one… if you are listening to this, know how proud I am of you.”",
    "step3.record": "Start recording",
    "step3.stop": "Stop recording",
    "step3.tapToRecord": "Tap to record (up to 5 minutes)",
    "step3.rerecord": "Remove",
    "step3.audioReady": "Ready",
    "step3.upload": "Choose an audio file",
    "step3.uploadHint": "MP3, M4A, WAV, WEBM · up to {max} MB",
    "step3.tooLarge": "This file is {size} MB — the limit is {max} MB. Upload it to Google Drive yourself and use “Drive link” instead.",
    "step3.driveLabel": "Google Drive link to the audio file",
    "step3.driveInvalid": "That doesn’t look like a Google Drive file or folder link.",
    "step3.driveFileOk": "Drive file link recognised",
    "step3.driveFolderOk": "Drive folder link recognised",
    "step3.driveHelp1": "Upload the recording to your Google Drive.",
    "step3.driveHelp2": "Share → General access → “Anyone with the link” (Viewer).",
    "step3.driveHelp3": "Copy the link and paste it here.",
    "step3.writtenMessage": "Written message (optional)",
    "step3.writtenPlaceholder": "I will always be your biggest fan…",
    "step3.finish": "Create the card",
    "step4.title": "Preparing your card",
    "step4.wait": "This only takes a few seconds.",
    "step4.photo": "Optimising the photo",
    "step4.voice": "Uploading the voice message",
    "step4.voiceDrive": "Linking Google Drive",
    "step4.saving": "Saving the card",
    "step4.creatingQr": "Generating the QR code",
    "frame.scanCaption": "Scan to listen ♡",
    "card.backDashboard": "My cards",
    "card.createAnother": "New card",
    "card.ready": "Your card is ready",
    "card.download": "Download PNG",
    "card.print": "Print",
    "card.shareLink": "Share",
    "card.downloadFailed": "Could not create the image. Please try again.",
    "card.frameStyle": "Frame style",
    "card.qrOpens": "Scanning the QR opens",
    "card.listenPage": "Listening page",
    "card.testLink": "Test it",
    "card.useDrive": "Use a Drive link",
    "card.changeDrive": "Change link",
    "card.driveEditHint": "Saving replaces the QR code. Re-download the card after changing it.",
    "card.linkSaved": "Link saved — QR code updated",
    "card.playMessage": "Voice message",
    "card.printTip": "Tip: print at 10×15 cm or larger so the QR scans easily.",
    "card.deletePhoto": "Delete photo from server",
    "card.deletePhotoConfirm": "Delete the photo from the server? The card preview will no longer show it.",
    "player.play": "Play",
    "player.pause": "Pause",
    "player.restart": "Restart",
    "player.driveTitle": "Voice message on Google Drive",
    "player.openDrive": "Open in Google Drive",
    "player.openDriveFolder": "Open the Google Drive folder",
    "listen.eyebrow": "A voice message for",
    "listen.openingDrive": "Opening the recording on Google Drive…",
    "listen.noVoice": "No voice recording on this card.",
    "listen.notFoundBody": "Please check the link or QR code.",
    "listen.recordedOn": "Recorded with love on",
    "dashboard.title": "My cards",
    "dashboard.description": "Every card you’ve made, ready to reprint or share.",
    "dashboard.searchPlaceholder": "Search by name…",
    "dashboard.stats.total": "Cards",
    "dashboard.stats.completed": "Ready",
    "dashboard.empty": "No cards yet",
    "dashboard.emptyDescription": "Make your first card — it takes about two minutes.",
    "common.next": "Continue",
    "common.back": "Back",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.copy": "Copy",
    "common.copied": "Copied",
    "common.cardNotFound": "Card not found.",
    "common.memoryNotFound": "We couldn’t find this card.",
    "common.noImageGenerated": "No photo on this card.",
    "common.noQr": "No QR",
    "common.qrAlt": "QR code",
    "common.childPhotoAlt": "Child photo",
    "common.confirmDelete": "Delete this card permanently?",
    "error.genericTitle": "Something went wrong",
    "error.tryAgain": "Please try again.",
    "error.database": "The site can’t reach its database right now. Check DATABASE_URL in Vercel (see /api/healthz?db=1).",
    "error.fileTooLarge": "The audio file is too large. Use a Google Drive link instead.",
    "error.uploadVoice": "Could not upload the voice message.",
    "error.microphone": "Couldn’t access the microphone. You can upload an audio file instead.",
    "error.micPermission": "Please allow microphone access in your browser settings.",
    "warn.driveFailedTitle": "Saved on the site instead of Drive",
    "warn.driveFailedBody": "Google Drive didn’t accept the upload, so the QR will open the listening page. Check the Drive settings on Vercel.",
    "notFound.title": "Page not found",
    "notFound.description": "The page you’re looking for doesn’t exist.",
    "notFound.home": "Back home",
  },
  ar: {
    "nav.dashboard": "بطاقاتي",
    "nav.create": "بطاقة جديدة",
    "nav.toggleLanguage": "اللغة",
    "memory.brand": "بطاقة المستقبل",
    "hero.badge": "بطاقة تذكارية بداخلها صوت",
    "hero.title": "صورة في إطار… تتكلّم عند مسحها",
    "hero.subtitle": "ارفع صورة، أضف رسالة صوتية، واطبع بطاقة أنيقة. عند مسح رمز QR تُفتح التسجيلة مباشرةً على Google Drive من أي جوال.",
    "hero.cta": "أنشئ بطاقة",
    "hero.secondary": "عرض بطاقاتي",
    "hero.point1": "الصوت محفوظ على Google Drive",
    "hero.point2": "ملف PNG جاهز للطباعة",
    "hero.point3": "الصورة الأصلية بدون قص",
    "home.demoName": "أريج",
    "home.how.eyebrow": "طريقة العمل",
    "home.how.title": "ثلاث خطوات من الصورة إلى بطاقة مطبوعة",
    "home.step1.title": "أضف الصورة",
    "home.step1.body": "ارفع صورة أو التقطها واكتب اسم الطفل. توضع داخل الإطار كما هي بدون قص.",
    "home.step2.title": "سجّل الصوت",
    "home.step2.body": "سجّل رسالة، أو ارفع ملفًا صوتيًا، أو الصق رابط Google Drive.",
    "home.step3.title": "اطبع وامسح",
    "home.step3.body": "نزّل البطاقة بإطارها. أي شخص يمسح الرمز يسمع الرسالة على Google Drive.",
    "home.band.title": "جاهز تبدأ؟",
    "home.band.body": "العملية تأخذ حوالي دقيقتين.",
    "wizard.progress": "التقدم",
    "step.1": "الصورة",
    "step.2": "الصوت",
    "step.3": "جاهزة",
    "step1.title": "ابدأ بالصورة",
    "step1.subtitle": "اختر صورة واضحة — ستوضع في الإطار بدون أي قص.",
    "step1.drag": "اسحب الصورة هنا أو اضغط للاختيار",
    "step1.hint": "JPG أو PNG أو HEIC",
    "step1.browse": "اختيار صورة",
    "step1.takePhoto": "استخدام الكاميرا",
    "step1.change": "تغيير الصورة",
    "step1.lowRes": "الصورة صغيرة وقد تظهر غير واضحة عند الطباعة.",
    "step1.goodRes": "جودة ممتازة للطباعة",
    "step1.name": "اسم الطفل",
    "step1.namePlaceholder": "مثال: أريج",
    "step3.title": "أضف الرسالة الصوتية",
    "step3.subtitle": "هذا ما سيسمعه من يمسح رمز البطاقة.",
    "step3.note.driveAuto": "سيُرفع التسجيل إلى Google Drive، ورمز QR يفتحه مباشرة.",
    "step3.note.driveLink": "رمز QR سيفتح رابط Google Drive هذا مباشرة.",
    "step3.note.site": "ربط Google Drive غير مفعّل على الخادم بعد، لذلك يُحفظ التسجيل على الموقع ويفتح الرمز صفحة الاستماع. لاستخدام Drive الآن اختر «رابط Drive».",
    "step3.tab.record": "تسجيل",
    "step3.tab.upload": "رفع ملف",
    "step3.tab.drive": "رابط Drive",
    "step3.prompt": "«يا صغيري… إذا كنت تسمع هذا، فاعلم كم أنا فخور بك.»",
    "step3.record": "بدء التسجيل",
    "step3.stop": "إيقاف التسجيل",
    "step3.tapToRecord": "اضغط للتسجيل (حتى ٥ دقائق)",
    "step3.rerecord": "حذف",
    "step3.audioReady": "جاهز",
    "step3.upload": "اختر ملفًا صوتيًا",
    "step3.uploadHint": "MP3 أو M4A أو WAV أو WEBM · حتى {max} ميغابايت",
    "step3.tooLarge": "حجم الملف {size} ميغابايت والحد الأقصى {max} ميغابايت. ارفعه على Google Drive بنفسك واستخدم «رابط Drive».",
    "step3.driveLabel": "رابط الملف الصوتي على Google Drive",
    "step3.driveInvalid": "هذا لا يبدو رابط ملف أو مجلد من Google Drive.",
    "step3.driveFileOk": "تم التعرّف على رابط الملف",
    "step3.driveFolderOk": "تم التعرّف على رابط المجلد",
    "step3.driveHelp1": "ارفع التسجيل على Google Drive.",
    "step3.driveHelp2": "مشاركة ← الوصول العام ← «أي شخص لديه الرابط» (عارض).",
    "step3.driveHelp3": "انسخ الرابط والصقه هنا.",
    "step3.writtenMessage": "رسالة مكتوبة (اختياري)",
    "step3.writtenPlaceholder": "سأبقى دائمًا أكبر داعم لك…",
    "step3.finish": "إنشاء البطاقة",
    "step4.title": "نجهّز بطاقتك",
    "step4.wait": "ثوانٍ قليلة فقط.",
    "step4.photo": "تحسين الصورة",
    "step4.voice": "رفع الرسالة الصوتية",
    "step4.voiceDrive": "ربط Google Drive",
    "step4.saving": "حفظ البطاقة",
    "step4.creatingQr": "إنشاء رمز QR",
    "frame.scanCaption": "امسح واستمع ♡",
    "card.backDashboard": "بطاقاتي",
    "card.createAnother": "بطاقة جديدة",
    "card.ready": "بطاقتك جاهزة",
    "card.download": "تنزيل PNG",
    "card.print": "طباعة",
    "card.shareLink": "مشاركة",
    "card.downloadFailed": "تعذّر إنشاء الصورة، حاول مرة أخرى.",
    "card.frameStyle": "شكل الإطار",
    "card.qrOpens": "مسح الرمز يفتح",
    "card.listenPage": "صفحة الاستماع",
    "card.testLink": "جرّب الرابط",
    "card.useDrive": "استخدام رابط Drive",
    "card.changeDrive": "تغيير الرابط",
    "card.driveEditHint": "الحفظ يغيّر رمز QR. نزّل البطاقة من جديد بعد التغيير.",
    "card.linkSaved": "تم حفظ الرابط وتحديث رمز QR",
    "card.playMessage": "الرسالة الصوتية",
    "card.printTip": "نصيحة: اطبعها بمقاس ١٠×١٥ سم أو أكبر ليُمسح الرمز بسهولة.",
    "card.deletePhoto": "حذف الصورة من الخادم",
    "card.deletePhotoConfirm": "حذف الصورة من الخادم؟ لن تظهر في معاينة البطاقة بعد ذلك.",
    "player.play": "تشغيل",
    "player.pause": "إيقاف مؤقت",
    "player.restart": "من البداية",
    "player.driveTitle": "الرسالة الصوتية على Google Drive",
    "player.openDrive": "فتح في Google Drive",
    "player.openDriveFolder": "فتح مجلد Google Drive",
    "listen.eyebrow": "رسالة صوتية إلى",
    "listen.openingDrive": "جارٍ فتح التسجيل على Google Drive…",
    "listen.noVoice": "لا يوجد تسجيل صوتي في هذه البطاقة.",
    "listen.notFoundBody": "تأكد من الرابط أو رمز QR.",
    "listen.recordedOn": "سُجّلت بكل حب في",
    "dashboard.title": "بطاقاتي",
    "dashboard.description": "كل البطاقات التي صنعتها، جاهزة لإعادة الطباعة أو المشاركة.",
    "dashboard.searchPlaceholder": "ابحث بالاسم…",
    "dashboard.stats.total": "البطاقات",
    "dashboard.stats.completed": "جاهزة",
    "dashboard.empty": "لا توجد بطاقات بعد",
    "dashboard.emptyDescription": "اصنع بطاقتك الأولى — تأخذ حوالي دقيقتين.",
    "common.next": "متابعة",
    "common.back": "رجوع",
    "common.save": "حفظ",
    "common.delete": "حذف",
    "common.copy": "نسخ",
    "common.copied": "تم النسخ",
    "common.cardNotFound": "لم يتم العثور على البطاقة.",
    "common.memoryNotFound": "لم نجد هذه البطاقة.",
    "common.noImageGenerated": "لا توجد صورة في هذه البطاقة.",
    "common.noQr": "لا يوجد رمز",
    "common.qrAlt": "رمز QR",
    "common.childPhotoAlt": "صورة الطفل",
    "common.confirmDelete": "حذف هذه البطاقة نهائيًا؟",
    "error.genericTitle": "حدث خطأ",
    "error.tryAgain": "حاول مرة أخرى.",
    "error.database": "الموقع لا يستطيع الوصول إلى قاعدة البيانات حاليًا. راجع DATABASE_URL في Vercel (افتح ‎/api/healthz?db=1).",
    "error.fileTooLarge": "الملف الصوتي كبير جدًا. استخدم رابط Google Drive بدلًا منه.",
    "error.uploadVoice": "تعذّر رفع الرسالة الصوتية.",
    "error.microphone": "تعذّر الوصول إلى الميكروفون. يمكنك رفع ملف صوتي بدلًا من ذلك.",
    "error.micPermission": "اسمح باستخدام الميكروفون من إعدادات المتصفح.",
    "warn.driveFailedTitle": "تم الحفظ على الموقع بدل Drive",
    "warn.driveFailedBody": "Google Drive لم يقبل الرفع، لذلك سيفتح الرمز صفحة الاستماع. راجع إعدادات Drive على Vercel.",
    "notFound.title": "الصفحة غير موجودة",
    "notFound.description": "الصفحة التي تبحث عنها غير موجودة.",
    "notFound.home": "العودة للرئيسية",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'en' || saved === 'ar') return saved;
    } catch {
      /* ignore */
    }
    return 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('lang', lang);
    } catch {
      /* ignore */
    }
  };

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
