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
          v = "Doplňte čísla"; note = "Nastavte aspoň dnešní cenu domu a cenu po opravě.";
        } else if (b.net <= 0) {
          v = "Takhle to nevyjde"; note = "S těmito čísly rekonstrukce žádnou hodnotu navíc nevytvoří. My pak nemáme nárok na podíl — ale to, co jsme prostavěli, se z prodeje stejně vrací. Vám by proto zbylo míň, než má dům dnes. Takový projekt bychom nezačali.";
        } else if (b.net < 800000) {
          v = "Hraniční"; note = "Hodnota navíc je pod 800 000 Kč. To je hranice, od které se nám to vyplatí — museli bychom se na dům podívat individuálně.";
        } else if (d.net <= 0) {
          v = "Záleží na trhu"; note = "Při očekávané ceně to vychází, při opatrném odhadu (o 7 % níž) už ne. Chtělo by to levnější rekonstrukci nebo střízlivější cenu.";
        } else {
          v = "Vypadá to dobře"; note = "Vychází to i při opatrném odhadu. Další krok je prohlídka a nezávislý odhad ceny.";
        }
        out.verdict.textContent = v;
        if (out.verdictNote) out.verdictNote.textContent = note;
      }
    }

    calc.addEventListener("input", update);
    update();
  }

  /* ------------------------------------------- 6. Simulace „před → po" ---
     Hero animace řídí obě skleněné karty i posuvník. Čísla odpovídají
     modelovému příkladu ze sekce „Nevěřte slibům" — nejde o příslib výsledku.
  ------------------------------------------------------------------------ */
  (function heroSim() {
    var bar = doc.getElementById('simbar');
    var range = doc.getElementById('simRange');
    var playBtn = doc.getElementById('simPlay');
    if (!bar || !range || !playBtn) return;

    var czk = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 });
    // Stejná čísla jako příběh pana Nováka a výchozí nastavení kalkulačky.
    var V0 = 3800000, V1 = 6000000, INVEST = 900000, FEE = 0.037;

    var PHASES = [
      [0.10, 'Původní stav', 'Dům tak, jak dnes stojí'],
      [0.28, 'Vyklizení a demolice', 'Odstranění dosloužilých konstrukcí'],
      [0.50, 'Hrubá stavba a obálka', 'Nosné prvky, střecha, okna'],
      [0.70, 'Instalace a interiér', 'Rozvody, povrchy, kuchyň, koupelny'],
      [0.88, 'Terén, terasa a bazén', 'Úpravy pozemku a exteriéru'],
      [1.01, 'Připraveno k prodeji', 'Příprava na prohlídky, fotografie, dokumentace'],
    ];

    var el = {
      week: doc.getElementById('simWeek'),
      ring: doc.getElementById('simRing'),
      pct: doc.getElementById('simPct'),
      phase: doc.getElementById('simPhase'),
      note: doc.getElementById('simPhaseNote'),
      value: doc.getElementById('simValue'),
      delta: doc.getElementById('simDelta'),
      invest: doc.getElementById('simInvest'),
      created: doc.getElementById('simCreated'),
      clip: doc.getElementById('simClip'),
      line: doc.getElementById('simLine'),
      dot: doc.getElementById('simDot'),
    };

    var RING = 169.6;
    var lineLen = 0;
    var dragging = false;

    function money(n) { return czk.format(Math.round(n)) + ' Kč'; }

    function paint(p) {
      var value = V0 + p * (V1 - V0);
      var invest = p * INVEST;
      var created = Math.max(0, value - V0 - invest - value * FEE);

      if (el.value) el.value.textContent = czk.format(Math.round(value));
      if (el.delta) el.delta.textContent = '+' + money(p * (V1 - V0));
      if (el.invest) el.invest.textContent = money(invest);
      if (el.created) el.created.textContent = money(created);

      if (el.pct) el.pct.textContent = Math.round(p * 100) + ' %';
      if (el.ring) el.ring.setAttribute('stroke-dashoffset', String(RING * (1 - p)));
      if (el.week) el.week.textContent = 'Týden ' + Math.round(p * 14) + ' / 14';

      for (var i = 0; i < PHASES.length; i++) {
        if (p < PHASES[i][0]) {
          if (el.phase && el.phase.textContent !== PHASES[i][1]) {
            el.phase.textContent = PHASES[i][1];
            el.note.textContent = PHASES[i][2];
          }
          break;
        }
      }

      if (el.clip) el.clip.setAttribute('width', String(220 * p));
      if (el.line && el.dot) {
        if (!lineLen) { try { lineLen = el.line.getTotalLength(); } catch (e) { lineLen = 0; } }
        if (lineLen) {
          var pt = el.line.getPointAtLength(lineLen * p);
          el.dot.setAttribute('cx', String(pt.x));
          el.dot.setAttribute('cy', String(pt.y));
        }
      }
      if (!dragging) range.value = String(Math.round(p * 1000));
    }

    doc.addEventListener('house3d:progress', function (e) {
      // Na stránce běží dvě časové osy — hero karty patří jen té v hero.
      if (!e.target || e.target.dataset.house !== 'villa') return;
      paint(e.detail.progress);
      bar.classList.toggle('is-paused', !e.detail.playing);
      playBtn.setAttribute('aria-pressed', e.detail.playing ? 'true' : 'false');
      playBtn.setAttribute('aria-label', e.detail.playing ? 'Pozastavit simulaci' : 'Spustit simulaci');
    });

    var wired = false;
    function wire(sim) {
      if (wired || !sim) return;
      wired = true;
      bar.hidden = false;

      range.addEventListener('pointerdown', function () { dragging = true; });
      range.addEventListener('pointerup', function () { dragging = false; });
      range.addEventListener('input', function () { sim.seek(+range.value / 1000); });
      range.addEventListener('keydown', function () { dragging = false; });
      playBtn.addEventListener('click', function () { sim.toggle(); });

      paint(sim.progress);
    }

    // Modul se může nabootovat před i po tomto skriptu — pokrýváme obě pořadí.
    doc.addEventListener('house3d:ready', function (e) { wire((e.detail && e.detail.sim) || e.detail); });
    if (window.RekoSim) wire(window.RekoSim);

    paint(0);
  })();

  /* ------------------------------------- 7. Příběh pana Nováka (ukázka) ---
     Vyprávěná 3D ukázka ovládaná jako video: tlačítko, posuvník, titulky
     a čísla, která se rozsvěcují podle toho, kam příběh došel.
  ------------------------------------------------------------------------ */
  (function novakStory() {
    var stage = doc.getElementById('storyStage');
    var range = doc.getElementById('storyRange');
    if (!stage || !range) return;

    var story = stage.closest('.story');
    var big = doc.getElementById('storyBig');
    var playBtn = doc.getElementById('storyPlay');
    var stepEl = doc.getElementById('storyStep');
    var textEl = doc.getElementById('storyText');
    var nums = Array.prototype.slice.call(doc.querySelectorAll('.story__num'));

    var CHAPTERS = [
      [0.16, 'Pan Novák zdědil dům po rodičích. Roky v něm nikdo nebydlel.'],
      [0.34, 'Chtěl ho prodat. Jenže byl plný věcí a dávno se do něj nic nedalo.'],
      [0.50, 'Stavební firmy chtěly zálohy dopředu. Ty neměl. A čas na to taky ne.'],
      [0.68, 'Ozval se nám. Přijeli jsme, dům ocenili a spočítali rozpočet.'],
      [0.88, 'Vyklidili jsme ho a zrekonstruovali. Pan Novák nezaplatil ani korunu.'],
      [1.01, 'Dům se prodal za 6 000 000 Kč. Naše peníze jsme si vzali až z prodeje.'],
    ];

    var dragging = false;
    var lastIdx = -1;

    function paint(p) {
      for (var i = 0; i < CHAPTERS.length; i++) {
        if (p < CHAPTERS[i][0]) {
          if (i !== lastIdx) {
            lastIdx = i;
            stepEl.textContent = (i + 1) + ' / ' + CHAPTERS.length;
            textEl.textContent = CHAPTERS[i][1];
          }
          break;
        }
      }
      nums.forEach(function (n) {
        n.classList.toggle('is-on', p >= parseFloat(n.getAttribute('data-at') || '0'));
      });
      if (!dragging) range.value = String(Math.round(p * 1000));
    }

    doc.addEventListener('house3d:progress', function (e) {
      if (!e.target || e.target.dataset.house !== 'novak') return;
      paint(e.detail.progress);
      story.classList.toggle('is-playing', e.detail.playing);
      var lbl = e.detail.playing ? 'Pozastavit' : (e.detail.progress >= 1 ? 'Přehrát znovu' : 'Přehrát');
      playBtn.setAttribute('aria-label', lbl);
      playBtn.parentElement.classList.toggle('is-paused', !e.detail.playing);
    });

    var wired = false;
    function wire(sims) {
      var sim = sims && sims.novak;
      if (wired || !sim) return;
      wired = true;

      function toggle() { sim.toggle(); }
      big.addEventListener('click', toggle);
      playBtn.addEventListener('click', toggle);

      range.addEventListener('pointerdown', function () { dragging = true; });
      range.addEventListener('pointerup', function () { dragging = false; });
      range.addEventListener('input', function () { sim.seek(+range.value / 1000); });

      paint(sim.progress);
      story.classList.toggle('is-playing', sim.playing);
      playBtn.parentElement.classList.toggle('is-paused', !sim.playing);
    }

    doc.addEventListener('house3d:ready', function (e) { wire(e.detail && e.detail.all); });
    if (window.RekoSims) wire(window.RekoSims);

    paint(0);
  })();

  /* ---------------------------------------------------------- 8. Formulář */
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
