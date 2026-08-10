# 📱 دليل تحويل «سوبر جري» لتطبيق أندرويد وآيفون (مع إعلانات)

اللعبة اتجهّزت بتقنية **Capacitor** اللي بتغلّف لعبة الويب في تطبيق حقيقي لأندرويد وآيفون من نفس الكود، مع إعلانات **AdMob**.

المشروع نفسه جاهز. الخطوات اللي تحت لازم تتعمل **على جهازك** (البيئة السحابية مافيهاش أدوات بناء التطبيقات).

---

## ⚠️ المتطلبات (اقرأها الأول)

| الحاجة | التفاصيل | التكلفة |
|--------|----------|---------|
| كمبيوتر | ويندوز/ماك/لينكس لأندرويد — **ماك ضروري** لآيفون | — |
| Node.js | نزّله من nodejs.org | مجاني |
| Android Studio | لبناء تطبيق أندرويد | مجاني |
| Xcode (ماك فقط) | لبناء تطبيق آيفون | مجاني |
| حساب Google Play Developer | لنشر على متجر أندرويد | **25$ مرة واحدة** |
| حساب Apple Developer | لنشر على App Store | **99$ سنوياً** |
| حساب AdMob | للإعلانات | مجاني |

> ملاحظة مهمة: النشر على المتجرين بيمرّ بمراجعة من جوجل/أبل قد تاخد أيام، وفيه شروط (سياسة خصوصية، تصنيف عمري... إلخ).

---

## 🟢 أولاً: تشغيل المشروع (مرة واحدة)

في مجلد المشروع على جهازك:

```bash
# 1) نزّل التبعيات
npm install

# 2) جهّز مجلد الويب
npm run copy:web

# 3) ضِف منصّة أندرويد (و/أو آيفون على ماك)
npm run add:android
npm run add:ios        # على ماك فقط

# 4) نصّب إضافة الإعلانات في المشروع الأصلي
npx cap sync
```

---

## 🤖 ثانياً: بناء تطبيق أندرويد

```bash
npm run open:android      # يفتح المشروع في Android Studio
```

داخل Android Studio:
1. استنى المزامنة (Gradle Sync) تخلص.
2. للتجربة على جهازك: وصّل موبايلك (مع تفعيل USB Debugging) واضغط **Run ▶**.
3. لإنشاء ملف للنشر: **Build → Generate Signed Bundle / APK**
   - اختر **Android App Bundle (.aab)** (ده اللي جوجل بلاي بيطلبه).
   - اعمل **Keystore** جديد (احفظه كويس — هتحتاجه في كل تحديث).

### إذن الإنترنت للإعلانات
تأكد إن ملف `android/app/src/main/AndroidManifest.xml` فيه:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```
و AdMob هيطلب منك تحط **App ID** بتاعك (شوف قسم الإعلانات تحت).

---

## 🍎 ثالثاً: بناء تطبيق آيفون (ماك + Xcode)

```bash
npm run open:ios          # يفتح المشروع في Xcode
```

داخل Xcode:
1. اختر فريق التطوير بتاعك (Signing & Capabilities).
2. اربط جهاز آيفون أو استخدم Simulator واضغط **Run ▶**.
3. للنشر: **Product → Archive** ثم ارفع عبر **Organizer** لـ App Store Connect.

---

## 💰 رابعاً: تفعيل الإعلانات الحقيقية (AdMob)

دلوقتي اللعبة بتستخدم **معرّفات تجريبية** (إعلانات وهمية للاختبار). قبل النشر:

1. ادخل [admob.google.com](https://admob.google.com) واعمل تطبيق جديد.
2. أنشئ وحدتين إعلان: **Banner** و **Interstitial**، وخُد معرّفاتهم.
3. في ملف `mobile-ads.js` استبدل قيم `TEST.banner` و `TEST.interstitial` بمعرّفاتك، وشيل `initializeForTesting: true`.
4. حط **AdMob App ID** بتاعك في:
   - **أندرويد:** `android/app/src/main/AndroidManifest.xml` داخل `<application>`:
     ```xml
     <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"
                android:value="ca-app-pub-xxxxxxxx~yyyyyyyy"/>
     ```
   - **آيفون:** `ios/App/App/Info.plist`:
     ```xml
     <key>GADApplicationIdentifier</key>
     <string>ca-app-pub-xxxxxxxx~yyyyyyyy</string>
     ```
5. بعد أي تعديل على ملفات الويب: `npm run sync`

> مكان الإعلانات حالياً: **بانر أعلى الشاشة** + **إعلان بيني كل مرّتين تنتهي فيهما اللعبة** (عشان ما يزعّجش اللاعب). تقدر تغيّر ده في `mobile-ads.js`.

---

## 🚀 خامساً: النشر

- **Google Play:** ادخل [play.google.com/console](https://play.google.com/console)، اعمل تطبيق جديد، ارفع ملف `.aab`، املأ بيانات المتجر وسياسة الخصوصية والتصنيف، وابعت للمراجعة.
- **App Store:** ادخل [appstoreconnect.apple.com](https://appstoreconnect.apple.com)، اعمل تطبيق جديد، ارفع من Xcode، املأ البيانات، وابعت للمراجعة.

---

## 🔄 تحديث اللعبة لاحقاً

أي تعديل على اللعبة (ملفات الويب في الجذر):
```bash
npm run sync          # ينسخ التعديلات ويزامنها مع المشروعين
```
ثم أعد البناء من Android Studio / Xcode وارفع نسخة جديدة.

---

## ملخّص سريع

اللعبة **جاهزة تقنياً** للتحويل لتطبيق. اللي محتاجه منك: كمبيوتر بالأدوات، حسابات المتجرين (برسومها)، وحساب AdMob. لو حابب أساعدك في أي خطوة بالتفصيل، قوللي أنت واقف فين.
