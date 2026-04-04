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

// ─── Project Modal Data ──────────────────────────────────
const projectsData = {
  'pwd-manager': {
    title: 'Gestionnaire de Mot de Passe',
    icon: 'shield',
    tags: ['JavaScript', 'HTML5', 'CSS3', 'Cryptage'],
    targetSkills: [
      { code: 'C1', label: 'Réaliser une application informatique simple', details: 'Développement d\'une application fonctionnelle avec interface' },
      { code: 'AC11.04', label: 'Développer des interfaces utilisateurs', details: 'Interface moderne, intuitive et responsive' },
      { code: 'AC22.03', label: 'Comprendre les enjeux de sécurisation des données', details: 'Mise en place du chiffrement côté client' }
    ],
    description: [
      'Application de gestion de mots de passe sécurisée',
      'Chiffrement côté client (WebCrypto API)',
      'Interface moderne et intuitive',
      'Stockage local sécurisé'
    ],
    role: [
      'Conception de l\'architecture et du flux de données',
      'Implémentation du système de chiffrement',
      'Développement de l\'interface utilisateur',
      'Tests de sécurité et optimisation'
    ],
    deliverables: [
      'Application web fonctionnelle',
      'Code source sur GitHub',
      'Documentation de sécurité',
      'Déploiement en production'
    ],
    proof: 'Capacité à concevoir et implémenter une application sécurisée avec authentification et chiffrement des données sensibles.',
    link: 'https://pwd.smashballoon.fr'
  },
  'questionnaire': {
    title: 'Questionnaire',
    icon: 'layers',
    tags: ['React 19', 'TypeScript', 'Socket.IO', 'NestJS', 'Tailwind'],
    targetSkills: [
      { code: 'C1', label: 'Réaliser une application informatique simple', details: 'Application frontend complète avec React 19' },
      { code: 'C2', label: 'Optimiser une application informatique', details: 'Optimisation du rendu et gestion d\'état' },
      { code: 'AC11.04', label: 'Développer des interfaces utilisateurs', details: 'Interface réactive avec Tailwind CSS' },
      { code: 'AC21.03', label: 'Adopter de bonnes pratiques de conception', details: 'Code TypeScript typé et maintenable' },
      { code: 'AC23.01', label: 'Concevoir des applications communicantes', details: 'Socket.IO pour la synchronisation temps réel' }
    ],
    description: [
      'Application de quiz en temps réel multi-joueurs',
      'Système de création et gestion de quiz',
      'Mode hôte/joueur avec synchronisation temps réel',
      '4 types de questions différentes',
      'Authentification complète avec gestion des comptes'
    ],
    role: [
      'Développement du frontend en React 19 avec TypeScript',
      'Intégration de Socket.IO pour la synchronisation',
      'Design de l\'interface avec Tailwind CSS',
      'Collaboration avec l\'équipe backend NestJS',
      'Tests et débogage des fonctionnalités temps réel'
    ],
    deliverables: [
      'Application React fully fonctionnelle',
      'Code source GitHub',
      'Documentation technique',
      'Tests unitaires et d\'intégration'
    ],
    proof: 'Expertise en développement d\'applications modernes avec gestion d\'état complexe, communication en temps réel et interface utilisateur réactive.',
    link: 'https://github.com/SmasBalloon/questionnaire-Frontend'
  },
  'dualsync': {
    title: 'DualSync CLI',
    icon: 'package',
    tags: ['TypeScript', 'Node.js', 'Bun', 'CLI'],
    targetSkills: [
      { code: 'C1', label: 'Réaliser une application informatique simple', details: 'Outil CLI complet et fonctionnel' },
      { code: 'C2', label: 'Optimiser une application informatique', details: 'Performances optimisées avec Bun' },
      { code: 'AC12.01', label: 'Analyser un problème avec méthode', details: 'Analyse des besoins des développeurs' },
      { code: 'AC21.03', label: 'Adopter de bonnes pratiques', details: 'Code TypeScript typé et documenté' }
    ],
    description: [
      'CLI pour scaffolder des projets full-stack automatiquement',
      'Support de multiples frameworks (React, Vue, Angular...)',
      'Choix du backend (Node.js, Python, .NET)',
      'Configuration automatique de Docker',
      'Installation des dépendances intégrée'
    ],
    role: [
      'Conception du système de configuration et menu interactif',
      'Développement en TypeScript et Node.js',
      'Intégration avec Bun pour les performances',
      'Gestion des templates de projets',
      'Documentation complète et exemples'
    ],
    deliverables: [
      'Package npm publié',
      'Code source sur GitHub',
      'Documentation et guide d\'utilisation',
      'Templates de projets maintenus'
    ],
    proof: 'Compétence en création d\'outils de développement, automatisation et amélioration du workflow des développeurs.',
    link: 'https://github.com/SmasBalloon/dualsync'
  },
  'api-edt': {
    title: 'API EDT — IUT Limousin',
    icon: 'calendar',
    tags: ['NestJS', 'TypeScript', 'Scraping PDF'],
    targetSkills: [
      { code: 'C4', label: 'Gérer des données de l\'information', details: 'Modélisation et interrogation de bases de données' },
      { code: 'AC14.01', label: 'Interroger une base de données relationnelle', details: 'Construction de requêtes optimisées' },
      { code: 'AC14.03', label: 'Concevoir une BDD relationnelle', details: 'Modèle de données pour cache et scraping' },
      { code: 'AC24.01', label: 'Optimiser les modèles de données', details: 'Indexation et optimisation des requêtes' },
      { code: 'AC12.02', label: 'Comparer des algorithmes', details: 'Algorithmes de parsing PDF efficaces' }
    ],
    description: [
      'API REST expose les emplois du temps de l\'IUT',
      'Scraping et parsing automatique des PDF d\'emploi du temps',
      'Base de données pour cache et optimisation',
      'Endpoints RESTful simples et efficaces',
      'Actualisation automatique des données'
    ],
    role: [
      'Développement du scraper PDF en TypeScript',
      'Création de l\'API NestJS',
      'Conception du modèle de données',
      'Optimisation des performances',
      'Documentation API complète'
    ],
    deliverables: [
      'API fonctionnelle accessible publiquement',
      'Code source sur GitHub',
      'Documentation API (Swagger)',
      'Scripts de maintenance et mise à jour'
    ],
    proof: 'Capacité à transformer des données non-structurées (PDF) en API structurée, démontrant la maîtrise du parsing et de la gestion des données.',
    link: 'https://github.com/SmasBalloon/api-edt-unilim'
  },
  'bot-discord': {
    title: 'Bot Discord',
    icon: 'bot',
    tags: ['JavaScript', 'Discord.js', 'Node.js'],
    targetSkills: [
      { code: 'C1', label: 'Réaliser une application informatique simple', details: 'Bot Discord fonctionnel et multifonction' },
      { code: 'AC11.03', label: 'Faire des essais et évaluer les résultats', details: 'Tests des commandes et automatisations' },
      { code: 'AC23.01', label: 'Concevoir des applications communicantes', details: 'Intégration API Discord pour communication' },
      { code: 'AC21.03', label: 'Adopter de bonnes pratiques', details: 'Code maintenable et modulaire' }
    ],
    description: [
      'Bot Discord avec commandes slash modernes',
      'Gestion des serveurs Discord (salons, rôles, messages)',
      'Automatisations personnalisables',
      'Système de permissions complet',
      'Module d\'extensions pour ajouter des fonctionnalités'
    ],
    role: [
      'Développement en Discord.js',
      'Création du système de commandes',
      'Implémentation des fonctionnalités de gestion',
      'Gestion des événements Discord',
      'Déploiement et maintenance'
    ],
    deliverables: [
      'Bot Discord opérationnel',
      'Code source sur GitHub',
      'Documentation des commandes',
      'Guide de déploiement'
    ],
    proof: 'Maîtrise du développement d\'applications événementielles et de l\'intégration avec API externes (Discord.js).',
    link: 'https://github.com/SmasBalloon/bot-discord'
  }
};

// ─── Project Modal Functions ─────────────────────────────
const projectModal = document.getElementById('projectModal');
const projectModalOverlay = document.querySelector('.project-modal-overlay');
const projectModalClose = document.getElementById('projectModalClose');
const projectModalCloseBtn = document.getElementById('projectModalCloseBtn');

function openProjectModal(projectId) {
  const project = projectsData[projectId];
  if (!project) return;

  // Set header
  document.getElementById('projectModalTitle').textContent = project.title;
  document.getElementById('projectModalIcon').innerHTML = `<i data-lucide="${project.icon}"></i>`;
  
  // Set tags
  const tagsContainer = document.getElementById('projectModalTags');
  tagsContainer.innerHTML = project.tags
    .map(tag => `<span>${tag}</span>`)
    .join('');

  // Set body sections - Target Skills
  const skillsContainer = document.getElementById('projectTargetSkills');
  skillsContainer.innerHTML = project.targetSkills
    .map(skill => `<li><strong>${skill.code}</strong> – ${skill.label}</li>`)
    .join('');
  
  document.getElementById('projectDescription').innerHTML = project.description
    .map(item => `<li>${item}</li>`)
    .join('');
  
  document.getElementById('projectRole').innerHTML = project.role
    .map(item => `<li>${item}</li>`)
    .join('');
  
  document.getElementById('projectDeliverables').innerHTML = project.deliverables
    .map(item => `<li>${item}</li>`)
    .join('');
  
  document.getElementById('projectProof').textContent = project.proof;

  // Set link
  const projectLink = document.getElementById('projectModalLink');
  projectLink.href = project.link;

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
document.querySelectorAll('.project-card[data-project-id]').forEach(card => {
  card.addEventListener('click', () => {
    const projectId = card.getAttribute('data-project-id');
    openProjectModal(projectId);
  });

  // Keyboard support
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const projectId = card.getAttribute('data-project-id');
      openProjectModal(projectId);
    }
  });
});
