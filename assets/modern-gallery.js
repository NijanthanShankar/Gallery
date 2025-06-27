// modern-gallery.js - Fixed version

jQuery(document).ready(function($) {
    'use strict';
    
    // Initialize gallery
    initModernGallery();
    
    function initModernGallery() {
        // Wait for GSAP to be available
        if (typeof gsap === 'undefined') {
            setTimeout(initModernGallery, 100);
            return;
        }
        
        // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger, TextPlugin);
        
        // Find all gallery instances
        $('.modern-gallery-wrapper').each(function() {
            const $wrapper = $(this);
            const galleryId = $wrapper.attr('id');
            
            // Create gallery instance
            new ModernGallery($wrapper, galleryId);
        });
    }
    
    class ModernGallery {
        constructor($wrapper, galleryId) {
            this.$wrapper = $wrapper;
            this.galleryId = galleryId;
            this.currentIndex = 0;
            this.galleryItems = [];
            this.totalItems = 0;
            this.isAnimating = false;
            this.autoPlayInterval = null;
            
            // Get gallery settings from data attributes
            this.category = $wrapper.data('category') || '';
            this.limit = $wrapper.data('limit') || 10;
            this.autoplay = $wrapper.data('autoplay') !== 'false';
            this.autoplayDelay = parseInt($wrapper.data('autoplay-delay')) || 5000;
            
            this.init();
        }
        
        init() {
            this.showLoading();
            this.fetchImages().then(() => {
                this.setupElements();
                this.setupInitialStates();
                this.createFloatingElements();
                this.bindEvents();
                this.hideLoading();
                this.animateIn();
                if (this.autoplay) {
                    this.startAutoPlay();
                }
            }).catch((error) => {
                console.error('Gallery initialization failed:', error);
                this.hideLoading();
            });
        }
        
        fetchImages() {
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: modernGallery.ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'get_gallery_images',
                        category: this.category,
                        limit: this.limit,
                        nonce: modernGallery.nonce
                    },
                    success: (response) => {
                        if (response.success && response.data.length > 0) {
                            this.renderGallery(response.data);
                            resolve();
                        } else {
                            reject('No images found');
                        }
                    },
                    error: (xhr, status, error) => {
                        reject(error);
                    }
                });
            });
        }
        
        renderGallery(images) {
            const $container = this.$wrapper.find('.gallery-container');
            $container.empty();
            
            images.forEach((image, index) => {
                const galleryItem = `
                    <div class="gallery-item" data-index="${index}">
                        <div class="gallery-image-wrapper">
                            <img class="gallery-image" src="${image.thumb}" data-full="${image.url}" alt="${image.alt || image.title}">
                        </div>
                        <div class="gallery-content">
                            <h3 class="gallery-title">${image.title}</h3>
                            <p class="gallery-subtitle">${image.caption || ''}</p>
                            <p class="gallery-description">${image.description || ''}</p>
                        </div>
                    </div>
                `;
                $container.append(galleryItem);
            });
            
            this.galleryItems = $container.find('.gallery-item').toArray();
            this.totalItems = this.galleryItems.length;
        }
        
        setupElements() {
            // Cache jQuery elements
            this.$loadingOverlay = this.$wrapper.find('.loading-overlay');
            this.$progressFill = this.$wrapper.find('.progress-fill');
            this.$prevBtn = this.$wrapper.find('.prev-btn');
            this.$nextBtn = this.$wrapper.find('.next-btn');
            this.$galleryContainer = this.$wrapper.find('.gallery-container');
            this.$lightbox = this.$wrapper.find('.lightbox');
        }
        
        setupInitialStates() {
            // Hide all items except first
            this.galleryItems.forEach((item, index) => {
                if (index === 0) {
                    gsap.set(item, { opacity: 1, scale: 1 });
                } else {
                    gsap.set(item, { opacity: 0, scale: 0.8, position: 'absolute', top: 0, left: 0, width: '100%' });
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
            
            // Make gallery container relative for absolute positioning
            this.$galleryContainer.css('position', 'relative');
        }
        
        showLoading() {
            this.$wrapper.find('.loading-overlay').show();
        }
        
        hideLoading() {
            setTimeout(() => {
                gsap.to(this.$wrapper.find('.loading-overlay'), {
                    opacity: 0,
                    duration: 1,
                    onComplete: () => {
                        this.$wrapper.find('.loading-overlay').hide();
                    }
                });
            }, 1000);
        }
        
        animateIn() {
            const tl = gsap.timeline();
            
            // Animate navigation
            tl.from(this.$wrapper.find('.gallery-nav'), {
                x: (index, target) => $(target).hasClass('prev') ? -100 : 100,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                stagger: 0.2
            });

            // Animate progress bar
            tl.from(this.$wrapper.find('.progress-bar'), {
                y: -50,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.5");

            // Animate first gallery item
            if (this.galleryItems.length > 0) {
                this.animateItemIn(this.galleryItems[0]);
                this.updateProgress();
            }
        }
        
        animateItemIn(item) {
            const $item = $(item);
            const image = $item.find('.gallery-image')[0];
            const title = $item.find('.gallery-title')[0];
            const subtitle = $item.find('.gallery-subtitle')[0];
            const description = $item.find('.gallery-description')[0];

            const tl = gsap.timeline();

            // Image animation
            tl.fromTo(image, 
                { scale: 1.3, rotation: 5 },
                { scale: 1.1, rotation: 0, duration: 2, ease: "power2.out" }
            );

            // Content animations
            if (title) {
                tl.fromTo(title,
                    { y: 100, opacity: 0, rotationX: 90 },
                    { y: 0, opacity: 1, rotationX: 0, duration: 1.2, ease: "power3.out" },
                    "-=1.5"
                );
            }

            if (subtitle) {
                tl.fromTo(subtitle,
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
                    "-=0.8"
                );
            }

            if (description) {
                tl.fromTo(description,
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
                    "-=0.6"
                );
            }

            // Particle burst effect
            this.createParticleBurst($item);
        }
        
        animateItemOut(item) {
            const tl = gsap.timeline();
            
            tl.to($(item).find('.gallery-content'), {
                y: -50,
                opacity: 0,
                duration: 0.5,
                ease: "power2.in"
            });
        }
        
        createParticleBurst(container) {
            const particleCount = 20;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = $('<div class="particle"></div>');
                container.append(particle);

                gsap.set(particle[0], {
                    x: container.width() / 2,
                    y: container.height() / 2,
                    opacity: 1,
                    position: 'absolute'
                });

                gsap.to(particle[0], {
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
                const element = $(`<div class="floating-element ${shapes[Math.floor(Math.random() * shapes.length)]}"></div>`);
                this.$wrapper.append(element);

                gsap.set(element[0], {
                    x: gsap.utils.random(0, this.$wrapper.width()),
                    y: gsap.utils.random(0, this.$wrapper.height()),
                    opacity: gsap.utils.random(0.1, 0.5),
                    position: 'absolute'
                });

                // Animate floating motion
                gsap.to(element[0], {
                    y: "+=50",
                    duration: gsap.utils.random(3, 6),
                    yoyo: true,
                    repeat: -1,
                    ease: "power1.inOut"
                });

                gsap.to(element[0], {
                    x: "+=30",
                    duration: gsap.utils.random(4, 8),
                    yoyo: true,
                    repeat: -1,
                    ease: "power1.inOut"
                });
            }
        }
        
        nextImage() {
            if (this.isAnimating || this.totalItems <= 1) return;
            
            this.isAnimating = true;
            const currentItem = this.galleryItems[this.currentIndex];
            this.currentIndex = (this.currentIndex + 1) % this.totalItems;
            const nextItem = this.galleryItems[this.currentIndex];

            this.transitionToImage(currentItem, nextItem, 'next');
            this.updateProgress();
        }
        
        prevImage() {
            if (this.isAnimating || this.totalItems <= 1) return;
            
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
                x: direction === 'next' ? -this.$wrapper.width() : this.$wrapper.width(),
                opacity: 0,
                duration: 0.8,
                ease: "power2.inOut"
            });

            // Enter animation for next item
            tl.fromTo(nextItem,
                {
                    x: direction === 'next' ? this.$wrapper.width() : -this.$wrapper.width(),
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
            gsap.to(this.$progressFill[0], {
                width: `${progress}%`,
                duration: 0.5,
                ease: "power2.out"
            });
        }
        
        openLightbox(imageSrc, title, caption) {
            const $lightboxImage = this.$lightbox.find('.lightbox-image');
            const $lightboxTitle = this.$lightbox.find('.lightbox-title');
            const $lightboxCaption = this.$lightbox.find('.lightbox-caption');
            
            $lightboxImage.attr('src', imageSrc);
            $lightboxTitle.text(title || '');
            $lightboxCaption.text(caption || '');
            
            this.$lightbox.addClass('active').show();
            
            gsap.fromTo(this.$lightbox[0], 
                { opacity: 0 },
                { opacity: 1, duration: 0.3 }
            );
            
            gsap.fromTo($lightboxImage[0],
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
            );
        }
        
        closeLightbox() {
            gsap.to(this.$lightbox[0], {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    this.$lightbox.removeClass('active').hide();
                }
            });
        }
        
        startAutoPlay() {
            this.autoPlayInterval = setInterval(() => {
                this.nextImage();
            }, this.autoplayDelay);
        }
        
        stopAutoPlay() {
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        }
        
        bindEvents() {
            // Navigation buttons
            this.$prevBtn.on('click', () => {
                this.stopAutoPlay();
                this.prevImage();
                if (this.autoplay) this.startAutoPlay();
            });

            this.$nextBtn.on('click', () => {
                this.stopAutoPlay();
                this.nextImage();
                if (this.autoplay) this.startAutoPlay();
            });

            // Keyboard navigation
            $(document).on('keydown', (e) => {
                if (!this.$wrapper.is(':visible')) return;
                
                if (e.key === 'ArrowLeft') {
                    this.stopAutoPlay();
                    this.prevImage();
                    if (this.autoplay) this.startAutoPlay();
                } else if (e.key === 'ArrowRight') {
                    this.stopAutoPlay();
                    this.nextImage();
                    if (this.autoplay) this.startAutoPlay();
                } else if (e.key === 'Escape') {
                    this.closeLightbox();
                }
            });

            // Image click for lightbox
            this.$galleryContainer.on('click', '.gallery-image', (e) => {
                const $img = $(e.target);
                const fullSrc = $img.data('full') || $img.attr('src');
                const title = $img.closest('.gallery-item').find('.gallery-title').text();
                const caption = $img.closest('.gallery-item').find('.gallery-subtitle').text();
                
                this.openLightbox(fullSrc, title, caption);
            });

            // Lightbox close
            this.$lightbox.find('.lightbox-close').on('click', () => {
                this.closeLightbox();
            });

            this.$lightbox.on('click', (e) => {
                if (e.target === this.$lightbox[0]) {
                    this.closeLightbox();
                }
            });

            // Touch/swipe support
            let startX = 0;
            let startY = 0;

            this.$wrapper.on('touchstart', (e) => {
                startX = e.originalEvent.touches[0].clientX;
                startY = e.originalEvent.touches[0].clientY;
            });

            this.$wrapper.on('touchend', (e) => {
                const endX = e.originalEvent.changedTouches[0].clientX;
                const endY = e.originalEvent.changedTouches[0].clientY;
                const diffX = startX - endX;
                const diffY = startY - endY;

                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    this.stopAutoPlay();
                    if (diffX > 0) {
                        this.nextImage();
                    } else {
                        this.prevImage();
                    }
                    if (this.autoplay) this.startAutoPlay();
                }
            });

            // Pause on hover
            this.$wrapper.on('mouseenter', () => {
                this.stopAutoPlay();
            });

            this.$wrapper.on('mouseleave', () => {
                if (this.autoplay) this.startAutoPlay();
            });
        }
    }
    
    // Mouse follower effect
    $(document).on('mousemove', (e) => {
        let $cursor = $('.cursor');
        if ($cursor.length === 0) {
            $cursor = $('<div class="cursor"></div>').css({
                position: 'fixed',
                width: '20px',
                height: '20px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 9999,
                mixBlendMode: 'difference'
            });
            $('body').append($cursor);
        }
        
        if (typeof gsap !== 'undefined') {
            gsap.to($cursor[0], {
                x: e.clientX - 10,
                y: e.clientY - 10,
                duration: 0.1
            });
        }
    });
});