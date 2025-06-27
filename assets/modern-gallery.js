// modern-gallery.js

jQuery(document).ready(function($) {
    'use strict';
    
    // Initialize gallery
    initModernGallery();
    
    function initModernGallery() {
        // Add progress bar
        addProgressBar();
        
        // Initialize scroll animations
        initScrollAnimations();
        
        // Initialize lightbox
        initLightbox();
        
        // Update progress on scroll
        updateProgress();
        
        // Handle window resize
        $(window).on('resize', debounce(handleResize, 250));
    }
    
    function addProgressBar() {
        if ($('.gallery-progress').length === 0) {
            $('body').append('<div class="gallery-progress"></div>');
        }
    }
    
    function initScrollAnimations() {
        const galleryItems = $('.gallery-item');
        const animationType = $('.modern-gallery-container').data('animation') || 'slideIn';
        const delay = parseInt($('.modern-gallery-container').data('delay')) || 200;
        
        // Enhanced Intersection Observer with more detailed options
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                threshold: [0, 0.1, 0.3, 0.5, 0.7, 1],
                rootMargin: '0px 0px -10% 0px'
            };
            
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    const $item = $(entry.target);
                    const intersectionRatio = entry.intersectionRatio;
                    
                    if (entry.isIntersecting) {
                        // Trigger main animation
                        if (!$item.hasClass('animate')) {
                            setTimeout(function() {
                                $item.addClass('animate');
                                // Add particle effect
                                triggerParticleEffect($item);
                            }, 100);
                        }
                        
                        // Add in-view class for continuous effects
                        $item.addClass('in-view');
                        
                        // Progressive zoom based on scroll position
                        if (intersectionRatio > 0.5) {
                            $item.addClass('zoom-in').removeClass('zoom-out');
                        } else if (intersectionRatio > 0.2) {
                            $item.removeClass('zoom-in zoom-out');
                        }
                    } else {
                        $item.removeClass('in-view zoom-in').addClass('zoom-out');
                    }
                });
            }, observerOptions);
            
            galleryItems.each(function(index) {
                observer.observe(this);
                // Stagger initial transforms
                $(this).css('transition-delay', (index * delay) + 'ms');
            });
        }
        
        // Enhanced scroll parallax
        initAdvancedParallax();
    }
    
    function initLightbox() {
        // Create lightbox HTML if it doesn't exist
        if ($('.gallery-lightbox').length === 0) {
            $('body').append(`
                <div class="gallery-lightbox">
                    <div class="lightbox-content">
                        <button class="lightbox-close">&times;</button>
                        <img src="" alt="">
                    </div>
                </div>
            `);
        }
        
        const $lightbox = $('.gallery-lightbox');
        const $lightboxImg = $('.lightbox-content img');
        const $closeBtn = $('.lightbox-close');
        
        // Open lightbox on image click
        $(document).on('click', '.gallery-image-wrapper img', function(e) {
            e.preventDefault();
            const imgSrc = $(this).attr('src');
            const imgAlt = $(this).attr('alt');
            
            $lightboxImg.attr('src', imgSrc).attr('alt', imgAlt);
            $lightbox.addClass('active');
            $('body').css('overflow', 'hidden');
        });
        
        // Close lightbox
        function closeLightbox() {
            $lightbox.removeClass('active');
            $('body').css('overflow', 'auto');
        }
        
        $closeBtn.on('click', closeLightbox);
        
        // Close on background click
        $lightbox.on('click', function(e) {
            if (e.target === this) {
                closeLightbox();
            }
        });
        
        // Close on escape key
        $(document).on('keydown', function(e) {
            if (e.keyCode === 27 && $lightbox.hasClass('active')) {
                closeLightbox();
            }
        });
    }
    
    function updateProgress() {
        const $progressBar = $('.gallery-progress');
        
        $(window).on('scroll', function() {
            const windowHeight = $(window).height();
            const documentHeight = $(document).height();
            const scrollTop = $(window).scrollTop();
            const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
            
            $progressBar.css('width', Math.min(progress, 100) + '%');
        });
    }
    
    function handleResize() {
        // Recalculate animations on resize
        $('.gallery-item.animate').removeClass('animate');
        setTimeout(function() {
            $(window).trigger('scroll');
        }, 100);
    }
    
    // Utility functions
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        return (
            rect.top >= 0 &&
            rect.top <= windowHeight * 0.8
        ) || (
            rect.bottom >= windowHeight * 0.2 &&
            rect.bottom <= windowHeight
        );
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = function() {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Add smooth scrolling for anchor links
    $('a[href*="#"]').on('click', function(e) {
        const target = $(this.hash);
        if (target.length) {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: target.offset().top - 100
            }, 600, 'easeInOutQuad');
        }
    });
    
    // Lazy loading enhancement
    function initLazyLoading() {
        const lazyImages = $('.gallery-image-wrapper img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const $img = $(img);
                        
                        $img.attr('src', $img.data('src'));
                        $img.removeClass('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.each(function() {
                imageObserver.observe(this);
            });
        }
    }
    
    // Initialize lazy loading if images have data-src
    initLazyLoading();
    
    // Advanced parallax and scroll effects
    function initAdvancedParallax() {
        let ticking = false;
        
        function updateParallax() {
            const scrollTop = $(window).scrollTop();
            const windowHeight = $(window).height();
            
            $('.gallery-item').each(function(index) {
                const $item = $(this);
                const $img = $item.find('img');
                const itemTop = $item.offset().top;
                const itemHeight = $item.outerHeight();
                
                // Calculate if item is in viewport
                const itemBottom = itemTop + itemHeight;
                const viewportTop = scrollTop;
                const viewportBottom = scrollTop + windowHeight;
                
                if (itemBottom > viewportTop && itemTop < viewportBottom) {
                    // Item is in viewport
                    const scrollProgress = (scrollTop - itemTop + windowHeight) / (windowHeight + itemHeight);
                    const parallaxOffset = (scrollProgress - 0.5) * 100;
                    
                    // Apply parallax to image
                    $img.css('transform', `scale(1.1) translateY(${parallaxOffset}px)`);
                    
                    // Apply rotation effect
                    const rotationProgress = Math.min(Math.max((scrollProgress - 0.2) * 2, 0), 1);
                    const rotation = (rotationProgress - 0.5) * 2; // -1 to 1
                    
                    $item.find('.gallery-content').css('transform', 
                        `translateY(0) scale(1) rotateZ(${rotation}deg)`);
                }
            });
            
            ticking = false;
        }
        
        $(window).on('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }
    
    // Particle effect trigger
    function triggerParticleEffect($item) {
        // Create floating particles
        for (let i = 0; i < 5; i++) {
            const $particle = $('<div class="floating-particle"></div>');
            $particle.css({
                position: 'absolute',
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '50%',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                pointerEvents: 'none',
                zIndex: 4,
                animation: `floatUp ${Math.random() * 3 + 2}s ease-out forwards`
            });
            
            $item.append($particle);
            
            // Remove particle after animation
            setTimeout(() => $particle.remove(), 5000);
        }
    }
    
    // Add CSS for floating particles
    $('<style>').prop('type', 'text/css').html(`
        @keyframes floatUp {
            0% {
                opacity: 0;
                transform: translateY(50px) scale(0);
            }
            10% {
                opacity: 1;
                transform: translateY(40px) scale(1);
            }
            90% {
                opacity: 1;
                transform: translateY(-100px) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-120px) scale(0);
            }
        }
    `).appendTo('head');
    
    // Enhanced mouse tracking effects
    function initMouseEffects() {
        let mouseX = 0, mouseY = 0;
        let isMouseMoving = false;
        
        $(document).on('mousemove', function(e) {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;
            isMouseMoving = true;
            
            clearTimeout(window.mouseTimer);
            window.mouseTimer = setTimeout(() => {
                isMouseMoving = false;
            }, 100);
        });
        
        function updateMouseEffects() {
            if (isMouseMoving) {
                $('.gallery-item.in-view').each(function() {
                    const $wrapper = $(this).find('.gallery-image-wrapper');
                    const tiltX = mouseY * 3;
                    const tiltY = mouseX * -3;
                    
                    $wrapper.css('transform', 
                        `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.01)`);
                });
            }
            
            requestAnimationFrame(updateMouseEffects);
        }
        
        updateMouseEffects();
    }
    
    // Initialize mouse effects
    initMouseEffects();
    
    // Enhanced loading states with progressive reveal
    $('.gallery-item').each(function(index) {
        const $item = $(this);
        const $img = $item.find('img');
        
        $item.addClass('loading');
        
        // Create loading overlay
        const $loadingOverlay = $(`
            <div class="image-loading-overlay">
                <div class="loading-spinner"></div>
                <div class="loading-progress">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `);
        
        $item.append($loadingOverlay);
        
        if ($img[0].complete) {
            $item.removeClass('loading');
            $loadingOverlay.remove();
        } else {
            // Simulate progressive loading
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 90) progress = 90;
                $loadingOverlay.find('.progress-bar').css('width', progress + '%');
            }, 100);
            
            $img.on('load', function() {
                clearInterval(progressInterval);
                $loadingOverlay.find('.progress-bar').css('width', '100%');
                
                setTimeout(() => {
                    $item.removeClass('loading');
                    $loadingOverlay.fadeOut(300, function() {
                        $(this).remove();
                    });
                }, 300);
            });
        }
    });
    
    // Add loading styles
    $('<style>').prop('type', 'text/css').html(`
        .image-loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        
        .loading-progress {
            width: 200px;
            height: 4px;
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            width: 0%;
            transition: width 0.3s ease;
        }
    `).appendTo('head');
    
    // Performance optimization: Pause animations when tab is not visible
    let isTabVisible = true;
    
    document.addEventListener('visibilitychange', function() {
        isTabVisible = !document.hidden;
        
        if (isTabVisible) {
            // Resume animations
            $('.gallery-item').css('animation-play-state', 'running');
        } else {
            // Pause animations
            $('.gallery-item').css('animation-play-state', 'paused');
        }
    });
    
    // Add keyboard navigation for lightbox
    $(document).on('keydown', function(e) {
        if (!$('.gallery-lightbox').hasClass('active')) return;
        
        const currentImg = $('.lightbox-content img');
        const allImages = $('.gallery-image-wrapper img');
        const currentIndex = allImages.index($('.gallery-image-wrapper img[src="' + currentImg.attr('src') + '"]'));
        
        if (e.keyCode === 37) { // Left arrow
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : allImages.length - 1;
            const prevImg = allImages.eq(prevIndex);
            currentImg.attr('src', prevImg.attr('src')).attr('alt', prevImg.attr('alt'));
        } else if (e.keyCode === 39) { // Right arrow
            const nextIndex = currentIndex < allImages.length - 1 ? currentIndex + 1 : 0;
            const nextImg = allImages.eq(nextIndex);
            currentImg.attr('src', nextImg.attr('src')).attr('alt', nextImg.attr('alt'));
        }
    });
    
    console.log('Modern Gallery initialized successfully!');
});

 // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger, TextPlugin);

        class ModernGallery {
            constructor() {
                this.currentIndex = 0;
                this.galleryItems = document.querySelectorAll('.gallery-item');
                this.totalItems = this.galleryItems.length;
                this.isAnimating = false;
                this.autoPlayInterval = null;
                
                this.init();
            }

            init() {
                this.setupInitialStates();
                this.createFloatingElements();
                this.bindEvents();
                this.startAutoPlay();
                this.hideLoading();
                this.animateIn();
            }

            setupInitialStates() {
                // Hide all items except first
                this.galleryItems.forEach((item, index) => {
                    if (index === 0) {
                        gsap.set(item, { opacity: 1, scale: 1 });
                    } else {
                        gsap.set(item, { opacity: 0, scale: 0.8 });
                    }
                });

                // Set up ScrollTrigger for each item
                this.galleryItems.forEach((item, index) => {
                    ScrollTrigger.create({
                        trigger: item,
                        start: "top 80%",
                        end: "bottom 20%",
                        onEnter: () => this.animateItemIn(item),
                        onLeave: () => this.animateItemOut(item),
                        onEnterBack: () => this.animateItemIn(item),
                        onLeaveBack: () => this.animateItemOut(item)
                    });
                });
            }

            hideLoading() {
                setTimeout(() => {
                    gsap.to('#loadingOverlay', {
                        opacity: 0,
                        duration: 1,
                        onComplete: () => {
                            document.getElementById('loadingOverlay').style.display = 'none';
                        }
                    });
                }, 2000);
            }

            animateIn() {
                const tl = gsap.timeline();
                
                // Animate navigation
                tl.from('.gallery-nav', {
                    x: (index, target) => target.classList.contains('prev') ? -100 : 100,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out",
                    stagger: 0.2
                });

                // Animate progress bar
                tl.from('.progress-bar', {
                    y: -50,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out"
                }, "-=0.5");

                // Animate first gallery item
                this.animateItemIn(this.galleryItems[0]);
            }

            animateItemIn(item) {
                const image = item.querySelector('.gallery-image');
                const title = item.querySelector('.gallery-title');
                const subtitle = item.querySelector('.gallery-subtitle');
                const description = item.querySelector('.gallery-description');

                const tl = gsap.timeline();

                // Image animation
                tl.fromTo(image, 
                    { scale: 1.3, rotation: 5 },
                    { scale: 1.1, rotation: 0, duration: 2, ease: "power2.out" }
                );

                // Content animations
                tl.fromTo(title,
                    { y: 100, opacity: 0, rotationX: 90 },
                    { y: 0, opacity: 1, rotationX: 0, duration: 1.2, ease: "power3.out" },
                    "-=1.5"
                );

                tl.fromTo(subtitle,
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
                    "-=0.8"
                );

                tl.fromTo(description,
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
                    "-=0.6"
                );

                // Add typing effect to title
                gsap.to(title, {
                    duration: 2,
                    text: title.textContent,
                    ease: "none",
                    delay: 0.5
                });

                // Particle burst effect
                this.createParticleBurst(item);
            }

            animateItemOut(item) {
                const tl = gsap.timeline();
                
                tl.to(item.querySelector('.gallery-content'), {
                    y: -50,
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.in"
                });
            }

            createParticleBurst(container) {
                const particleCount = 20;
                
                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    container.appendChild(particle);

                    gsap.set(particle, {
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                        opacity: 1
                    });

                    gsap.to(particle, {
                        x: gsap.utils.random(-200, 200),
                        y: gsap.utils.random(-200, 200),
                        opacity: 0,
                        duration: gsap.utils.random(1, 3),
                        ease: "power2.out",
                        onComplete: () => particle.remove()
                    });
                }
            }

            createFloatingElements() {
                const shapes = ['floating-circle', 'floating-square', 'floating-triangle'];
                
                for (let i = 0; i < 15; i++) {
                    const element = document.createElement('div');
                    element.className = `floating-element ${shapes[Math.floor(Math.random() * shapes.length)]}`;
                    document.body.appendChild(element);

                    gsap.set(element, {
                        x: gsap.utils.random(0, window.innerWidth),
                        y: gsap.utils.random(0, window.innerHeight),
                        opacity: gsap.utils.random(0.1, 0.5)
                    });

                    // Animate floating motion
                    gsap.to(element, {
                        y: "+=50",
                        duration: gsap.utils.random(3, 6),
                        yoyo: true,
                        repeat: -1,
                        ease: "power1.inOut"
                    });

                    gsap.to(element, {
                        x: "+=30",
                        duration: gsap.utils.random(4, 8),
                        yoyo: true,
                        repeat: -1,
                        ease: "power1.inOut"
                    });
                }
            }

            nextImage() {
                if (this.isAnimating) return;
                
                this.isAnimating = true;
                const currentItem = this.galleryItems[this.currentIndex];
                this.currentIndex = (this.currentIndex + 1) % this.totalItems;
                const nextItem = this.galleryItems[this.currentIndex];

                this.transitionToImage(currentItem, nextItem, 'next');
                this.updateProgress();
            }

            prevImage() {
                if (this.isAnimating) return;
                
                this.isAnimating = true;
                const currentItem = this.galleryItems[this.currentIndex];
                this.currentIndex = (this.currentIndex - 1 + this.totalItems) % this.totalItems;
                const prevItem = this.galleryItems[this.currentIndex];

                this.transitionToImage(currentItem, prevItem, 'prev');
                this.updateProgress();
            }

            transitionToImage(currentItem, nextItem, direction) {
                const tl = gsap.timeline({
                    onComplete: () => {
                        this.isAnimating = false;
                    }
                });

                // Exit animation for current item
                tl.to(currentItem, {
                    x: direction === 'next' ? -window.innerWidth : window.innerWidth,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.inOut"
                });

                // Enter animation for next item
                tl.fromTo(nextItem,
                    {
                        x: direction === 'next' ? window.innerWidth : -window.innerWidth,
                        opacity: 0
                    },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: "power2.inOut"
                    },
                    "-=0.4"
                );

                // Reset current item position
                tl.set(currentItem, { x: 0 });

                // Animate new content
                tl.add(() => this.animateItemIn(nextItem), "-=0.5");
            }

            updateProgress() {
                const progress = ((this.currentIndex + 1) / this.totalItems) * 100;
                gsap.to('#progressFill', {
                    width: `${progress}%`,
                    duration: 0.5,
                    ease: "power2.out"
                });
            }

            openLightbox(imageSrc) {
                const lightbox = document.getElementById('lightbox');
                const lightboxImage = document.getElementById('lightboxImage');
                
                lightboxImage.src = imageSrc;
                lightbox.classList.add('active');
                
                gsap.fromTo(lightbox, 
                    { opacity: 0 },
                    { opacity: 1, duration: 0.3 }
                );
                
                gsap.fromTo(lightboxImage,
                    { scale: 0.8, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
                );
            }

            closeLightbox() {
                const lightbox = document.getElementById('lightbox');
                
                gsap.to(lightbox, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        lightbox.classList.remove('active');
                    }
                });
            }

            startAutoPlay() {
                this.autoPlayInterval = setInterval(() => {
                    this.nextImage();
                }, 5000);
            }

            stopAutoPlay() {
                clearInterval(this.autoPlayInterval);
            }

            bindEvents() {
                // Navigation buttons
                document.getElementById('prevBtn').addEventListener('click', () => {
                    this.stopAutoPlay();
                    this.prevImage();
                    this.startAutoPlay();
                });

                document.getElementById('nextBtn').addEventListener('click', () => {
                    this.stopAutoPlay();
                    this.nextImage();
                    this.startAutoPlay();
                });

                // Keyboard navigation
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowLeft') {
                        this.stopAutoPlay();
                        this.prevImage();
                        this.startAutoPlay();
                    } else if (e.key === 'ArrowRight') {
                        this.stopAutoPlay();
                        this.nextImage();
                        this.startAutoPlay();
                    } else if (e.key === 'Escape') {
                        this.closeLightbox();
                    }
                });

                // Image click for lightbox
                this.galleryItems.forEach(item => {
                    const image = item.querySelector('.gallery-image');
                    image.addEventListener('click', () => {
                        this.openLightbox(image.src);
                    });
                });

                // Lightbox close
                document.getElementById('lightboxClose').addEventListener('click', () => {
                    this.closeLightbox();
                });

                document.getElementById('lightbox').addEventListener('click', (e) => {
                    if (e.target.id === 'lightbox') {
                        this.closeLightbox();
                    }
                });

                // Touch/swipe support
                let startX = 0;
                let startY = 0;

                document.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                });

                document.addEventListener('touchend', (e) => {
                    const endX = e.changedTouches[0].clientX;
                    const endY = e.changedTouches[0].clientY;
                    const diffX = startX - endX;
                    const diffY = startY - endY;

                    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                        this.stopAutoPlay();
                        if (diffX > 0) {
                            this.nextImage();
                        } else {
                            this.prevImage();
                        }
                        this.startAutoPlay();
                    }
                });

                // Pause on hover
                document.getElementById('galleryContainer').addEventListener('mouseenter', () => {
                    this.stopAutoPlay();
                });

                document.getElementById('galleryContainer').addEventListener('mouseleave', () => {
                    this.startAutoPlay();
                });
            }
        }

        // Initialize gallery when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new ModernGallery();
        });

        // Mouse follower effect
        document.addEventListener('mousemove', (e) => {
            const cursor = document.querySelector('.cursor');
            if (!cursor) {
                const newCursor = document.createElement('div');
                newCursor.className = 'cursor';
                newCursor.style.cssText = `
                    position: fixed;
                    width: 20px;
                    height: 20px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    mix-blend-mode: difference;
                    transition: transform 0.1s ease;
                `;
                document.body.appendChild(newCursor);
            }
            
            gsap.to('.cursor', {
                x: e.clientX - 10,
                y: e.clientY - 10,
                duration: 0.1
            });
        });