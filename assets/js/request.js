/* Short, accessible request form. This preview intentionally has no network or storage integration. */
(function () {
  "use strict";
  var form = document.getElementById("request-form");
  if (!form) return;

  var ids = [
    "request-location",
    "request-name",
    "request-contact",
    "request-consent",
  ];
  var fields = ids.map(function (id) {
    return document.getElementById(id);
  });
  var contact = document.getElementById("request-contact");
  var contactLabel = document.getElementById("request-contact-label");
  var contactModes = Array.from(document.querySelectorAll("[data-contact-mode]"));
  var contactMode = "email";
  var summary = document.getElementById("request-summary");
  var result = document.getElementById("request-result");
  var heading = document.getElementById("request-card-heading");
  var demoNote = document.getElementById("request-demo-note");
  var role = document.getElementById("request-role");
  var details = form.querySelector("details");
  var submitted = false;

  // The broker link may choose this one known option; all other query values are ignored.
  var requestedRoles = new URLSearchParams(window.location.search).getAll(
    "role",
  );
  if (requestedRoles.length === 1 && requestedRoles[0] === "agent") {
    role.value = "agent";
    details.open = true;
  }

  function clean(value) {
    return value.trim().replace(/\s+/g, " ");
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(value);
  }

  function isPhone(value) {
    var phone = value.replace(/[\s().-]/g, "");
    return /^(?:\+[1-9][0-9]{8,14}|[0-9]{9,15})$/.test(phone);
  }

  function setContactMode(mode) {
    contactMode = mode;
    contact.type = mode;
    contact.setAttribute("inputmode", mode);
    contact.setAttribute("autocomplete", mode);
    contact.placeholder = mode === "tel" ? "+420 777 123 456" : "např. jana@example.cz";
    contactLabel.textContent = mode === "tel" ? "Váš telefon" : "Váš e-mail";
    contactModes.forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.contactMode === mode ? "true" : "false");
    });
  }

  // A pasted or autofilled contact remains valid even when it differs from the selected keyboard.
  function matchContactMode() {
    var value = clean(contact.value);
    if (isEmail(value)) setContactMode("email");
    else if (isPhone(value)) setContactMode("tel");
  }

  contactModes.forEach(function (button) {
    button.addEventListener("click", function () {
      setContactMode(button.dataset.contactMode);
      contact.focus();
    });
  });

  function messageFor(field) {
    var value = field.type === "checkbox" ? "" : clean(field.value);
    if (field.id === "request-consent") {
      return field.checked
        ? ""
        : "Pro pokračování potvrďte použití údajů pro vyřízení žádosti.";
    }
    if (field.id === "request-location") {
      if (!value) return "Napište obec nebo město, kde dům stojí.";
      if (!/\p{L}/u.test(value))
        return "Napište název obce nebo města, ne pouze PSČ.";
    }
    if (field.id === "request-name") {
      if (!value) return "Napište své jméno, ať víme, jak vás oslovit.";
      if (!/\p{L}/u.test(value) || !/^[\p{L}\p{M}\s.'’\-]+$/u.test(value))
        return "Napište prosím své jméno bez čísel a zvláštních symbolů.";
    }
    if (field.id === "request-contact") {
      if (!value) return "Doplňte e-mail nebo telefon. Stačí jeden kontakt.";
      if (isEmail(value) || isPhone(value)) return "";
      return contactMode === "tel"
        ? "Zkontrolujte telefon, například +420 777 123 456."
        : "Zkontrolujte e-mail, například jana@example.cz.";
    }
    return "";
  }

  function validate(field) {
    var message = messageFor(field);
    var error = document.getElementById(field.id + "-error");
    error.textContent = message;
    error.hidden = !message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  function updateSummary() {
    var count = fields.filter(function (field) {
      return field.getAttribute("aria-invalid") === "true";
    }).length;
    summary.textContent = count
      ? count === 1
        ? "Ještě prosím opravte jeden označený údaj."
        : "Ještě prosím opravte " + count + " označené údaje."
      : "";
  }

  fields.forEach(function (field) {
    field.addEventListener("blur", function () {
      if (field.type !== "checkbox") field.value = clean(field.value);
      if (field === contact) matchContactMode();
      if (submitted || (field.type !== "checkbox" && field.value)) {
        validate(field);
        if (submitted) updateSummary();
      }
    });
    field.addEventListener(
      field.type === "checkbox" ? "change" : "input",
      function () {
        if (submitted || field.getAttribute("aria-invalid") === "true") {
          validate(field);
          if (submitted) updateSummary();
        }
      },
    );
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    submitted = true;
    var firstInvalid = null;
    fields.forEach(function (field) {
      if (field.type !== "checkbox") field.value = clean(field.value);
      if (!validate(field) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      updateSummary();
      firstInvalid.focus();
      return;
    }
    summary.textContent = "";
    matchContactMode();
    document.getElementById("request-review-location").textContent = fields[0].value;
    document.getElementById("request-review-name").textContent = fields[1].value;
    document.getElementById("request-review-contact").textContent = contact.value;
    document.getElementById("request-review-contact-label").textContent = contactMode === "tel" ? "Telefon" : "E-mail";
    heading.hidden = true;
    demoNote.hidden = true;
    form.hidden = true;
    result.hidden = false;
    result.focus();
  });

  document
    .getElementById("request-edit")
    .addEventListener("click", function () {
      result.hidden = true;
      heading.hidden = false;
      demoNote.hidden = false;
      form.hidden = false;
      fields[0].focus();
    });

  document
    .getElementById("request-clear")
    .addEventListener("click", function () {
      form.reset();
      submitted = false;
      fields.forEach(function (field) {
        field.removeAttribute("aria-invalid");
        var error = document.getElementById(field.id + "-error");
        error.textContent = "";
        error.hidden = true;
      });
      setContactMode("email");
      ["location", "name", "contact"].forEach(function (key) {
        document.getElementById("request-review-" + key).textContent = "";
      });
      role.value = "";
      details.open = false;
      summary.textContent = "";
      result.hidden = true;
      heading.hidden = false;
      demoNote.hidden = false;
      form.hidden = false;
      fields[0].focus();
    });

  // Without JavaScript the button remains disabled, so no accidental native submit can occur.
  matchContactMode();
  document.getElementById("request-submit").disabled = false;
})();
