window.addEventListener('load', () => {
  const doc = document.querySelector('.topbar-wrapper');

  const parent = doc.parentNode;
  const img = document.createElement('img');
  img.src = `/api/static/favicon.jpg`;
  img.alt = `Logo topbar`;
  img.width = 40;

  const svg = document.querySelector('.topbar-wrapper a svg');
  svg.remove();

  parent.insertBefore(img.cloneNode(true), null);
});
