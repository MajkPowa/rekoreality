/* Reading links remain native; only collapse a long contents list on small screens. */
(function () {
  "use strict";
  var toc = document.querySelector(".article-toc");
  if (toc && window.matchMedia("(max-width: 850px)").matches) toc.open = false;
})();
