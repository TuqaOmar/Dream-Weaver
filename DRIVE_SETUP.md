# ربط Google Drive (مرة واحدة فقط)

بعد هذا الإعداد، كل تسجيل صوتي يُرفع من الموقع يُحفظ تلقائيًا في Google Drive الخاص بك، ويُشارَك «لأي شخص لديه الرابط»، ورمز QR في البطاقة يفتح ملف Drive مباشرة.

> بدون هذا الإعداد الموقع يعمل أيضًا: يمكنك لصق رابط Drive يدويًا في خطوة الصوت (تبويب «رابط Drive»)، أو يُحفظ الصوت على الموقع ويفتح الرمز صفحة الاستماع.

## 1) إنشاء مفاتيح OAuth في Google Cloud
1. افتح https://console.cloud.google.com وأنشئ مشروعًا جديدًا (مثلاً `future-card`).
2. **APIs & Services → Library** → ابحث عن **Google Drive API** → **Enable**.
3. **APIs & Services → OAuth consent screen**:
   - User type: **External** → أكمل الاسم والإيميل.
   - Scopes: أضف `https://www.googleapis.com/auth/drive.file`.
   - Test users: أضف إيميلك.
   - بعد الحفظ اضغط **Publish app** (حالة *In production*). مهم: إذا بقي التطبيق في وضع *Testing* ينتهي الـ refresh token بعد 7 أيام ويتوقف الرفع.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs: `https://developers.google.com/oauthplayground`
   - انسخ **Client ID** و **Client secret**.

## 2) الحصول على Refresh Token
1. افتح https://developers.google.com/oauthplayground
2. اضغط ⚙️ (أعلى اليمين) → فعّل **Use your own OAuth credentials** → الصق Client ID و Client secret.
3. في الخانة على اليسار اكتب: `https://www.googleapis.com/auth/drive.file` → **Authorize APIs** → سجّل الدخول بحساب Gmail الذي تريد حفظ التسجيلات فيه → وافق.
4. اضغط **Exchange authorization code for tokens** → انسخ **Refresh token**.

## 3) (اختياري) مجلد خاص للتسجيلات
أنشئ مجلدًا في Drive، وافتحه، وانسخ الـ ID من الرابط:
`https://drive.google.com/drive/folders/`**`هذا_هو_الـID`**

ملاحظة: صلاحية `drive.file` تسمح بالكتابة فقط في الملفات/المجلدات التي أنشأها التطبيق. إذا ظهر خطأ عند استخدام مجلد أنشأته يدويًا، احذف `GOOGLE_DRIVE_FOLDER_ID` وستُحفظ الملفات في جذر Drive.

## 4) إضافة المتغيرات في Vercel
Vercel → مشروع **dream-weaver** → **Settings → Environment Variables** (Production + Preview):

| الاسم | القيمة |
|---|---|
| `GOOGLE_CLIENT_ID` | من الخطوة 1 |
| `GOOGLE_CLIENT_SECRET` | من الخطوة 1 |
| `GOOGLE_REFRESH_TOKEN` | من الخطوة 2 |
| `GOOGLE_DRIVE_FOLDER_ID` | (اختياري) من الخطوة 3 |
| `APP_URL` | (اختياري) نطاق الموقع النهائي، مثل `https://dream-weaver.vercel.app` |

ثم **Deployments → Redeploy**.

## 5) التأكد
- افتح `https://<موقعك>/api/config` ← يجب أن يظهر `"driveEnabled": true`.
- أنشئ بطاقة وارفع تسجيلًا، وفي صفحة البطاقة يجب أن يظهر «مسح الرمز يفتح: Google Drive». اضغط «جرّب الرابط».

## لماذا كان المسح يعطي خطأ سابقًا؟
رمز QR كان مبنيًا على رابط النشر الخاص بـ Vercel (مثل `dream-weaver-q0ewnsnft-…vercel.app`). هذه الروابط محمية بـ *Vercel Authentication*، فمن يمسحها من جوال آخر يرى صفحة تسجيل دخول/خطأ. الآن الرمز يفتح Google Drive مباشرة، وفي حالة عدم استخدام Drive يُبنى على النطاق الرئيسي الثابت للمشروع.
