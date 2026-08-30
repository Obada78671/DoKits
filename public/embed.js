/**
 * Do Kits — تكبيرُ إطار التضمين تلقائيّاً.
 * ضعه مرّةً واحدةً في صفحتك مهما بلغ عددُ الأدوات المضمَّنة فيها:
 *   <script src="https://dokits.net/embed.js" async></script>
 */
(function () {
  "use strict";
  // الأصلُ يُشتقّ من مصدر هذا السكربت نفسِه: يعمل في أيّ نشرٍ بلا تعديل،
  // ويبقى مقصوراً على الأصل الذي أتى منه — فلا يُصغى إلى غيره.
  var self_ = document.currentScript;
  var ORIGIN = self_ ? new URL(self_.src, location.href).origin : "https://dokits.net";

  window.addEventListener("message", function (e) {
    // نقبل من أصل Do Kits وحدَه، ونتجاهل كلَّ رسالةٍ سواه
    if (e.origin !== ORIGIN) return;
    var d = e.data;
    if (!d || d.type !== "dokits:height" || typeof d.height !== "number") return;
    if (d.height < 80 || d.height > 20000) return;

    var frames = document.getElementsByTagName("iframe");
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === e.source) {
        frames[i].style.height = d.height + "px";
        break;
      }
    }
  });
})();
