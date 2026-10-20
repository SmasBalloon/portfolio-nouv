// Init Lucide icons
lucide.createIcons();

// Thème clair / sombre
const themeToggle = document.getElementById('themeToggle');
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function currentTheme() {
  return document.documentElement.dataset.theme || (darkQuery.matches ? 'dark' : 'light');
}

function updateThemeIcon() {
  const isDark = currentTheme() === 'dark';
  themeToggle.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}"></i>`;
  themeToggle.setAttribute('aria-label', isDark ? 'Passer en thème clair' : 'Passer en thème sombre');
  lucide.createIcons();
}

themeToggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  updateThemeIcon();
});

darkQuery.addEventListener('change', updateThemeIcon);
updateThemeIcon();

// ─── Mini-jeu : Memory des technos ───────────────────────
const memoryGame   = document.getElementById('memoryGame');
const memoryStart  = document.getElementById('memoryStart');
const memoryPlay   = memoryGame.querySelector('.memory-play');
const memoryGrid   = document.getElementById('memoryGrid');
const memoryMoves  = document.getElementById('memoryMoves');
const memoryBest   = document.getElementById('memoryBest');
const memoryEnd    = document.getElementById('memoryEnd');
const memoryResult = document.getElementById('memoryResult');

const memoryTechs = ['react', 'rust', 'docker', 'typescript', 'nestjs', 'solidjs'];
const devicon = tech => `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${tech}/${tech}-original.svg`;

let memoryFirst = null;
let memoryLock = false;
let memoryCount = 0;
let memoryFound = 0;

function getMemoryBest() {
  try { return Number(localStorage.getItem('memoryBest')) || null; } catch (e) { return null; }
}

function showMemoryBest() {
  const best = getMemoryBest();
  memoryBest.textContent = best ? `Record : ${best}` : '';
}

function startMemory() {
  const cards = [...memoryTechs, ...memoryTechs].sort(() => Math.random() - 0.5);
  memoryGrid.innerHTML = cards.map(tech => `
    <button type="button" class="memory-card" data-tech="${tech}" aria-label="Carte cachée">
      <span class="memory-card-inner">
        <span class="memory-face memory-back">?</span>
        <span class="memory-face memory-front"><img src="${devicon(tech)}" alt="${tech}"></span>
      </span>
    </button>`).join('');

  memoryFirst = null;
  memoryLock = false;
  memoryCount = 0;
  memoryFound = 0;
  memoryMoves.textContent = '0 coups';
  showMemoryBest();

  memoryGame.classList.add('playing');
  memoryStart.hidden = true;
  memoryPlay.hidden = false;
  memoryEnd.hidden = true;
}

function quitMemory() {
  memoryGame.classList.remove('playing');
  memoryPlay.hidden = true;
  memoryStart.hidden = false;
}

function winMemory() {
  const best = getMemoryBest();
  const isRecord = !best || memoryCount < best;
  if (isRecord) {
    try { localStorage.setItem('memoryBest', memoryCount); } catch (e) {}
  }
  memoryResult.textContent = isRecord
    ? `Nouveau record : ${memoryCount} coups !`
    : `${memoryCount} coups · Record : ${best}`;
  showMemoryBest();
  memoryEnd.hidden = false;
}

memoryGrid.addEventListener('click', e => {
  const card = e.target.closest('.memory-card');
  if (!card || memoryLock || card === memoryFirst || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  card.setAttribute('aria-label', card.dataset.tech);

  if (!memoryFirst) {
    memoryFirst = card;
    return;
  }

  memoryCount++;
  memoryMoves.textContent = `${memoryCount} coup${memoryCount > 1 ? 's' : ''}`;

  if (memoryFirst.dataset.tech === card.dataset.tech) {
    memoryFirst.classList.add('matched');
    card.classList.add('matched');
    memoryFirst = null;
    if (++memoryFound === memoryTechs.length) setTimeout(winMemory, 400);
    return;
  }

  const first = memoryFirst;
  memoryFirst = null;
  memoryLock = true;
  setTimeout(() => {
    [first, card].forEach(c => {
      c.classList.remove('flipped');
      c.setAttribute('aria-label', 'Carte cachée');
    });
    memoryLock = false;
  }, 800);
});

memoryStart.addEventListener('click', startMemory);
document.getElementById('memoryReplay').addEventListener('click', startMemory);
document.getElementById('memoryQuit').addEventListener('click', quitMemory);

// ─── Mini-jeu : Jeu du dino ──────────────────────────────
const dinoModal  = document.getElementById('dinoModal');
const dinoCanvas = document.getElementById('dinoCanvas');
const dinoCtx    = dinoCanvas.getContext('2d');

const DINO_W = dinoCanvas.width;
const DINO_H = dinoCanvas.height;
const GROUND = DINO_H - 30;
const PIXEL  = 4;

// Petit Claude Code en pixel art (# = pixel plein), deux images pour l'animation des pattes
const DINO_BODY = [
  '  #######  ',
  '  # ### #  ',
  '  # ### #  ',
  '###########',
  '  #######  '
];
const DINO_LEGS = [['  # # # #  '], ['   # # # # ']];
const CLAUDE_ORANGE = '#d97757';
const DINO_SIZE = { w: 11 * PIXEL, h: (DINO_BODY.length + DINO_LEGS[0].length) * PIXEL };

let dino, obstacles, dinoSpeed, dinoScore, dinoState, dinoFrame, dinoLastTime, groundOffset, nextObstacle;

function dinoColors() {
  const css = getComputedStyle(document.documentElement);
  return {
    text:   css.getPropertyValue('--text').trim(),
    muted:  css.getPropertyValue('--muted').trim(),
    accent: css.getPropertyValue('--accent').trim(),
    sea:    css.getPropertyValue('--sea').trim()
  };
}

function getDinoBest() {
  try { return Number(localStorage.getItem('dinoBest')) || 0; } catch (e) { return 0; }
}

function resetDino() {
  dino = { y: GROUND - DINO_SIZE.h, vy: 0 };
  obstacles = [];
  dinoSpeed = 6;
  dinoScore = 0;
  groundOffset = 0;
  nextObstacle = 60;
}

function dinoJump() {
  if (dinoState !== 'running') {
    resetDino();
    dinoState = 'running';
  }
  if (dino.y >= GROUND - DINO_SIZE.h) dino.vy = -11;
}

function drawPixels(rows, x, y, color) {
  dinoCtx.fillStyle = color;
  rows.forEach((row, r) => {
    [...row].forEach((c, col) => {
      if (c === '#') dinoCtx.fillRect(x + col * PIXEL, y + r * PIXEL, PIXEL, PIXEL);
    });
  });
}

function updateDino(step) {
  dino.vy += 0.6 * step;
  dino.y = Math.min(dino.y + dino.vy * step, GROUND - DINO_SIZE.h);
  if (dino.y === GROUND - DINO_SIZE.h) dino.vy = 0;

  dinoSpeed = Math.min(dinoSpeed + 0.002 * step, 14);
  dinoScore += dinoSpeed * step * 0.02;
  groundOffset = (groundOffset + dinoSpeed * step) % 24;

  obstacles.forEach(o => { o.x -= dinoSpeed * step; });
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  nextObstacle -= dinoSpeed * step;
  if (nextObstacle <= 0) {
    const h = 24 + Math.random() * 24;
    const w = 12 + Math.floor(Math.random() * 3) * 10;
    obstacles.push({ x: DINO_W, w, h });
    nextObstacle = 260 + Math.random() * 260;
  }

  // Collision (avec une petite marge pour être indulgent)
  const box = { x: 40 + 6, y: dino.y + 4, w: DINO_SIZE.w - 12, h: DINO_SIZE.h - 6 };
  const hit = obstacles.some(o =>
    box.x < o.x + o.w && box.x + box.w > o.x && box.y + box.h > GROUND - o.h
  );
  if (hit) {
    dinoState = 'over';
    if (Math.floor(dinoScore) > getDinoBest()) {
      try { localStorage.setItem('dinoBest', Math.floor(dinoScore)); } catch (e) {}
    }
  }
}

function drawDino() {
  const colors = dinoColors();
  dinoCtx.clearRect(0, 0, DINO_W, DINO_H);

  // Sol
  dinoCtx.fillStyle = colors.muted;
  dinoCtx.fillRect(0, GROUND, DINO_W, 2);
  for (let x = -groundOffset; x < DINO_W; x += 24) dinoCtx.fillRect(x, GROUND + 8, 8, 2);

  // Cactus
  dinoCtx.fillStyle = colors.sea;
  obstacles.forEach(o => {
    dinoCtx.fillRect(o.x, GROUND - o.h, o.w, o.h);
    dinoCtx.fillRect(o.x - 4, GROUND - o.h * 0.7, 4, o.h * 0.3);
    dinoCtx.fillRect(o.x + o.w, GROUND - o.h * 0.8, 4, o.h * 0.3);
  });

  // Petit Claude
  const onGround = dino.y >= GROUND - DINO_SIZE.h;
  const legs = onGround && dinoState === 'running' ? DINO_LEGS[Math.floor(dinoFrame / 6) % 2] : DINO_LEGS[0];
  drawPixels([...DINO_BODY, ...legs], 40, dino.y, CLAUDE_ORANGE);

  // Score
  dinoCtx.fillStyle = colors.text;
  dinoCtx.font = '600 14px Inter, system-ui, sans-serif';
  dinoCtx.textAlign = 'right';
  const best = getDinoBest();
  dinoCtx.fillText(`${best ? `Record ${best}   ` : ''}${String(Math.floor(dinoScore)).padStart(5, '0')}`, DINO_W - 12, 24);

  dinoCtx.textAlign = 'center';
  if (dinoState === 'ready') {
    dinoCtx.fillText('Appuie sur Espace ou touche l\'écran pour commencer', DINO_W / 2, DINO_H / 2 - 10);
  } else if (dinoState === 'over') {
    dinoCtx.font = '700 20px Inter, system-ui, sans-serif';
    dinoCtx.fillText('Game over', DINO_W / 2, DINO_H / 2 - 20);
    dinoCtx.font = '500 13px Inter, system-ui, sans-serif';
    dinoCtx.fillText('Saute pour rejouer', DINO_W / 2, DINO_H / 2 + 2);
  }
}

function dinoLoop(time) {
  if (!dinoModal.classList.contains('open')) return;
  // step = 1 à 60 images/s, pour garder la même vitesse quel que soit l'écran
  const step = Math.min((time - (dinoLastTime || time)) / (1000 / 60), 3);
  dinoLastTime = time;
  if (dinoState === 'running') {
    dinoFrame++;
    updateDino(step);
  }
  drawDino();
  requestAnimationFrame(dinoLoop);
}

function openDino() {
  resetDino();
  dinoState = 'ready';
  dinoFrame = 0;
  dinoLastTime = 0;
  dinoModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(dinoLoop);
}

function closeDino() {
  dinoModal.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('dinoOpen').addEventListener('click', openDino);
document.getElementById('dinoClose').addEventListener('click', closeDino);
document.getElementById('dinoOverlay').addEventListener('click', closeDino);
dinoCanvas.addEventListener('pointerdown', e => { e.preventDefault(); dinoJump(); });

document.addEventListener('keydown', e => {
  if (!dinoModal.classList.contains('open')) return;
  if (e.key === 'Escape') closeDino();
  if (e.code === 'Space' || e.key === 'ArrowUp') {
    e.preventDefault();
    dinoJump();
  }
});

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

// ─── Projects Data ───────────────────────────────────────
// category : 'web' | 'tools' | 'sae'
// links    : liens publics uniquement (les dépôts privés ne sont pas liés)
const GH = 'https://github.com/SmasBalloon/';

const projectsData = {
  'smashlocker': {
    title: 'SmashLocker',
    subtitle: 'Gestionnaire de mots de passe',
    icon: 'shield',
    category: 'web',
    private: true,
    summary: 'Gestionnaire de mots de passe complet en monorepo : API, application web, extension navigateur et application mobile.',
    tags: ['NestJS', 'SolidJS', 'PostgreSQL', 'WebAuthn', 'Docker'],
    stack: ['TypeScript', 'NestJS', 'Prisma', 'PostgreSQL', 'Redis', 'JWT', 'Argon2', 'WebAuthn (passkeys)', 'TOTP', 'Nodemailer', 'SolidJS', 'Kobalte', 'Tailwind CSS', 'Vite', 'esbuild', 'Bun', 'Docker', 'Nginx', 'PM2', 'GitHub Actions'],
    targetSkills: [
      { code: 'AC22.03', label: 'Comprendre les enjeux de sécurisation des données' },
      { code: 'AC24.02', label: 'Assurer la sécurité des données' },
      { code: 'AC23.01', label: 'Concevoir et développer des applications communicantes' },
      { code: 'AC23.02', label: 'Utiliser des serveurs et services réseaux virtualisés' },
      { code: 'AC21.03', label: 'Adopter de bonnes pratiques de conception et de programmation' }
    ],
    description: [
      'Monorepo regroupant l\'API, l\'application web, l\'extension navigateur et l\'application mobile',
      'Hachage des mots de passe maître avec Argon2, sessions JWT',
      'Double authentification par TOTP et connexion par passkeys (WebAuthn)',
      'Cache et sessions avec Redis, envoi de mails transactionnels',
      'Déploiement conteneurisé (Docker, Nginx, PM2) et CI avec GitHub Actions'
    ],
    role: [
      'Conception de l\'architecture du monorepo et du modèle de données Prisma',
      'Développement de l\'API NestJS et des mécanismes d\'authentification',
      'Développement des clients SolidJS (web et extension)',
      'Mise en place du déploiement et de l\'intégration continue'
    ],
    deliverables: [
      'Application en production sur pwd.smashballoon.fr',
      'Extension navigateur et application mobile',
      'Pipeline CI/CD GitHub Actions'
    ],
    proof: 'Capacité à concevoir une application multi-plateforme où la sécurité est au cœur : authentification forte, chiffrement et gestion fine des sessions.',
    links: [{ label: 'Voir le site', url: 'https://pwd.smashballoon.fr', icon: 'external-link' }]
  },
  'edtunilim': {
    title: 'EDTUnilim',
    subtitle: 'Emplois du temps de l\'IUT',
    icon: 'calendar',
    category: 'web',
    private: true,
    summary: 'Emplois du temps du département informatique de l\'IUT du Limousin : une API Rust lit les PDF publiés et les sert en JSON, une interface web les affiche par semaine.',
    tags: ['Rust', 'Axum', 'SolidJS', 'Docker'],
    stack: ['Rust', 'Axum', 'Tokio', 'reqwest', 'lopdf', 'Serde', 'SolidJS', 'TypeScript', 'Tailwind CSS', 'Vite', 'Docker Compose', 'Nginx', 'GitHub Actions'],
    targetSkills: [
      { code: 'AC24.04', label: 'Manipuler des données hétérogènes' },
      { code: 'AC22.02', label: 'Utiliser des techniques algorithmiques adaptées' },
      { code: 'AC23.01', label: 'Concevoir et développer des applications communicantes' },
      { code: 'AC11.04', label: 'Développer des interfaces utilisateurs' }
    ],
    description: [
      'Récupération des PDF d\'emploi du temps publiés par le département',
      'Extraction des créneaux depuis les PDF (lopdf) et exposition en JSON via une API Axum',
      'Interface web SolidJS affichant l\'emploi du temps semaine par semaine',
      'Réécriture en Rust de la version NestJS précédente (api-edt-unilim)'
    ],
    role: [
      'Développement de l\'API asynchrone en Rust (Axum, Tokio)',
      'Écriture du parseur de PDF',
      'Développement de l\'interface web',
      'Conteneurisation avec Docker Compose et CI GitHub Actions'
    ],
    deliverables: [
      'API JSON des emplois du temps',
      'Interface web de consultation',
      'Stack Docker Compose prête à déployer'
    ],
    proof: 'Capacité à transformer des données non structurées (PDF) en API fiable, et à porter un projet existant vers un langage plus performant.',
    links: []
  },
  'api-edt': {
    title: 'api-edt-unilim',
    subtitle: 'Première version de l\'API EDT',
    icon: 'calendar-clock',
    category: 'web',
    summary: 'Version NestJS précédente de l\'API des emplois du temps, qui extrait les créneaux depuis les PDF de l\'IUT.',
    tags: ['NestJS', 'TypeScript', 'pdf2json', 'Jest'],
    stack: ['TypeScript', 'NestJS', 'pdf2json', 'jsdom', 'canvas', 'Axios', 'Jest'],
    targetSkills: [
      { code: 'AC24.04', label: 'Manipuler des données hétérogènes' },
      { code: 'AC12.01', label: 'Analyser un problème avec méthode' },
      { code: 'AC21.04', label: 'Vérifier et valider la qualité de l\'application par les tests' }
    ],
    description: [
      'Téléchargement des PDF d\'emploi du temps avec Axios',
      'Extraction des créneaux avec pdf2json',
      'API REST NestJS exposant les créneaux',
      'Tests avec Jest'
    ],
    proof: 'Première approche du parsing de PDF et de la conception d\'API REST, base de la version Rust actuelle.',
    links: [{ label: 'Voir sur GitHub', url: GH + 'api-edt-unilim', icon: 'folder-git-2' }]
  },
  'formulaire-app': {
    title: 'formulaire-app',
    subtitle: 'Création et gestion de formulaires',
    icon: 'clipboard-list',
    category: 'web',
    private: true,
    summary: 'Application de création et de gestion de formulaires (rubriques, questions, signature), avec authentification LDAP et exports PDF et Excel.',
    tags: ['Laravel', 'React', 'Inertia.js', 'PostgreSQL', 'LDAP'],
    stack: ['PHP', 'Laravel', 'Inertia.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vite', 'PostgreSQL', 'LDAP (LdapRecord)', 'DomPDF', 'FPDI', 'PhpSpreadsheet', 'pdf.js', 'Docker', 'Nginx', 'GitHub Actions'],
    targetSkills: [
      { code: 'AC21.01', label: 'Élaborer et implémenter les spécifications fonctionnelles' },
      { code: 'AC24.03', label: 'Organiser la restitution de données par la programmation' },
      { code: 'AC14.03', label: 'Concevoir une BDD relationnelle à partir d\'un cahier des charges' },
      { code: 'AC23.03', label: 'Sécuriser les services et données d\'un système' }
    ],
    description: [
      'Construction de formulaires organisés en rubriques et questions',
      'Signature des formulaires',
      'Connexion avec les comptes de l\'annuaire LDAP',
      'Exports en PDF (DomPDF, FPDI) et en Excel (PhpSpreadsheet)'
    ],
    proof: 'Capacité à livrer une application métier complète intégrée au système d\'information (annuaire LDAP) avec restitution des données en plusieurs formats.',
    links: []
  },
  'contact-app': {
    title: 'contact-app',
    subtitle: 'Annuaire de contacts',
    icon: 'contact',
    category: 'web',
    private: true,
    summary: 'Annuaire de contacts : pages de contact des utilisateurs, classées par département, avec authentification LDAP.',
    tags: ['Laravel', 'Vue 3', 'Inertia.js', 'LDAP'],
    stack: ['PHP', 'Laravel', 'Fortify', 'Inertia.js', 'Vue 3', 'TypeScript', 'Tailwind CSS', 'Reka UI', 'Vite', 'LDAP (LdapRecord)', 'Docker', 'GitHub Actions'],
    targetSkills: [
      { code: 'AC11.04', label: 'Développer des interfaces utilisateurs' },
      { code: 'AC21.02', label: 'Appliquer des principes d\'accessibilité et d\'ergonomie' },
      { code: 'AC23.03', label: 'Sécuriser les services et données d\'un système' }
    ],
    description: [
      'Page de contact pour chaque utilisateur',
      'Classement des contacts par département',
      'Authentification via l\'annuaire LDAP (LdapRecord, Fortify)'
    ],
    proof: 'Maîtrise d\'un second écosystème front (Vue 3) avec Laravel et intégration à un annuaire d\'entreprise.',
    links: []
  },
  'gestion-licences': {
    title: 'Gestion_Licences',
    subtitle: 'Gestion de licences logicielles',
    icon: 'key-round',
    category: 'web',
    featured: true,
    summary: 'Catalogue de licences logicielles, affectation aux utilisateurs, statistiques et mail automatique à l\'approche de la fin de validité.',
    tags: ['NestJS', 'SolidJS', 'Prisma', 'Chart.js'],
    stack: ['TypeScript', 'NestJS', 'Prisma', 'PostgreSQL', 'LDAP (ldapts)', 'Nodemailer', 'SolidJS', 'Chart.js', 'Tailwind CSS', 'Vite', 'Docker', 'Nginx'],
    targetSkills: [
      { code: 'AC14.02', label: 'Visualiser des données' },
      { code: 'AC14.03', label: 'Concevoir une BDD relationnelle à partir d\'un cahier des charges' },
      { code: 'AC25.02', label: 'Formaliser les besoins du client et de l\'utilisateur' },
      { code: 'AC23.01', label: 'Concevoir et développer des applications communicantes' }
    ],
    description: [
      'Catalogue des licences logicielles',
      'Affectation des licences aux utilisateurs de l\'annuaire LDAP',
      'Tableau de bord statistique avec Chart.js',
      'Mail automatique à l\'approche de la fin de validité d\'une licence'
    ],
    proof: 'Capacité à automatiser un processus métier (suivi des échéances) et à restituer les données sous forme de statistiques.',
    links: [{ label: 'Voir sur GitHub', url: GH + 'Gestion_Licences', icon: 'folder-git-2' }]
  },
  'questionnaire': {
    title: 'Questionnaire',
    subtitle: 'Questionnaires en temps réel',
    icon: 'layers',
    category: 'web',
    summary: 'Application de questionnaires en temps réel avec QR code pour rejoindre une session : frontend React et API Express.',
    tags: ['React', 'Express', 'Socket.IO', 'Prisma'],
    stack: ['TypeScript', 'React', 'Vite', 'Tailwind CSS', 'React Router', 'Socket.IO', 'qr-code-styling', 'Node.js', 'Express', 'Prisma', 'JWT', 'bcrypt', 'PM2'],
    targetSkills: [
      { code: 'AC23.01', label: 'Concevoir et développer des applications communicantes' },
      { code: 'AC11.04', label: 'Développer des interfaces utilisateurs' },
      { code: 'AC21.03', label: 'Adopter de bonnes pratiques de conception et de programmation' }
    ],
    description: [
      'Questionnaires joués en temps réel grâce à Socket.IO',
      'QR code pour rejoindre une session',
      'Comptes utilisateurs (JWT, bcrypt) et gestion des questions',
      'Frontend et backend dans deux dépôts séparés'
    ],
    proof: 'Maîtrise de la communication temps réel client-serveur et de la séparation front / back.',
    links: [
      { label: 'Frontend', url: GH + 'questionnaire-Frontend', icon: 'folder-git-2' },
      { label: 'Backend', url: GH + 'questionnaire-Backend', icon: 'folder-git-2' }
    ]
  },
  'bots-minecraft': {
    title: 'bots-minecraft',
    subtitle: 'Bot Discord pour Minecraft',
    icon: 'bot',
    category: 'tools',
    summary: 'Bot Discord pour piloter un serveur Minecraft depuis Discord, avec commandes slash chargées automatiquement.',
    tags: ['TypeScript', 'discord.js', 'RCON'],
    stack: ['TypeScript', 'Node.js', 'discord.js', 'RCON'],
    targetSkills: [
      { code: 'AC23.01', label: 'Concevoir et développer des applications communicantes' },
      { code: 'AC21.03', label: 'Adopter de bonnes pratiques de conception et de programmation' }
    ],
    description: [
      'Commandes slash Discord envoyées au serveur Minecraft via RCON',
      'Chargement automatique des commandes au démarrage'
    ],
    proof: 'Intégration de deux services externes (API Discord et protocole RCON) dans une application événementielle.',
    links: [{ label: 'Voir sur GitHub', url: GH + 'bots-minecraft', icon: 'folder-git-2' }]
  },
  'usermanager': {
    title: 'userManager',
    subtitle: 'Administration Linux',
    icon: 'users',
    category: 'tools',
    summary: 'Outil en ligne de commande avec menus pour créer et supprimer des utilisateurs et des groupes sur un système Linux.',
    tags: ['Bash', 'whiptail', 'GitHub Actions'],
    stack: ['Bash', 'whiptail', 'GitHub Actions'],
    targetSkills: [
      { code: 'AC13.03', label: 'Installer et configurer un système d\'exploitation' },
      { code: 'AC13.02', label: 'Utiliser les fonctionnalités d\'un système multitâches' }
    ],
    description: [
      'Menus interactifs en terminal avec whiptail',
      'Création et suppression d\'utilisateurs et de groupes',
      'Vérification du script avec GitHub Actions'
    ],
    proof: 'Automatisation de tâches d\'administration système Linux.',
    links: [{ label: 'Voir sur GitHub', url: GH + 'userManager', icon: 'folder-git-2' }]
  },
  's2-03': {
    title: 'S2.03',
    subtitle: 'Laboratoire réseau virtuel',
    icon: 'network',
    category: 'sae',
    summary: 'Topologie d\'entreprise simulée avec routeurs, serveurs et postes clients.',
    tags: ['Réseau', 'Shell'],
    stack: ['Shell', 'lab.conf', 'scripts .startup'],
    targetSkills: [
      { code: 'AC13.04', label: 'Configurer un poste dans un réseau d\'entreprise' },
      { code: 'AC23.02', label: 'Utiliser des serveurs et services réseaux virtualisés' }
    ],
    description: [
      'Réseau d\'entreprise virtuel décrit dans un fichier lab.conf',
      'Configuration des routeurs, serveurs et postes par scripts .startup'
    ],
    proof: 'Conception et configuration d\'un réseau d\'entreprise virtualisé.',
    links: [{ label: 'Voir sur GitHub', url: GH + 'S2.03', icon: 'folder-git-2' }]
  },
  'gestion-bibliotheque': {
    title: 'Gestion-Bibliotheque',
    subtitle: 'SAÉ Système d\'exploitation',
    icon: 'library',
    category: 'sae',
    summary: 'Gestion simplifiée d\'une bibliothèque en Bash : livres, membres, emprunts, retours et rappels.',
    tags: ['Bash'],
    stack: ['Bash', 'fichiers texte'],
    targetSkills: [
      { code: 'AC13.02', label: 'Utiliser les fonctionnalités d\'un système multitâches' },
      { code: 'AC11.01', label: 'Implémenter des conceptions simples' }
    ],
    description: [
      'Gestion des livres et des membres',
      'Emprunts, retours et rappels',
      'Données stockées dans des fichiers texte'
    ],
    proof: 'Utilisation du shell pour construire une petite application de gestion.',
    links: [{ label: 'Voir sur GitHub', url: GH + 'Gestion-Bibliotheque', icon: 'folder-git-2' }]
  },
  'sae-mini-jeux': {
    title: 'sae-Mini-jeux',
    subtitle: 'Mini-jeux en console',
    icon: 'gamepad-2',
    category: 'sae',
    summary: 'Devinettes, allumettes, morpion et puissance 4 en console, avec des bots à deux niveaux de difficulté et un tableau des scores.',
    tags: ['Python', 'SQLite'],
    stack: ['Python', 'SQLite'],
    targetSkills: [
      { code: 'AC12.02', label: 'Comparer des algorithmes pour des problèmes classiques' },
      { code: 'AC11.01', label: 'Implémenter des conceptions simples' },
      { code: 'AC14.01', label: 'Mettre à jour et interroger une base de données relationnelle' }
    ],
    description: [
      'Quatre jeux : devinettes, allumettes, morpion et puissance 4',
      'Bots avec deux niveaux de difficulté',
      'Tableau des scores enregistré en SQLite'
    ],
    proof: 'Mise en œuvre d\'algorithmes de jeu et persistance des données dans une base relationnelle.',
    links: [{ label: 'Voir sur GitHub', url: GH + 'sae-Mini-jeux', icon: 'folder-git-2' }]
  }
};

// ─── Project Cards ───────────────────────────────────────
const projectsGrid = document.getElementById('projectsGrid');

function renderProjectLinks(project) {
  const links = project.links
    .map(link => `<a href="${link.url}" target="_blank" rel="noopener" class="project-link"><i data-lucide="${link.icon}"></i> ${link.label}</a>`)
    .join('');
  const privateBadge = project.private
    ? '<span class="project-wip"><i data-lucide="lock"></i> Dépôt privé</span>'
    : '';
  return `<div class="project-links">${links}${privateBadge}</div>`;
}

// Le projet phare (featured: true) passe en premier
projectsGrid.innerHTML = Object.entries(projectsData)
  .sort(([, a], [, b]) => Boolean(b.featured) - Boolean(a.featured))
  .map(([id, project]) => `
    <div class="project-card${project.featured ? ' project-card--featured' : ''}" role="button" tabindex="0" data-project-id="${id}" data-category="${project.category}">
      <div class="project-icon"><i data-lucide="${project.icon}"></i></div>
      <div class="project-body">
        ${project.featured ? '<span class="project-featured-badge"><i data-lucide="star"></i> Projet phare</span>' : ''}
        <h3>${project.title}</h3>
        <p>${project.summary}</p>
        ${project.featured ? `<ul class="project-highlights">${project.description.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
        <div class="project-tags">
          ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
        </div>
        ${renderProjectLinks(project)}
      </div>
    </div>`)
  .join('');

lucide.createIcons();

// Liens des cartes : ne pas ouvrir la modale
projectsGrid.querySelectorAll('.project-link').forEach(link => {
  link.addEventListener('click', e => e.stopPropagation());
});

// Filtres
const projectFilters = document.getElementById('projectFilters');

projectFilters.addEventListener('click', e => {
  const btn = e.target.closest('.project-filter');
  if (!btn) return;
  clearTechFilter();
  projectFilters.querySelectorAll('.project-filter').forEach(b => b.classList.toggle('active', b === btn));
  const filter = btn.dataset.filter;
  projectsGrid.querySelectorAll('.project-card').forEach(card => {
    card.hidden = filter !== 'all' && card.dataset.category !== filter;
  });
});

// Filtre par technologie (clic sur une compétence)
const techBanner = document.createElement('div');
techBanner.className = 'tech-filter-banner';
techBanner.hidden = true;
projectFilters.after(techBanner);

const techEmpty = document.createElement('p');
techEmpty.className = 'tech-filter-empty';
techEmpty.textContent = 'Aucun projet de la sélection n\'utilise encore cette technologie.';
techEmpty.hidden = true;
projectsGrid.after(techEmpty);

// Libellé de la compétence -> nom utilisé dans les stacks des projets
const techAliases = { 'Express.js': 'Express', 'Vue 3': 'Vue 3', 'Tailwind CSS': 'Tailwind CSS' };

function clearTechFilter() {
  techBanner.hidden = true;
  techEmpty.hidden = true;
  document.querySelectorAll('.skill-list li.active').forEach(li => li.classList.remove('active'));
}

function filterByTech(li) {
  const label = li.textContent.trim();
  const tech = (techAliases[label] || label).toLowerCase();

  document.querySelectorAll('.skill-list li').forEach(item => item.classList.toggle('active', item === li));
  projectFilters.querySelectorAll('.project-filter').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));

  let count = 0;
  projectsGrid.querySelectorAll('.project-card').forEach(card => {
    const { tags, stack } = projectsData[card.dataset.projectId];
    const match = [...tags, ...stack].some(t => t.toLowerCase() === tech);
    card.hidden = !match;
    if (match) count++;
  });

  techBanner.innerHTML = `<span>Projets utilisant <strong>${label}</strong> (${count})</span>
    <button type="button" aria-label="Retirer le filtre"><i data-lucide="x"></i></button>`;
  techBanner.hidden = false;
  techEmpty.hidden = count > 0;
  techBanner.querySelector('button').addEventListener('click', () => {
    clearTechFilter();
    projectsGrid.querySelectorAll('.project-card').forEach(card => { card.hidden = false; });
  });
  lucide.createIcons();

  document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
}

document.querySelectorAll('.skill-list li').forEach(li => {
  li.tabIndex = 0;
  li.setAttribute('role', 'button');
  li.addEventListener('click', () => filterByTech(li));
  li.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); filterByTech(li); }
  });
});

// ─── Project Modal Functions ─────────────────────────────
const projectModal = document.getElementById('projectModal');
const projectModalOverlay = document.querySelector('.project-modal-overlay');
const projectModalClose = document.getElementById('projectModalClose');
const projectModalCloseBtn = document.getElementById('projectModalCloseBtn');

// Remplit une liste de la modale et masque sa section si elle est vide
function fillModalList(id, items = []) {
  const list = document.getElementById(id);
  list.innerHTML = items.map(item => `<li>${item}</li>`).join('');
  list.closest('.modal-section').hidden = items.length === 0;
}

function openProjectModal(projectId) {
  const project = projectsData[projectId];
  if (!project) return;

  // Set header
  document.getElementById('projectModalTitle').textContent = project.title;
  document.getElementById('projectModalIcon').innerHTML = `<i data-lucide="${project.icon}"></i>`;
  document.getElementById('projectModalTags').innerHTML = [project.subtitle, ...(project.private ? ['Dépôt privé'] : [])]
    .map(tag => `<span>${tag}</span>`)
    .join('');

  // Set body sections
  fillModalList('projectTargetSkills', project.targetSkills.map(skill => `<strong>${skill.code}</strong> – ${skill.label}`));
  fillModalList('projectDescription', project.description);
  fillModalList('projectRole', project.role);
  fillModalList('projectDeliverables', project.deliverables);
  document.getElementById('projectProof').textContent = project.proof;
  document.getElementById('projectStack').innerHTML = project.stack
    .map(tech => `<span>${tech}</span>`)
    .join('');

  // Set links
  document.getElementById('projectModalLinks').innerHTML = project.links
    .map(link => `<a href="${link.url}" target="_blank" rel="noopener" class="btn btn-primary"><i data-lucide="${link.icon}"></i> ${link.label}</a>`)
    .join('');

  // Open modal
  projectModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Reinitialize lucide icons in modal
  lucide.createIcons();
}

function closeProjectModal() {
  projectModal.classList.remove('open');
  document.body.style.overflow = '';
}

// Event listeners for modal
projectModalClose.addEventListener('click', closeProjectModal);
projectModalCloseBtn.addEventListener('click', closeProjectModal);
projectModalOverlay.addEventListener('click', closeProjectModal);

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && projectModal.classList.contains('open')) {
    closeProjectModal();
  }
});

// Project cards click handlers
projectsGrid.querySelectorAll('.project-card[data-project-id]').forEach(card => {
  card.addEventListener('click', () => {
    openProjectModal(card.getAttribute('data-project-id'));
  });

  // Keyboard support
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProjectModal(card.getAttribute('data-project-id'));
    }
  });
});
