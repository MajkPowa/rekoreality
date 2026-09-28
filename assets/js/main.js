/* Shared navigation. No tracking or stored personal data. */
(function () {
  "use strict";
  var burger = document.getElementById("burger");
  var menu = document.getElementById("navsheet");
  function closeMenu(returnFocus) {
    if (!menu || !burger) return;
    menu.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Otevřít menu");
    document.body.classList.remove("nav-open");
    if (returnFocus) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") !== "true";
      menu.hidden = !open;
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
      document.body.classList.toggle("nav-open", open);
      if (open) menu.querySelector("a").focus();
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu(false);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (menu.hidden) return;
      if (event.key === "Escape") closeMenu(true);
      if (event.key !== "Tab") return;
      var stops = [burger].concat(Array.from(menu.querySelectorAll("a")));
      var current = stops.indexOf(document.activeElement);
      if (event.shiftKey && current <= 0) {
        event.preventDefault();
        stops[stops.length - 1].focus();
      } else if (!event.shiftKey && current === stops.length - 1) {
        event.preventDefault();
        burger.focus();
      }
    });
    window
      .matchMedia("(min-width: 1101px)")
      .addEventListener("change", function (event) {
        if (event.matches) closeMenu(false);
      });
  }
  var sticky = document.querySelector(".mobile-cta");
  if (sticky) {
    var updateSticky = function () {
      sticky.classList.toggle(
        "is-visible",
        window.scrollY > 650 && !document.body.classList.contains("nav-open"),
      );
    };
    window.addEventListener("scroll", updateSticky, { passive: true });
    if (burger) burger.addEventListener("click", updateSticky);
    updateSticky();
  }
})();
