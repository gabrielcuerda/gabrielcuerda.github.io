/* ============================================================
   Ciberfamilias · lógica de la interfaz (index.html + recursos.html)
   Filtrado + buscador + tema + animación de aparición
   ============================================================ */

(function () {
  'use strict';

  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('.card-section'));
  var input = document.getElementById('search');
  var counter = document.getElementById('counter');
  var empty = document.getElementById('empty');
  var themeToggle = document.getElementById('themeToggle');
  var themeColor = document.querySelector('meta[name="theme-color"]');

  var activeFilter = 'todas';
  var TOTAL = cards.length;
  var NOUN = counter ? (counter.dataset.noun || 'elementos') : 'elementos';

  /* ---------- Utilidades ---------- */

  // Normaliza texto: minúsculas y sin acentos ("Gestión" ~ "gestion")
  function normalize(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function setCounter(visible) {
    var singular = NOUN.slice(-1) === 's' ? NOUN.slice(0, -1) : NOUN;
    var word = visible === 1 ? singular : NOUN;
    counter.innerHTML = 'Mostrando <strong>' + visible + '</strong> de ' + TOTAL + ' ' + word;
  }

  // El index filtra por data-category y los recursos por data-type
  function filterKey(card) {
    return card.dataset.category || card.dataset.type;
  }

  /* ---------- Filtrado + búsqueda combinados ---------- */

  function applyFilters() {
    if (!counter) return;

    var query = input ? normalize(input.value.trim()) : '';
    var visible = 0;

    cards.forEach(function (card) {
      var matchCategory = activeFilter === 'todas' || filterKey(card) === activeFilter;
      var matchText = !query || normalize(card.textContent).indexOf(query) !== -1;
      var show = matchCategory && matchText;

      card.hidden = !show; // CSS: .card[hidden] { display: none }
      if (show) visible++;
    });

    setCounter(visible);
    if (empty) empty.hidden = visible !== 0;

    // Oculta las secciones que se quedan sin cards (página de recursos)
    sections.forEach(function (section) {
      section.hidden = !section.querySelector('.card:not([hidden])');
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeFilter = chip.dataset.filter;

      chips.forEach(function (other) {
        var isActive = other === chip;
        other.classList.toggle('is-active', isActive);
        other.setAttribute('aria-pressed', String(isActive));
      });

      applyFilters();
    });
  });

  if (input) input.addEventListener('input', applyFilters);

  /* ---------- Tema claro / oscuro ---------- */

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function paintTheme(theme) {
    // Icono: se muestra el de la acción (sol => ir a claro)
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
      );
    }
    if (themeColor) {
      themeColor.setAttribute('content', theme === 'dark' ? '#0b0f14' : '#f4f7fa');
    }
  }

  paintTheme(currentTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      paintTheme(next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) { /* modo privado: solo queda el cambio en memoria */ }
    });
  }

  /* ---------- Aparición progresiva de las cards ---------- */

  cards.forEach(function (card, i) {
    card.style.setProperty('--delay', Math.min(i, 11) * 45 + 'ms');
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    cards.forEach(function (card) { observer.observe(card); });
  } else {
    cards.forEach(function (card) { card.classList.add('is-visible'); });
  }

  /* ---------- Estado inicial ---------- */

  applyFilters();
})();
