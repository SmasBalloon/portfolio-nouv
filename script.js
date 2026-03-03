// Init Lucide icons
lucide.createIcons();

// Navigation hamburger
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// Active nav link au scroll
const sections = document.querySelectorAll('section[id]');
const allNavLinks = navLinks.querySelectorAll('a');

function updateActiveLink() {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) {
      current = section.getAttribute('id');
    }
  });
  allNavLinks.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === '#' + current) {
      link.style.color = 'var(--accent)';
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = 64;
      window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
    }
  });
});

// Fade-up animations
document.addEventListener('DOMContentLoaded', () => {
  const fadeTargets = document.querySelectorAll('.tl-card, .project-card, .skills-group, .but-card, .stat-box');
  fadeTargets.forEach(el => el.classList.add('fade-up'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), 60 * (idx % 6));
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeTargets.forEach(el => obs.observe(el));

  // AC toggle
  document.querySelectorAll('.ac-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const list = btn.closest('.but-card').querySelector('.ac-list');
      list.classList.toggle('open');
      btn.classList.toggle('open');
    });
  });

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const submitBtn = this.querySelector('button[type="submit"]');
      const orig = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Message envoyé !';
      submitBtn.disabled = true;
      submitBtn.style.background = '#10b981';
      setTimeout(() => {
        submitBtn.innerHTML = orig;
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        this.reset();
        lucide.createIcons();
      }, 3000);
    });
  }
});

// Set data-level attributes on AC level badges
document.querySelectorAll('.ac-lvl').forEach(el => {
  const match = el.textContent.match(/^(\d)\//);
  if (match) el.dataset.level = match[1];
});
