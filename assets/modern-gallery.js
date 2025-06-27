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