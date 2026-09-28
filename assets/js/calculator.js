/* Illustrative 60/40 model. No personal data, persistence or requests. */
(function () {
  "use strict";
  var calc = document.getElementById("calc");
  if (!calc) return;
  var formatter = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });
  var decimalFormatter = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 1 });
  var defaults = { base: 3800000, invest: 900000, price: 6000000, fee: 3.7 };
  var values = Object.assign({}, defaults);
  var fields = Object.keys(values);
  var invalid = {};
  var announcementTimer;

  function money(value) { return formatter.format(Math.round(value)) + " Kč"; }
  function output(id, value) { document.getElementById("out-" + id).textContent = value; }
  function calculate(price, base, investment, fee) {
    var fees = price * fee / 100;
    var net = price - base - investment - fees;
    var ownerShare = Math.max(0, net) * 0.6;
    var rekoShare = Math.max(0, net) * 0.4;
    return { fees: fees, net: net, ownerShare: ownerShare, rekoShare: rekoShare, owner: price - investment - fees - rekoShare };
  }
  function paintControl(id, formatInput) {
    var range = document.getElementById("in-" + id);
    var label = id === "fee" ? decimalFormatter.format(values[id]) + " %" : money(values[id]);
    range.value = values[id];
    range.style.setProperty("--range-progress", ((values[id] - Number(range.min)) / (Number(range.max) - Number(range.min)) * 100) + "%");
    range.setAttribute("aria-valuetext", label);
    document.getElementById("lbl-" + id).textContent = label;
    if (formatInput) document.getElementById("amount-" + id).value = id === "fee" ? decimalFormatter.format(values[id]) : formatter.format(values[id]);
  }
  function showError(id, message) {
    invalid[id] = Boolean(message);
    var field = document.getElementById("amount-" + id);
    var error = document.getElementById("error-" + id);
    field.setAttribute("aria-invalid", message ? "true" : "false");
    error.textContent = message;
    error.hidden = !message;
    document.getElementById("calc-pending").hidden = !fields.some(function (key) { return invalid[key]; });
  }
  function announce(result) {
    clearTimeout(announcementTimer);
    announcementTimer = setTimeout(function () {
      document.getElementById("calc-announcement").textContent = result.owner < 0
        ? "Na pokrytí nákladů chybí " + money(Math.abs(result.owner)) + "."
        : "V tomto modelu zůstane majiteli " + money(result.owner) + ", před odečtením hypotéky a daní.";
    }, 650);
  }
  function update(shouldAnnounce) {
    var result = calculate(values.price, values.base, values.invest, values.fee);
    var shortfall = result.owner < 0;
    var delta = result.owner - values.base;
    output("ownerTotal", money(Math.abs(result.owner)));
    output("totalLabel", shortfall ? "Na pokrytí nákladů v tomto modelu chybí" : "V tomto příkladu zůstane majiteli");
    output("fees", money(result.fees));
    output("netto", money(result.net));
    output("ownerShare", money(result.ownerShare));
    output("rekoShare", money(result.rekoShare));
    output("investment", money(values.invest));
    output("base", money(values.base));
    output("salePrice", money(values.price));
    output("ownerAllocation", money(result.owner));
    output("allocationLabel", shortfall ? "Schodek k vypořádání" : "Pro vás celkem");
    output("breakeven", money((values.base + values.invest) / (1 - values.fee / 100)));
    output("gainLabel", shortfall ? "Prodejní cena nestačí na náklady" : Math.abs(delta) < 0.5 ? "Stejně jako hodnota domu dnes" : "O " + money(Math.abs(delta)) + (delta > 0 ? " více" : " méně") + " než hodnota domu dnes");
    document.getElementById("calc-gain").classList.toggle("is-negative", delta < -0.5);
    document.getElementById("calc-gain").classList.toggle("is-zero", Math.abs(delta) < 0.5);
    document.getElementById("calc-negative").hidden = result.net > 0 || shortfall;
    document.getElementById("calc-negative").textContent = Math.abs(result.net) < 0.5
      ? "Hodnota navíc je v tomto modelu nulová. Po vrácení investice a úhradě nákladů prodeje zbývá majiteli dnešní hodnota domu."
      : "Za těchto podmínek nevzniká kladná hodnota navíc. Investice se vrací z prodeje a částka pro majitele se snižuje o záporný rozdíl.";
    document.getElementById("calc-shortfall").hidden = !shortfall;
    document.getElementById("calc-allocation-bar").hidden = shortfall;
    [["owner", Math.max(0, result.owner)], ["investment", values.invest], ["fees", result.fees], ["reko", result.rekoShare]].forEach(function (part) {
      document.getElementById("bar-" + part[0]).style.width = (part[1] / values.price * 100) + "%";
      document.getElementById("bar-" + part[0]).hidden = part[1] === 0;
    });
    [["scDown", calculate(values.price * 0.93, values.base, values.invest, values.fee).owner], ["scBase", result.owner], ["scUp", calculate(values.price * 1.05, values.base, values.invest, values.fee).owner]].forEach(function (entry) {
      output(entry[0], money(Math.abs(entry[1])));
      output(entry[0] + "Label", entry[1] < 0 ? "chybí na náklady" : "zbývá majiteli");
    });
    if (shouldAnnounce) announce(result);
  }
  function readInput(id) {
    var field = document.getElementById("amount-" + id);
    var range = document.getElementById("in-" + id);
    var raw = field.value.replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
    var validFormat = id === "fee" ? /^\d+(\.\d)?$/ : /^\d+$/;
    var number = Number(raw);
    var min = Number(range.min), max = Number(range.max);
    if (!validFormat.test(raw) || !Number.isFinite(number)) {
      showError(id, id === "fee" ? "Zadejte procento, například 3,7." : "Zadejte částku v celých korunách.");
      return false;
    }
    if (number < min || number > max) {
      showError(id, id === "fee" ? "Zadejte sazbu od 1 do 7 %." : "Zadejte částku od " + money(min) + " do " + money(max) + ".");
      return false;
    }
    values[id] = number;
    showError(id, "");
    paintControl(id, false);
    update(true);
    return true;
  }
  fields.forEach(function (id) {
    var field = document.getElementById("amount-" + id);
    var range = document.getElementById("in-" + id);
    field.addEventListener("input", function () { readInput(id); });
    field.addEventListener("blur", function () { if (readInput(id)) paintControl(id, true); });
    field.addEventListener("keydown", function (event) {
      if (event.key === "Enter") { event.preventDefault(); if (readInput(id)) paintControl(id, true); }
      if (event.key === "Escape") { showError(id, ""); paintControl(id, true); }
    });
    range.addEventListener("input", function () {
      values[id] = id === "fee" ? Math.round(Number(range.value) * 10) / 10 : Math.round(Number(range.value) / 1000) * 1000;
      showError(id, "");
      paintControl(id, true);
      update(true);
    });
    range.addEventListener("keydown", function (event) {
      if (!/^(ArrowLeft|ArrowRight|ArrowUp|ArrowDown)$/.test(event.key)) return;
      event.preventDefault();
      var direction = event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 1;
      var step = id === "fee" ? 0.1 : (event.shiftKey ? 250000 : 50000);
      values[id] = Math.min(Number(range.max), Math.max(Number(range.min), Math.round((values[id] + direction * step) * 10) / 10));
      showError(id, "");
      paintControl(id, true);
      update(true);
    });
    paintControl(id, true);
  });
  document.getElementById("calc-reset").addEventListener("click", function () {
    values = Object.assign({}, defaults);
    fields.forEach(function (id) { showError(id, ""); paintControl(id, true); });
    update(true);
  });
  update(false);
})();
