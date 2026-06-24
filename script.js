/* ═══════════════════════════════════════════════════════════
   BELLA VIE SALON & SPA — script.js
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Utility ─── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ═══════════════════════════════════════════
   1. FOOTER YEAR
═══════════════════════════════════════════ */
const yearEl = qs('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ═══════════════════════════════════════════
   2. NAV — scroll state + mobile drawer
═══════════════════════════════════════════ */
(function initNav() {
  const nav     = qs('#nav');
  const burger  = qs('#navBurger');
  const drawer  = qs('#navDrawer');
  if (!nav) return;

  // Scrolled class
  const onScroll = () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile burger
  if (burger && drawer) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('is-open');
      drawer.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on drawer link click
    qsa('a', drawer).forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('is-open');
        drawer.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && drawer.classList.contains('is-open')) {
        burger.classList.remove('is-open');
        drawer.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }
})();


/* ═══════════════════════════════════════════
   3. HERO — entry animations
═══════════════════════════════════════════ */
(function initHero() {
  const hero = qs('#hero');
  if (!hero) return;

  // Trigger CSS transitions after a short paint delay
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      hero.classList.add('hero--loaded');
    });
  });
})();


/* ═══════════════════════════════════════════
   4. SCROLL REVEAL — IntersectionObserver
═══════════════════════════════════════════ */
(function initReveal() {
  const items = qsa('[data-reveal]');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  items.forEach(el => observer.observe(el));
})();


/* ═══════════════════════════════════════════
   5. GSAP SCROLL ANIMATIONS
   (loads only if GSAP is available)
═══════════════════════════════════════════ */
(function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Hero image subtle parallax
  const heroImg = qs('.hero__img');
  if (heroImg) {
    gsap.to(heroImg, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // Section headers fade + lift
  qsa('.section-header').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      }
    );
  });

  // Spa feature images stagger
  const spaMain   = qs('.spa-feature__img-main');
  const spaAccent = qs('.spa-feature__img-accent');
  const spaAward  = qs('.spa-feature__award');
  if (spaMain) {
    gsap.fromTo(spaMain,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.spa-feature', start: 'top 75%', once: true } }
    );
  }
  if (spaAccent) {
    gsap.fromTo(spaAccent,
      { opacity: 0, x: 40, y: 40 },
      { opacity: 1, x: 0, y: 0, duration: 1, delay: 0.25, ease: 'power3.out',
        scrollTrigger: { trigger: '.spa-feature', start: 'top 75%', once: true } }
    );
  }
  if (spaAward) {
    gsap.fromTo(spaAward,
      { opacity: 0, scale: 0.7 },
      { opacity: 1, scale: 1, duration: 0.7, delay: 0.5, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: '.spa-feature', start: 'top 75%', once: true } }
    );
  }

  // CTA banner title reveal
  const ctaTitle = qs('.cta-banner__title');
  if (ctaTitle) {
    gsap.fromTo(ctaTitle,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.cta-banner', start: 'top 70%', once: true } }
    );
  }
})();


/* ═══════════════════════════════════════════
   6. TESTIMONIALS CAROUSEL
   (auto-scrolls on mobile, grid on desktop)
═══════════════════════════════════════════ */
(function initTestimonials() {
  const track = qs('#testimonialsTrack');
  const dotsContainer = qs('#testimonialsDots');
  if (!track || !dotsContainer) return;

  const cards = qsa('.testimonial-card', track);
  if (cards.length === 0) return;

  // Only activate carousel on mobile
  let currentIndex = 0;
  let interval;
  let isCarousel = false;

  function buildCarousel() {
    if (isCarousel) return;
    isCarousel = true;

    track.style.display = 'flex';
    track.style.overflow = 'hidden';
    track.style.gap = '0';

    cards.forEach(card => {
      card.style.flex = '0 0 100%';
      card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s';
    });

    // Build dots
    dotsContainer.innerHTML = '';
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testimonials__dot';
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.style.cssText = `
        width: 8px; height: 8px; border-radius: 9999px;
        border: none; background: var(--clr-blush);
        cursor: pointer; transition: all 0.3s ease;
        padding: 0;
      `;
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    goTo(0);
    startAuto();
  }

  function tearDownCarousel() {
    if (!isCarousel) return;
    isCarousel = false;
    clearInterval(interval);

    track.style.display = '';
    track.style.overflow = '';
    track.style.gap = '';

    cards.forEach(card => {
      card.style.flex = '';
      card.style.transform = '';
      card.style.opacity = '';
      card.style.transition = '';
    });

    dotsContainer.innerHTML = '';
    currentIndex = 0;
  }

  function goTo(index) {
    currentIndex = index;
    cards.forEach((card, i) => {
      card.style.transform = `translateX(${(i - index) * 100}%)`;
      card.style.opacity = i === index ? '1' : '0.3';
    });
    qsa('.testimonials__dot', dotsContainer).forEach((dot, i) => {
      dot.style.background = i === index
        ? 'var(--clr-rose-gold)'
        : 'var(--clr-blush)';
      dot.style.width = i === index ? '24px' : '8px';
    });
  }

  function startAuto() {
    clearInterval(interval);
    interval = setInterval(() => {
      goTo((currentIndex + 1) % cards.length);
    }, 4500);
  }

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    clearInterval(interval);
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0
        ? (currentIndex + 1) % cards.length
        : (currentIndex - 1 + cards.length) % cards.length
      );
    }
    startAuto();
  }, { passive: true });

  // Responsive toggle
  const mq = window.matchMedia('(max-width: 768px)');

  function handleMQ(e) {
    if (e.matches) buildCarousel();
    else tearDownCarousel();
  }

  mq.addEventListener('change', handleMQ);
  handleMQ(mq);
})();


/* ═══════════════════════════════════════════
   7. SMOOTH ANCHOR SCROLL
═══════════════════════════════════════════ */
(function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ═══════════════════════════════════════════
   8. LAZY IMAGE FADE-IN
═══════════════════════════════════════════ */
(function initLazyFade() {
  const imgs = qsa('img[loading="lazy"]');
  if (!imgs.length) return;

  imgs.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.6s ease';
    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => { img.style.opacity = '1'; });
      img.addEventListener('error', () => { img.style.opacity = '1'; });
    }
  });
})();


/* ═══════════════════════════════════════════
   9. GALLERY PREVIEW — hover lift + caption
   (pure CSS handles most; JS adds keyboard a11y)
═══════════════════════════════════════════ */
(function initGallery() {
  qsa('.gallery-preview__item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'img');
    const caption = qs('.gallery-preview__caption', item);
    const altText = qs('img', item)?.alt || 'Gallery image';
    if (!item.getAttribute('aria-label')) {
      item.setAttribute('aria-label', caption?.textContent?.trim() || altText);
    }
    item.addEventListener('focus', () => {
      if (caption) caption.style.transform = 'translateY(0)';
    });
    item.addEventListener('blur', () => {
      if (caption) caption.style.transform = '';
    });
  });
})();


/* ═══════════════════════════════════════════
   10. ACTIVE NAV LINK — highlight by scroll position
═══════════════════════════════════════════ */
(function initActiveNav() {
  // Only on homepage (index.html or /)
  const isHome = window.location.pathname === '/' ||
                 window.location.pathname.endsWith('index.html') ||
                 window.location.pathname === '';
  if (!isHome) return;

  const sections = qsa('section[id]');
  const navLinks = qsa('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const navH = () => parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
  ) || 80;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle(
            'nav__link--active',
            link.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  }, {
    rootMargin: `-${navH() + 10}px 0px -55% 0px`
  });

  sections.forEach(s => observer.observe(s));
})();
