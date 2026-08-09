/* ============================================================
   إعلانات AdMob — تعمل فقط داخل تطبيق Capacitor (أندرويد/آيفون).
   على الويب العادي تتجاهل نفسها تماماً (window.MobileAds بدون تأثير).

   ⚠️ المعرّفات هنا هي معرّفات AdMob التجريبية (Test IDs).
   قبل النشر على المتجر: استبدلها بمعرّفاتك الحقيقية من admob.google.com
   (شوف BUILD_MOBILE.md).
   ============================================================ */
(function () {
  "use strict";

  var native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var AdMob = (native && window.Capacitor.Plugins) ? window.Capacitor.Plugins.AdMob : null;

  // معرّفات تجريبية من جوجل (آمنة للاختبار فقط)
  var TEST = {
    banner: "ca-app-pub-3940256099942544/6300978111",
    interstitial: "ca-app-pub-3940256099942544/1033173712",
  };

  var interstitialReady = false;
  var gamesEnded = 0;

  function init() {
    if (!AdMob) return;
    AdMob.initialize({ initializeForTesting: true }).then(function () {
      showBanner();
      prepareInterstitial();
    }).catch(function () {});
  }
  function showBanner() {
    if (!AdMob) return;
    AdMob.showBanner({
      adId: TEST.banner,
      adSize: "ADAPTIVE_BANNER",
      position: "TOP_CENTER",
      margin: 0,
    }).catch(function () {});
  }
  function prepareInterstitial() {
    if (!AdMob) return;
    AdMob.prepareInterstitial({ adId: TEST.interstitial })
      .then(function () { interstitialReady = true; })
      .catch(function () { interstitialReady = false; });
  }

  // واجهة عامة تستدعيها اللعبة — آمنة على الويب (لا تفعل شيئاً)
  window.MobileAds = {
    // إعلان بيني كل مرّتين تنتهي فيهما اللعبة (حتى لا يزعج اللاعب)
    onGameOver: function () {
      gamesEnded++;
      if (!AdMob || !interstitialReady || gamesEnded % 2 !== 0) return;
      AdMob.showInterstitial()
        .then(function () { interstitialReady = false; prepareInterstitial(); })
        .catch(function () { prepareInterstitial(); });
    },
  };

  init();
})();
