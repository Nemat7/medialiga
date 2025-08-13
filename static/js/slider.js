document.addEventListener('DOMContentLoaded', function() {
    const myCarousel = document.getElementById('matchesCarousel');
    const carousel = new bootstrap.Carousel(myCarousel, {
        interval: 5000, // Переключение каждые 5 секунд
        pause: 'hover',
        wrap: true
    });
});