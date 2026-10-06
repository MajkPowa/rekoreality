/* Small enhancements; property content and original photo links work without JS. */
(function () {
  'use strict';
  const controls = document.querySelector('[data-filter-controls]');
  if (controls) {
    controls.hidden = false;
    const buttons = Array.from(controls.querySelectorAll('[data-filter]'));
    const cards = Array.from(document.querySelectorAll('[data-property-type]'));
    const count = document.getElementById('property-result-count');
    function filter(type, updateUrl) {
      if (!buttons.some(button => button.dataset.filter === type)) type = 'all';
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === type)));
      let visible = 0;
      cards.forEach(card => {
        card.hidden = type !== 'all' && card.dataset.propertyType !== type;
        if (!card.hidden) visible++;
      });
      count.textContent = visible === 1 ? '1 nemovitost v nabídce' : visible + ' nemovitosti v nabídce';
      if (updateUrl) {
        const url = new URL(location.href);
        if (type === 'all') url.searchParams.delete('typ');
        else url.searchParams.set('typ', type);
        history.replaceState(null, '', url);
      }
    }
    buttons.forEach(button => button.addEventListener('click', () => filter(button.dataset.filter, true)));
    filter(new URLSearchParams(location.search).get('typ') || 'all', false);
  }
  const dialog = document.getElementById('property-lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const photos = Array.from(document.querySelectorAll('[data-gallery-item]'));
  const openAll = document.querySelector('[data-show-all]');
  if (!photos.length || !openAll) return;
  const image = document.getElementById('lightbox-image');
  const caption = document.getElementById('lightbox-caption');
  const count = document.getElementById('lightbox-count');
  const close = dialog.querySelector('[data-lightbox-close]');
  let current = 0;
  let opener;
  document.body.classList.add('gallery-ready');
  openAll.hidden = false;
  function show(index) {
    current = (index + photos.length) % photos.length;
    image.src = photos[current].href;
    image.alt = photos[current].dataset.caption;
    caption.textContent = image.alt;
    count.textContent = (current + 1) + ' / ' + photos.length;
  }
  function open(index, target) {
    opener = target;
    show(index);
    dialog.showModal();
    document.body.classList.add('lightbox-open');
    close.focus();
  }
  photos.forEach((photo, index) => photo.addEventListener('click', event => {
    event.preventDefault();
    open(index, photo);
  }));
  openAll.addEventListener('click', () => open(0, openAll));
  close.addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(current - 1));
  dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    if (opener) opener.focus();
  });
})();
