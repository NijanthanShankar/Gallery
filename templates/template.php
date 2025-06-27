<?php
/**
 * Gallery Template
 * This template renders the modern gallery
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="modern-gallery-wrapper" id="<?php echo esc_attr($gallery_id); ?>" 
     data-category="<?php echo esc_attr($atts['category']); ?>"
     data-limit="<?php echo esc_attr($atts['limit']); ?>"
     data-autoplay="<?php echo esc_attr($atts['autoplay']); ?>"
     data-autoplay-delay="<?php echo esc_attr($atts['autoplay_delay']); ?>">
     
    <!-- Loading Overlay -->
    <div class="loading-overlay">
        <div class="loading-spinner"></div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar">
        <div class="progress-fill"></div>
    </div>

    <!-- Navigation -->
    <div class="gallery-nav prev">
        <button class="nav-button prev-btn" aria-label="Previous Image">‹</button>
    </div>
    <div class="gallery-nav next">
        <button class="nav-button next-btn" aria-label="Next Image">›</button>
    </div>

    <!-- Gallery Container -->
    <div class="gallery-container">
        <!-- Gallery items will be populated by JavaScript -->
    </div>

    <!-- Lightbox -->
    <div class="lightbox">
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Close Lightbox">&times;</button>
            <img class="lightbox-image" src="" alt="">
            <div class="lightbox-info">
                <h3 class="lightbox-title"></h3>
                <p class="lightbox-caption"></p>
            </div>
        </div>
    </div>
</div>