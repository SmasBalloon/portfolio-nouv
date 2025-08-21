// Navigation mobile
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Fermer le menu mobile lors du clic sur un lien
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Navigation scrollée
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Navigation douce
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Animation des éléments au scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

// Observer tous les éléments à animer
document.addEventListener('DOMContentLoaded', () => {
    // Ajouter une classe pour indiquer que JavaScript est chargé
    document.body.classList.add('js-loaded');
    
    const animateElements = document.querySelectorAll('.skills-category, .timeline-item, .project-card, .contact-content');
    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
});

// Animation des statistiques
const animateCounters = () => {
    const counters = document.querySelectorAll('.stat h3');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace('+', '').replace('%', ''));
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target + (counter.textContent.includes('+') ? '+' : counter.textContent.includes('%') ? '%' : '');
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current) + (counter.textContent.includes('+') ? '+' : counter.textContent.includes('%') ? '%' : '');
            }
        }, 50);
    });
};

// Observer pour les statistiques
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const aboutSection = document.querySelector('#about');
if (aboutSection) {
    statsObserver.observe(aboutSection);
}

// Formulaire de contact
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Vérification des champs requis
        const requiredFields = this.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showError(field, 'Ce champ est requis');
                isValid = false;
            }
        });
        
        if (!isValid) {
            return;
        }
        
        // Simulation d'envoi
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Envoi en cours...';
        submitBtn.disabled = true;
        submitBtn.style.background = 'var(--secondary-color)';
        
        // Récupérer les données du formulaire
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Envoyer vers Discord
        sendToDiscord(name, email, subject, message)
            .then(() => {
                submitBtn.textContent = '✓ Message envoyé !';
                submitBtn.style.background = 'var(--accent-color)';
                
                // Afficher un message de succès
                showSuccessMessage('Message envoyé avec succès !');
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    this.reset();
                }, 3000);
            })
            .catch((error) => {
                console.error('Erreur envoi:', error);
                submitBtn.textContent = '❌ Erreur d\'envoi';
                submitBtn.style.background = '#ef4444';
                
                showSuccessMessage('Erreur lors de l\'envoi. Réessayez plus tard.', true);
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 3000);
            });
    });
} else {
    console.error('Formulaire de contact non trouvé');
}

// Configuration Discord Webhook
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1365107656192163881/xPA9Mpz9GiDp0JVUO0CGcUd6glnbYIO3O6q3x_t_H0VRmEWs7-0julFN-H-1ibYEpePO'; // À remplacer par votre URL

// Fonction pour envoyer vers Discord
async function sendToDiscord(name, email, subject, message) {
    if (DISCORD_WEBHOOK_URL === 'VOTRE_WEBHOOK_URL_ICI') {
        throw new Error('Webhook Discord non configuré');
    }
    
    const embed = {
        title: '📧 Nouveau message du portfolio',
        color: 3447003, // Bleu
        fields: [
            {
                name: '👤 Nom',
                value: name,
                inline: true
            },
            {
                name: '📧 Email',
                value: email,
                inline: true
            },
            {
                name: '📋 Sujet',
                value: subject,
                inline: false
            },
            {
                name: '💬 Message',
                value: message,
                inline: false
            }
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Portfolio Mathis Sauvage'
        }
    };
    
    const payload = {
        content: '<@682531276078841881>', // Mention pour notification
        username: 'Portfolio Bot',
        avatar_url: 'https://cdn.discordapp.com/emojis/123456789.png', // Optionnel
        embeds: [embed]
    };
    
    const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`Erreur Discord: ${response.status}`);
    }
    
    return response;
}

// Fonction pour afficher les messages de succès/erreur
function showSuccessMessage(message, isError = false) {
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${isError ? '#ef4444' : 'var(--accent-color)'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    successMessage.textContent = message;
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.remove();
    }, 5000);
}

// Validation du formulaire en temps réel
const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
formInputs.forEach(input => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', clearError);
});

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Supprimer les erreurs précédentes
    clearError(e);
    
    if (!value) {
        showError(field, 'Ce champ est requis');
        return false;
    }
    
    if (field.type === 'email' && !isValidEmail(value)) {
        showError(field, 'Veuillez entrer une adresse email valide');
        return false;
    }
    
    return true;
}

function showError(field, message) {
    field.classList.add('error');
    let errorDiv = field.parentNode.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function clearError(e) {
    const field = e.target;
    field.classList.remove('error');
    const errorDiv = field.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Effet de parallaxe léger pour le hero (désactivé pour éviter le débordement)
// window.addEventListener('scroll', () => {
//     const scrolled = window.pageYOffset;
//     const parallax = document.querySelector('.hero');
//     if (parallax) {
//         const speed = scrolled * 0.5;
//         parallax.style.transform = `translateY(${speed}px)`;
//     }
// });

// Animation des compétences au survol
document.querySelectorAll('.skill-item').forEach(skill => {
    skill.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05) translateY(-2px)';
    });
    
    skill.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) translateY(0)';
    });
});

// Animation des cartes de projet
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-15px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Effet de typing pour le titre
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Démarrer l'effet de typing au chargement
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 50);
    }
});

// Gestion du thème clair/sombre (optionnel)
const themeToggle = document.createElement('button');
themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
themeToggle.className = 'theme-toggle';
themeToggle.style.cssText = `
    position: fixed;
    top: 50%;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    background: var(--primary-color);
    color: white;
    cursor: pointer;
    z-index: 1000;
    box-shadow: var(--shadow-lg);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
`;

document.body.appendChild(themeToggle);

// Charger le thème sauvegardé
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Appliquer le thème au chargement
if (isDarkMode) {
    applyDarkMode();
} else {
    applyLightMode();
}

function applyDarkMode() {
    document.documentElement.style.setProperty('--background-light', '#1a1a1a');
    document.documentElement.style.setProperty('--background-white', '#2d2d2d');
    document.documentElement.style.setProperty('--text-primary', '#ffffff');
    document.documentElement.style.setProperty('--text-secondary', '#a0a0a0');
    document.documentElement.style.setProperty('--border-color', '#404040');
    document.documentElement.style.setProperty('--shadow-sm', '0 1px 2px 0 rgb(0 0 0 / 0.3)');
    document.documentElement.style.setProperty('--shadow-md', '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)');
    document.documentElement.style.setProperty('--shadow-lg', '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)');
    document.body.style.backgroundColor = '#1a1a1a';
    document.body.style.color = '#ffffff';
    
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.background = 'rgba(45, 45, 45, 0.95)';
        navbar.style.borderBottomColor = '#404040';
    }
    
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

function applyLightMode() {
    document.documentElement.style.setProperty('--background-light', '#f8fafc');
    document.documentElement.style.setProperty('--background-white', '#ffffff');
    document.documentElement.style.setProperty('--text-primary', '#1e293b');
    document.documentElement.style.setProperty('--text-secondary', '#64748b');
    document.documentElement.style.setProperty('--border-color', '#e2e8f0');
    document.documentElement.style.setProperty('--shadow-sm', '0 1px 2px 0 rgb(0 0 0 / 0.05)');
    document.documentElement.style.setProperty('--shadow-md', '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)');
    document.documentElement.style.setProperty('--shadow-lg', '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)');
    document.body.style.backgroundColor = '#f8fafc';
    document.body.style.color = '#333';
    
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.borderBottomColor = '#e2e8f0';
    }
    
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
}

themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        applyDarkMode();
        localStorage.setItem('darkMode', 'true');
    } else {
        applyLightMode();
        localStorage.setItem('darkMode', 'false');
    }
});

// Animation des liens sociaux
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) rotate(360deg)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) rotate(0deg)';
    });
});

// Preloader simple
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Lazy loading pour les images (si ajoutées plus tard)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Gestion des erreurs JavaScript
window.addEventListener('error', (e) => {
    console.error('Erreur JavaScript:', e.error);
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
        }, 0);
    });
}

// Accessibilité : gestion du focus au clavier
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('using-keyboard');
});

// Easter egg : Konami Code
let konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.keyCode === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            // Effet spécial activé !
            document.body.style.animation = 'rainbow 2s infinite';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 5000);
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

// Ajout de l'animation rainbow pour l'easter egg
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
    
    .using-keyboard *:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
    }
    
    .error {
        border-color: #ef4444 !important;
    }
`;
document.head.appendChild(style);