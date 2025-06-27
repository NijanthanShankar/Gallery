<?php
/**
 * Plugin Name: Modern Animated Gallery
 * Description: A modern gallery with scroll animations and easy image management
 * Version: 1.0.0
 * Author: Nijanthan Shankar
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class ModernGallery {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_ajax_save_gallery_images', array($this, 'save_gallery_images'));
        add_action('wp_ajax_nopriv_save_gallery_images', array($this, 'save_gallery_images'));
        add_shortcode('modern_gallery', array($this, 'gallery_shortcode'));
        register_activation_hook(__FILE__, array($this, 'activate'));
    }
    
    public function init() {
        // Initialize plugin
    }
    
    public function activate() {
        // Create default options
        if (!get_option('modern_gallery_images')) {
            update_option('modern_gallery_images', array());
        }
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('modern-gallery-js', plugin_dir_url(__FILE__) . 'modern-gallery.js', array('jquery'), '1.0.0', true);
        wp_enqueue_style('modern-gallery-css', plugin_dir_url(__FILE__) . 'modern-gallery.css', array(), '1.0.0');
        
        // Localize script for AJAX
        wp_localize_script('modern-gallery-js', 'modern_gallery_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('modern_gallery_nonce')
        ));
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Modern Gallery',
            'Modern Gallery',
            'manage_options',
            'modern-gallery',
            array($this, 'admin_page'),
            'dashicons-format-gallery',
            30
        );
    }
    
    public function admin_page() {
        $gallery_images = get_option('modern_gallery_images', array());
        ?>
        <div class="wrap">
            <h1>Modern Gallery Settings</h1>
            <div class="modern-gallery-admin">
                <div class="gallery-controls">
                    <button type="button" class="button button-primary" id="add-gallery-image">
                        Add Images
                    </button>
                    <button type="button" class="button" id="save-gallery">
                        Save Gallery
                    </button>
                </div>
                
                <div class="gallery-preview">
                    <h3>Current Gallery Images</h3>
                    <div id="gallery-images-list" class="gallery-images-grid">
                        <?php foreach ($gallery_images as $image_id): ?>
                            <?php $image_url = wp_get_attachment_image_url($image_id, 'full'); ?>
                            <?php if ($image_url): ?>
                                <div class="gallery-image-item" data-image-id="<?php echo $image_id; ?>">
                                    <img src="<?php echo esc_url($image_url); ?>" alt="">
                                    <button class="remove-image" type="button">&times;</button>
                                </div>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    </div>
                </div>
                
                <div class="shortcode-info">
                    <h3>Usage</h3>
                    <p>Use the shortcode <code>[modern_gallery]</code> to display the gallery on any page or post.</p>
                </div>
                
                <div class="animation-settings">
                    <h3>Animation Settings</h3>
                    <p>You can customize the animation type using shortcode attributes:</p>
                    <ul>
                        <li><code>[modern_gallery animation="slideInLeft"]</code> - Slide in from left</li>
                        <li><code>[modern_gallery animation="zoomIn"]</code> - Zoom in effect</li>
                        <li><code>[modern_gallery animation="rotateIn"]</code> - Rotate in effect</li>
                        <li><code>[modern_gallery animation="flipIn"]</code> - Flip in effect</li>
                        <li><code>[modern_gallery delay="300"]</code> - Custom delay between animations (ms)</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <style>
        .modern-gallery-admin {
            max-width: 1200px;
        }
        .gallery-controls {
            margin: 20px 0;
        }
        .gallery-controls .button {
            margin-right: 10px;
        }
        .gallery-images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .gallery-image-item {
            position: relative;
            border: 2px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            background: #f9f9f9;
        }
        .gallery-image-item img {
            width: 100%;
            height: 150px;
            object-fit: cover;
            display: block;
        }
        .remove-image {
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(255, 0, 0, 0.8);
            color: white;
            border: none;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
        }
        .remove-image:hover {
            background: rgba(255, 0, 0, 1);
        }
        .shortcode-info, .animation-settings {
            background: #f1f1f1;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .shortcode-info code, .animation-settings code {
            background: #fff;
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
        }
        .animation-settings ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .animation-settings li {
            margin: 5px 0;
        }
        </style>
        
        <script>
        jQuery(document).ready(function($) {
            var galleryImages = [];
            
            // Initialize existing images
            $('#gallery-images-list .gallery-image-item').each(function() {
                galleryImages.push($(this).data('image-id'));
            });
            
            // Add images button
            $('#add-gallery-image').click(function(e) {
                e.preventDefault();
                
                var mediaUploader = wp.media({
                    title: 'Select Images for Gallery',
                    button: {
                        text: 'Add to Gallery'
                    },
                    multiple: true
                });
                
                mediaUploader.on('select', function() {
                    var attachments = mediaUploader.state().get('selection').toJSON();
                    
                    attachments.forEach(function(attachment) {
                        if (galleryImages.indexOf(attachment.id) === -1) {
                            galleryImages.push(attachment.id);
                            addImageToPreview(attachment);
                        }
                    });
                });
                
                mediaUploader.open();
            });
            
            // Remove image
            $(document).on('click', '.remove-image', function() {
                var imageId = $(this).parent().data('image-id');
                var index = galleryImages.indexOf(imageId);
                if (index > -1) {
                    galleryImages.splice(index, 1);
                }
                $(this).parent().remove();
            });
            
            // Save gallery
            $('#save-gallery').click(function() {
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'save_gallery_images',
                        images: galleryImages,
                        nonce: '<?php echo wp_create_nonce('modern_gallery_nonce'); ?>'
                    },
                    success: function(response) {
                        if (response.success) {
                            alert('Gallery saved successfully!');
                        } else {
                            alert('Error saving gallery: ' + response.data);
                        }
                    }
                });
            });
            
            function addImageToPreview(attachment) {
                var imageUrl = attachment.sizes && attachment.sizes.medium ? 
                    attachment.sizes.medium.url : attachment.url;
                
                var imageHtml = '<div class="gallery-image-item" data-image-id="' + attachment.id + '">' +
                    '<img src="' + imageUrl + '" alt="">' +
                    '<button class="remove-image" type="button">&times;</button>' +
                    '</div>';
                $('#gallery-images-list').append(imageHtml);
            }
        });
        </script>
        <?php
    }
    
    public function save_gallery_images() {
        if (!wp_verify_nonce($_POST['nonce'], 'modern_gallery_nonce')) {
            wp_die('Security check failed');
        }
        
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        $images = isset($_POST['images']) ? array_map('intval', $_POST['images']) : array();
        update_option('modern_gallery_images', $images);
        
        wp_send_json_success('Gallery updated successfully');
    }
    
    public function gallery_shortcode($atts) {
        $atts = shortcode_atts(array(
            'animation' => 'fadeInUp',
            'delay' => '100'
        ), $atts);
        
        $gallery_images = get_option('modern_gallery_images', array());
        
        if (empty($gallery_images)) {
            return '<p>No images found in gallery. Please add images from the admin panel.</p>';
        }
        
        ob_start();
        ?>
        <div class="modern-gallery-container">
            <?php foreach ($gallery_images as $index => $image_id): ?>
                <?php 
                $image_url = wp_get_attachment_image_url($image_id, 'full');
                $image_alt = get_post_meta($image_id, '_wp_attachment_image_alt', true);
                $image_caption = wp_get_attachment_caption($image_id);
                ?>
                <?php if ($image_url): ?>
                    <div class="gallery-item" data-index="<?php echo $index; ?>">
                        <div class="gallery-image-wrapper">
                            <img src="<?php echo esc_url($image_url); ?>" alt="<?php echo esc_attr($image_alt); ?>" loading="lazy" style="width:100%;" data-animation="<?php echo esc_attr($atts['animation']); ?>" data-delay="<?php echo esc_attr($atts['delay']); ?>">
                            <div class="gallery-overlay">
                                <div class="gallery-content">
                                    <h3><?php echo esc_html($image_caption ? $image_caption : $image_alt); ?></h3>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
$modern_gallery = new ModernGallery();

// Enqueue admin scripts
add_action('admin_enqueue_scripts', function($hook) {
    if ($hook === 'toplevel_page_modern-gallery') {
        wp_enqueue_media();
        wp_enqueue_script('wp-color-picker');
        wp_enqueue_style('wp-color-picker');
    }
});
?>