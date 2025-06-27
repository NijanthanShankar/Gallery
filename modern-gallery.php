<?php
/**
 * Plugin Name: Modern GSAP Gallery
 * Plugin URI: https://your-website.com
 * Description: A modern animated gallery with GSAP animations that fetches images from WordPress media library.
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('MODERN_GALLERY_VERSION', '1.0.0');
define('MODERN_GALLERY_PLUGIN_URL', plugin_dir_url(__FILE__));
define('MODERN_GALLERY_PLUGIN_PATH', plugin_dir_path(__FILE__));

class ModernGSAPGallery {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('modern_gallery', array($this, 'display_gallery'));
        add_action('wp_ajax_get_gallery_images', array($this, 'get_gallery_images'));
        add_action('wp_ajax_nopriv_get_gallery_images', array($this, 'get_gallery_images'));
        
        // Admin hooks
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
    }
    
    public function init() {
        // Plugin initialization
    }
    
    public function enqueue_scripts() {
        // Enqueue GSAP from CDN
        wp_enqueue_script('gsap', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', array(), '3.12.2', true);
        wp_enqueue_script('gsap-scrolltrigger', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js', array('gsap'), '3.12.2', true);
        wp_enqueue_script('gsap-textplugin', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/TextPlugin.min.js', array('gsap'), '3.12.2', true);
        
        // Enqueue plugin CSS and JS
        wp_enqueue_style('modern-gallery-css', MODERN_GALLERY_PLUGIN_URL . 'assets/css/gallery.css', array(), MODERN_GALLERY_VERSION);
        wp_enqueue_script('modern-gallery-js', MODERN_GALLERY_PLUGIN_URL . 'assets/js/gallery.js', array('jquery', 'gsap'), MODERN_GALLERY_VERSION, true);
        
        // Localize script for AJAX
        wp_localize_script('modern-gallery-js', 'modernGallery', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('modern_gallery_nonce')
        ));
    }
    
    public function display_gallery($atts) {
        $atts = shortcode_atts(array(
            'category' => '',
            'limit' => 10,
            'autoplay' => 'true',
            'autoplay_delay' => 5000
        ), $atts);
        
        $gallery_id = 'gallery-' . wp_rand(1000, 9999);
        
        ob_start();
        include MODERN_GALLERY_PLUGIN_PATH . 'templates/template.php';
        return ob_get_clean();
    }
    
    public function get_gallery_images() {
        check_ajax_referer('modern_gallery_nonce', 'nonce');
        
        $category = sanitize_text_field($_POST['category'] ?? '');
        $limit = intval($_POST['limit'] ?? 10);
        
        $args = array(
            'post_type' => 'attachment',
            'post_mime_type' => 'image',
            'post_status' => 'inherit',
            'posts_per_page' => $limit,
            'orderby' => 'date',
            'order' => 'DESC'
        );
        
        // Add category filter if specified
        if (!empty($category)) {
            $args['meta_query'] = array(
                array(
                    'key' => '_wp_attachment_image_alt',
                    'value' => $category,
                    'compare' => 'LIKE'
                )
            );
        }
        
        $images = get_posts($args);
        $gallery_data = array();
        
        foreach ($images as $image) {
            $image_data = wp_get_attachment_image_src($image->ID, 'full');
            $thumb_data = wp_get_attachment_image_src($image->ID, 'large');
            
            if ($image_data) {
                $gallery_data[] = array(
                    'id' => $image->ID,
                    'title' => get_the_title($image->ID),
                    'caption' => wp_get_attachment_caption($image->ID),
                    'description' => $image->post_content,
                    'url' => $image_data[0],
                    'thumb' => $thumb_data[0],
                    'alt' => get_post_meta($image->ID, '_wp_attachment_image_alt', true)
                );
            }
        }
        
        wp_send_json_success($gallery_data);
    }
    
    // Admin menu
    public function add_admin_menu() {
        add_options_page(
            'Modern Gallery Settings',
            'Modern Gallery',
            'manage_options',
            'modern-gallery',
            array($this, 'admin_page')
        );
    }
    
    public function admin_init() {
        register_setting('modern_gallery_settings', 'modern_gallery_options');
        
        add_settings_section(
            'modern_gallery_main',
            'Main Settings',
            null,
            'modern-gallery'
        );
        
        add_settings_field(
            'default_autoplay',
            'Default Autoplay',
            array($this, 'checkbox_field'),
            'modern-gallery',
            'modern_gallery_main',
            array('field' => 'default_autoplay')
        );
        
        add_settings_field(
            'default_delay',
            'Default Autoplay Delay (ms)',
            array($this, 'text_field'),
            'modern-gallery',
            'modern_gallery_main',
            array('field' => 'default_delay')
        );
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>Modern Gallery Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('modern_gallery_settings');
                do_settings_sections('modern-gallery');
                submit_button();
                ?>
            </form>
            
            <div class="modern-gallery-usage">
                <h2>Usage</h2>
                <p>Use the shortcode: <code>[modern_gallery]</code></p>
                <p>Available parameters:</p>
                <ul>
                    <li><code>category</code> - Filter images by category</li>
                    <li><code>limit</code> - Number of images to display (default: 10)</li>
                    <li><code>autoplay</code> - Enable/disable autoplay (true/false)</li>
                    <li><code>autoplay_delay</code> - Autoplay delay in milliseconds</li>
                </ul>
                <p>Example: <code>[modern_gallery limit="5" autoplay="false"]</code></p>
            </div>
        </div>
        <?php
    }
    
    public function checkbox_field($args) {
        $options = get_option('modern_gallery_options');
        $value = isset($options[$args['field']]) ? $options[$args['field']] : '';
        echo "<input type='checkbox' name='modern_gallery_options[{$args['field']}]' value='1' " . checked(1, $value, false) . " />";
    }
    
    public function text_field($args) {
        $options = get_option('modern_gallery_options');
        $value = isset($options[$args['field']]) ? $options[$args['field']] : '';
        echo "<input type='text' name='modern_gallery_options[{$args['field']}]' value='{$value}' />";
    }
}

// Initialize the plugin
new ModernGSAPGallery();

// Activation hook
register_activation_hook(__FILE__, 'modern_gallery_activate');
function modern_gallery_activate() {
    // Set default options
    $default_options = array(
        'default_autoplay' => 1,
        'default_delay' => 5000
    );
    add_option('modern_gallery_options', $default_options);
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'modern_gallery_deactivate');
function modern_gallery_deactivate() {
    // Clean up if needed
}
?>