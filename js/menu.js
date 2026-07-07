const menuToggle = document.getElementById('menuToggle');
const menuOverlay = document.getElementById('menuOverlay');
const menuClose = document.getElementById('menuClose');

menuToggle.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);

menuOverlay.addEventListener('click', (e) => {
  if (e.target === menuOverlay) closeMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuOverlay.classList.contains('is-open')) closeMenu();
});

function openMenu() {
  menuOverlay.classList.add('is-open');
  document.body.classList.add('menu-open');
  menuClose.focus();
}

function closeMenu() {
  menuOverlay.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  menuToggle.focus();
}
