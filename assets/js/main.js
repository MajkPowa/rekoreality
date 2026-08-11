/* ==========================================================================
   REKOREALITY — chování rozhraní
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- 1. Nav */
  var nav = doc.getElementById("nav");
  var burger = doc.getElementById("burger");
  var sticky = doc.getElementById("stickyCta");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("is-stuck", y > 24);
    if (sticky) sticky.classList.toggle("is-on", y > 620);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger) {
    burger.addEventListener("click", function () {
      var open = doc.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      doc.body.style.overflow = open ? "hidden" : "";
    });
    doc.querySelectorAll(".navsheet a").forEach(function (a) {
      a.addEventListener("click", function () {
        doc.body.classList.remove("nav-open");
        doc.body.style.overflow = "";
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------------------------------------------- 2. Reveal / bars */
  var revealables = doc.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  }

  doc.querySelectorAll("[data-bars]").forEach(function (wrap) {
    var fills = wrap.querySelectorAll(".bar__fill");
    var play = function () {
      fills.forEach(function (f, i) {
        var h = f.getAttribute("data-h") || "50";
        setTimeout(function () { f.style.height = h + "%"; }, reduce ? 0 : i * 70);
      });
    };
    if ("IntersectionObserver" in window) {
      var bo = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { play(); bo.disconnect(); } });
      }, { threshold: 0.35 });
      bo.observe(wrap);
    } else { play(); }
  });

  /* -------------------------------------------------------- 3. Carousel */
  doc.querySelectorAll(".carousel").forEach(function (root) {
    var track = root.querySelector("[data-track]");
    var prev = root.querySelector("[data-prev]");
    var next = root.querySelector("[data-next]");
    if (!track) return;

    var cards = Array.prototype.slice.call(track.children);
    var index = 0;

    function metrics() {
      if (!cards.length) return { step: 0, visible: 1 };
      var rect = cards[0].getBoundingClientRect();
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0") || 0;
      var step = rect.width + gap;
      var visible = Math.max(1, Math.round(track.parentElement.clientWidth / step));
      return { step: step, visible: visible };
    }

    function render() {
      var m = metrics();
      var max = Math.max(0, cards.length - m.visible);
      if (index > max) index = max;
      if (index < 0) index = 0;
      track.style.transform = "translate3d(" + -(index * m.step) + "px,0,0)";
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index >= max;
      var focus = index + Math.floor(m.visible / 2);
      cards.forEach(function (c, i) { c.classList.toggle("is-focus", i === focus && m.visible > 1); });
    }

    if (prev) prev.addEventListener("click", function () { index--; render(); });
    if (next) next.addEventListener("click", function () { index++; render(); });

    var startX = null;
    track.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 44) { index += dx < 0 ? 1 : -1; render(); }
      startX = null;
    }, { passive: true });

    var t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(render, 140); });
    render();
  });

  /* ------------------------------------------------------------- 4. FAQ */
  doc.querySelectorAll("[data-faq]").forEach(function (list) {
    var items = Array.prototype.slice.call(list.querySelectorAll(".faq__item"));
    items.forEach(function (item) {
      var q = item.querySelector(".faq__q");
      var a = item.querySelector(".faq__a");
      if (!q || !a) return;
      q.setAttribute("aria-expanded", "false");

      q.addEventListener("click", function () {
        var open = item.classList.contains("is-open");
        items.forEach(function (other) {
          if (other === item) return;
          other.classList.remove("is-open");
          var oa = other.querySelector(".faq__a");
          var oq = other.querySelector(".faq__q");
          if (oa) oa.style.height = "0px";
          if (oq) oq.setAttribute("aria-expanded", "false");
        });

        if (open) {
          a.style.height = a.scrollHeight + "px";
          requestAnimationFrame(function () { a.style.height = "0px"; });
          item.classList.remove("is-open");
          q.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("is-open");
          q.setAttribute("aria-expanded", "true");
          a.style.height = a.scrollHeight + "px";
          a.addEventListener("transitionend", function done() {
            if (item.classList.contains("is-open")) a.style.height = "auto";
            a.removeEventListener("transitionend", done);
          });
        }
      });
    });
  });

  /* ------------------------------------------------------ 5. Kalkulačka */
  var calc = doc.getElementById("calc");
  if (calc) {
    var czk = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });
    var out = {};
    ["netto", "ownerShare", "rekoShare", "ownerTotal", "fees", "breakeven",
     "scDown", "scBase", "scUp", "verdict", "verdictNote"].forEach(function (id) {
      out[id] = doc.getElementById("out-" + id);
    });

    function val(id) {
      var el = doc.getElementById(id);
      if (!el) return 0;
      var n = parseFloat(String(el.value).replace(/\s/g, "").replace(",", "."));
      return isNaN(n) ? 0 : n;
    }

    function money(n) { return czk.format(Math.round(n)) + " Kč"; }

    function scenario(price, base, invest, feePct) {
      var fees = price * (feePct / 100);
      var net = price - base - invest - fees;
      var pos = Math.max(net, 0);
      var rekoShare = pos * 0.4;
      // Schválená investice se vypořádává z kupní ceny i tehdy, když hodnota nevznikne.
      // Majiteli proto zbývá base + net (záporné net nese majitel), sníženo o podíl REKO.
      return {
        price: price, fees: fees, net: net,
        ownerShare: pos * 0.6, rekoShare: rekoShare,
        owner: base + net - rekoShare,
        reko: invest + rekoShare
      };
    }

    function update() {
      var base = val("in-base") * 1000;
      var invest = val("in-invest") * 1000;
      var price = val("in-price") * 1000;
      var feePct = val("in-fee");

      var lb = doc.getElementById("lbl-base");
      var li = doc.getElementById("lbl-invest");
      var lp = doc.getElementById("lbl-price");
      var lf = doc.getElementById("lbl-fee");
      if (lb) lb.textContent = money(base);
      if (li) li.textContent = money(invest);
      if (lp) lp.textContent = money(price);
      if (lf) lf.textContent = feePct.toFixed(1).replace(".", ",") + " %";

      var b = scenario(price, base, invest, feePct);
      var d = scenario(price * 0.93, base, invest, feePct);
      var u = scenario(price * 1.05, base, invest, feePct);
      var breakeven = (base + invest) / (1 - feePct / 100);

      if (out.fees) out.fees.textContent = money(b.fees);
      if (out.netto) out.netto.textContent = money(b.net);
      if (out.ownerShare) out.ownerShare.textContent = money(b.ownerShare);
      if (out.rekoShare) out.rekoShare.textContent = money(b.rekoShare);
      if (out.ownerTotal) out.ownerTotal.textContent = money(b.owner);
      if (out.breakeven) out.breakeven.textContent = money(breakeven);

      if (out.scDown) out.scDown.textContent = money(d.owner);
      if (out.scBase) out.scBase.textContent = money(b.owner);
      if (out.scUp) out.scUp.textContent = money(u.owner);

      if (out.verdict) {
        var v, note;
        if (price <= 0 || base <= 0) {
          v = "Doplňte údaje"; note = "Zadejte alespoň odhad dnešní hodnoty a očekávanou cenu po rekonstrukci.";
        } else if (b.net <= 0) {
          v = "Model nevychází"; note = "Při zadaných číslech nevzniká čistá vytvořená hodnota. REKOREALITY pak nemá nárok na podíl ze zisku, ale schválená investice se z kupní ceny vypořádává tak jako tak — majiteli by proto zbylo méně než dnešní hodnota domu. Takový projekt by nezačal.";
        } else if (b.net < 800000) {
          v = "Hraniční"; note = "Konzervativní čistá vytvořená hodnota je pod pilotní hranicí 800 000 Kč. Projekt by šel do individuálního posouzení.";
        } else if (d.net <= 0) {
          v = "Citlivé na trh"; note = "Base scénář vychází, ale downside (−7 %) už ne. Vyžadovalo by to nižší investici nebo opatrnější cenový plán.";
        } else {
          v = "Vypadá průchodně"; note = "Base i downside scénář vytvářejí hodnotu. Další krok je technický audit a nezávislé ocenění.";
        }
        out.verdict.textContent = v;
        if (out.verdictNote) out.verdictNote.textContent = note;
      }
    }

    calc.addEventListener("input", update);
    update();
  }

  /* ---------------------------------------------------------- 6. Formulář */
  doc.querySelectorAll("[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var done = doc.getElementById(form.getAttribute("data-demo-form"));
      if (!done) return;
      form.classList.add("hide");
      done.classList.remove("hide");
      done.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  });
})();
