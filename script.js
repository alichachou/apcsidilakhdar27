import { messageService, newsService, projectService } from './src/lib/supabase.js'

// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Hero Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const nextBtn = document.querySelector('.next-btn');
const prevBtn = document.querySelector('.prev-btn');

// Only initialize slider if elements exist
if (slides.length > 0 && nextBtn && prevBtn) {
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    // Auto slide
    setInterval(nextSlide, 5000);

    // Navigation buttons
    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);
    }

    // Dots navigation
    if (dots.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });
    }

    // Initialize first slide
    showSlide(0);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Skip if href is just '#'
        const href = this.getAttribute('href');
        if (href === '#') {
            return;
        }
        
        const target = document.querySelector(href);
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Active navigation link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerHeight = document.querySelector('.header').offsetHeight;
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Contact form submission with Supabase
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        try {
            // Save message to Supabase
            await messageService.createMessage({
                name: formObject.name || 'غير محدد',
                email: formObject.email || 'غير محدد',
                phone: formObject.phone || 'غير محدد',
                inquiry: formObject.inquiry || 'other',
                message: formObject.message || 'رسالة فارغة'
            });
        
            // Show success message
            alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
            this.reset();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
        }
    });
}

// Load news from Supabase
async function loadNews() {
    try {
        const news = await newsService.getPublishedNews();
        const newsGrid = document.querySelector('.news-grid');
        
        if (!newsGrid) {
            return; // Exit if news grid doesn't exist on this page
        }
        
        if (news && news.length > 0) {
            newsGrid.innerHTML = '';
            news.slice(0, 3).forEach(article => {
                const newsCard = createNewsCard(article);
                newsGrid.appendChild(newsCard);
            });
        }
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

// Create news card element
function createNewsCard(article) {
    const newsCard = document.createElement('article');
    newsCard.className = 'news-card';
    
    const date = new Date(article.created_at);
    const day = date.getDate();
    const month = date.toLocaleDateString('ar-SA', { month: 'long' });
    
    newsCard.innerHTML = `
        <div class="news-image">
            <img src="${article.image_url || 'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop'}" alt="${article.title}">
            <div class="news-date">
                <span class="day">${day}</span>
                <span class="month">${month}</span>
            </div>
        </div>
        <div class="news-content">
            <h3>${article.title}</h3>
            <p>${article.content.substring(0, 150)}...</p>
            <a href="#" class="read-more">اقرأ المزيد</a>
        </div>
    `;
    
    return newsCard;
}

// Load projects from Supabase
async function loadProjects() {
    try {
        const projects = await projectService.getPublishedProjects();
        const projectsGrid = document.querySelector('.projects-grid');
        
        if (!projectsGrid) {
            return; // Exit if projects grid doesn't exist on this page
        }
        
        if (projects && projects.length > 0) {
            projectsGrid.innerHTML = '';
            projects.slice(0, 3).forEach(project => {
                const projectCard = createProjectCard(project);
                projectsGrid.appendChild(projectCard);
            });
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Create project card element
function createProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    
    const statusLabels = {
        'completed': 'مكتمل',
        'ongoing': 'قيد التنفيذ',
        'planned': 'مخطط'
    };
    
    const statusClasses = {
        'completed': 'completed',
        'ongoing': 'ongoing',
        'planned': 'planned'
    };
    
    projectCard.innerHTML = `
        <div class="project-image">
            <img src="${project.image_url || 'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'}" alt="${project.title}">
            <div class="project-status ${statusClasses[project.status]}">${statusLabels[project.status]}</div>
        </div>
        <div class="project-content">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-meta">
                <span><i class="fas fa-calendar"></i> ${project.year}</span>
                <span><i class="fas fa-cogs"></i> ${statusLabels[project.status]}</span>
            </div>
        </div>
    `;
    
    return projectCard;
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .service-item, .news-card, .project-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#fff';
        header.style.backdropFilter = 'none';
    }
});

// Service cards hover effect
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.5s ease';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Add loading class to body
    document.body.style.opacity = '0';
    
    // Load dynamic content
    loadNews();
    loadProjects();
});