const navbar = document.getElementById('navbar');
const navToggle = navbar.querySelector('.nav-toggle');
const navLinks = document.getElementById('nav-links');
const mainContent = document.getElementById('main');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ── Mobile menu ──
function isMenuOpen() {
  return navToggle.getAttribute('aria-expanded') === 'true';
}
function setMenu(open) {
  navToggle.setAttribute('aria-expanded', String(open));
  navLinks.classList.toggle('is-open', open);
}
navToggle.addEventListener('click', () => {
  setMenu(!isMenuOpen());
});
navLinks.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isMenuOpen()) {
    setMenu(false);
    navToggle.focus();
  }
});

// ── Hero power-on animation: replay on hover (mouse) or tap ──
const schematic = document.querySelector('.hero-schematic');
let schematicPlaying = !reduceMotion.matches;  // it starts playing on page load
let playTimer = setTimeout(() => { schematicPlaying = false; }, 4500);
function replaySchematic() {
  if (reduceMotion.matches || schematicPlaying) return;
  schematicPlaying = true;
  schematic.classList.remove('play');
  void schematic.getBoundingClientRect();  // force a restyle so the animations restart
  schematic.classList.add('play');
  clearTimeout(playTimer);
  playTimer = setTimeout(() => { schematicPlaying = false; }, 4500);  // fallback
}
schematic.addEventListener('animationend', (e) => {
  if (e.target.classList.contains('ray')) schematicPlaying = false;  // rays finish last
});
schematic.addEventListener('pointerenter', (e) => {
  if (e.pointerType === 'mouse') replaySchematic();
});
schematic.addEventListener('click', replaySchematic);

// ── Navbar hide/show on scroll ──
let lastY = window.scrollY;
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      const hasFocus = navbar.contains(document.activeElement);
      if (currentY > lastY && currentY > 80 && !isMenuOpen() && !hasFocus) {
        navbar.classList.add('is-hidden');
      } else {
        navbar.classList.remove('is-hidden');
      }
      lastY = currentY;
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
navbar.addEventListener('focusin', () => navbar.classList.remove('is-hidden'));

// ── Cookie banner ──
const banner = document.getElementById('cookie-banner');

function syncCookieSpace() {
  const h = banner.isConnected ? banner.offsetHeight : 0;
  document.documentElement.style.setProperty('--cookie-h', h + 'px');
}

function removeBanner() {
  // Don't strand keyboard focus on <body> when the focused button disappears.
  const hadFocus = banner.contains(document.activeElement);
  banner.remove();
  window.removeEventListener('resize', syncCookieSpace);
  syncCookieSpace();
  if (hadFocus) mainContent.focus({ preventScroll: true });
}

function closeCookies(choice) {
  try { localStorage.setItem('cookie-choice', choice); } catch (e) {}
  if (reduceMotion.matches) {
    removeBanner();
    return;
  }
  banner.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
  banner.style.transform = 'translateY(100%)';
  banner.style.opacity = '0';
  setTimeout(removeBanner, 380);
}

banner.querySelectorAll('[data-cookie]').forEach((btn) => {
  btn.addEventListener('click', () => closeCookies(btn.dataset.cookie));
});

let cookieChosen = false;
try { cookieChosen = !!localStorage.getItem('cookie-choice'); } catch (e) {}
if (cookieChosen) {
  banner.remove();
} else {
  syncCookieSpace();
  window.addEventListener('resize', syncCookieSpace);
}
