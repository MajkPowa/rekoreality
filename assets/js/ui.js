/* Small progressive enhancements. Content remains available without animation. */
(function () {
  "use strict";

  // Accessible owner-situation tabs: Arrow keys, Home, End and normal Tab order.
  const tabs = Array.from(document.querySelectorAll(".situation-tab"));
  function selectTab(tab, focus) {
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden =
        !active;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab, false));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectTab(tabs[next], true);
      }
    });
  });

  // Native modal: Escape, focus return, keyboard photo navigation.
  const dialog = document.getElementById("photo-dialog");
  const photos = Array.from(document.querySelectorAll("[data-photo]"));
  if (dialog && photos.length) {
    let current = 0;
    let opener;
    function show(index) {
      current = (index + photos.length) % photos.length;
      const photo = photos[current];
      const img = document.getElementById("photo-dialog-image");
      img.src = photo.dataset.photo;
      img.alt = "AI ilustrace: " + photo.dataset.photoCaption;
      document.getElementById("photo-dialog-title").textContent =
        photo.dataset.photoTitle;
      document.getElementById("photo-dialog-caption").textContent =
        photo.dataset.photoCaption;
      document.getElementById("photo-count").textContent =
        current + 1 + " / " + photos.length;
    }
    photos.forEach((photo, index) =>
      photo.addEventListener("click", () => {
        opener = photo;
        show(index);
        dialog.showModal();
        document.body.classList.add("dialog-open");
        dialog.querySelector(".photo-close").focus();
      }),
    );
    dialog
      .querySelector(".photo-close")
      .addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      if (opener) opener.focus();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        dialog.close();
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        show(current + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        show(current - 1);
      }
    });
    document
      .getElementById("photo-prev")
      .addEventListener("click", () => show(current - 1));
    document
      .getElementById("photo-next")
      .addEventListener("click", () => show(current + 1));
  }

  // Search Czech FAQ with or without accents, preserving native details.
  const search = document.getElementById("faq-search");
  if (!search) return;
  const questions = Array.from(
    document.querySelectorAll(".faq-group .faq-item"),
  );
  const groups = Array.from(document.querySelectorAll(".faq-group"));
  const clear = document.getElementById("search-clear");
  const status = document.getElementById("search-status");
  const normalize = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("cs-CZ")
      .trim();
  const texts = questions.map((item) => normalize(item.textContent));
  // Common Czech query forms should also find inflected words in the answers.
  const queryRoots = {
    zastava: "zastav",
    hypoteka: "hypotek",
    rekonstrukce: "rekonstruk",
    rozpocet: "rozpoc",
    cena: "cen",
    naklady: "naklad",
    vlastnictvi: "vlastn",
    dan: "dan",
  };
  function filter() {
    const terms = normalize(search.value)
      .split(/\s+/)
      .filter(Boolean)
      .map((term) => queryRoots[term] || term);
    let count = 0;
    questions.forEach((item, index) => {
      const match = terms.every((term) => texts[index].includes(term));
      item.hidden = !match;
      item.open = terms.length ? match : index === 0;
      if (match) count++;
    });
    groups.forEach((group) => {
      group.hidden = !Array.from(group.querySelectorAll(".faq-item")).some(
        (item) => !item.hidden,
      );
    });
    document.getElementById("search-empty").hidden = count > 0;
    clear.hidden = !search.value;
    status.textContent = terms.length ? "Nalezené odpovědi: " + count : "";
  }
  function reset(focus) {
    search.value = "";
    filter();
    if (focus) search.focus();
  }
  search.addEventListener("input", filter);
  clear.addEventListener("click", () => reset(true));
  document
    .getElementById("search-reset")
    .addEventListener("click", () => reset(true));
  document
    .querySelectorAll(".faq-sidebar nav a")
    .forEach((link) => link.addEventListener("click", () => reset(false)));
  function revealHash() {
    if (!location.hash) return;
    let target;
    try {
      target = document.getElementById(
        decodeURIComponent(location.hash.slice(1)),
      );
    } catch {
      return;
    }
    if (target && target.matches("details")) target.open = true;
  }
  addEventListener("hashchange", revealHash);
  revealHash();
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          document.querySelectorAll(".faq-sidebar nav a").forEach((link) => {
            if (link.hash === "#" + entry.target.id)
              link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
    );
    groups.forEach((group) => observer.observe(group));
  }
})();
