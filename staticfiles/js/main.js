// Основные скрипты для Медиалиги

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация слайдера
    initCarousels();

    // Плавная прокрутка
    initSmoothScroll();

    // Анимации при скролле
    initScrollAnimations();
});

// Инициализация каруселей
function initCarousels() {
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        // Автоматическая смена слайдов каждые 5 секунд
        const interval = 5000;
        let carouselInstance = new bootstrap.Carousel(carousel, {
            interval: interval,
            wrap: true
        });
    });
}

// Плавная прокрутка к якорям
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Учитываем высоту навбара
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Анимации при скролле
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Наблюдаем за элементами с анимацией
    document.querySelectorAll('.match-card, .scorer-card, .group-standings, .video-container')
        .forEach(el => observer.observe(el));
}

// Утилиты
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Обработка модального окна спонсора (если нужно оставить)
function initSponsorModal() {
    const sponsorModal = document.getElementById('sponsorModal');
    if (sponsorModal) {
        setTimeout(() => {
            const modal = new bootstrap.Modal(sponsorModal);
            modal.show();

            setTimeout(() => {
                modal.hide();
            }, 5000);
        }, 1000);
    }
}