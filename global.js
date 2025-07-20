// Display Refresh Rate Analyzer - Global JavaScript
// Comprehensive interactive functionality for all pages

// Global variables and configuration
const CONFIG = {
    siteName: 'Display Refresh Rate Analyzer',
    version: '2.0.0',
    apiEndpoint: 'https://refresh-rate-visualizer.vercel.app/api',
    analyticsId: 'G-XXXXXXXXXX', // Replace with actual Google Analytics ID
    adsenseClient: 'ca-pub-5456531892311284'
};

// Initialize global functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeGlobalFeatures();
    initializeAnalytics();
    initializeAdsense();
    initializePerformanceMonitoring();
});

// Main initialization function
function initializeGlobalFeatures() {
    setupMobileNavigation();
    setupSearchFunctionality();
    setupScrollAnimations();
    setupTooltips();
    setupLazyLoading();
    setupServiceWorker();
    setupErrorHandling();
    setupAccessibility();
}

// Mobile Navigation Setup
function setupMobileNavigation() {
    const header = document.querySelector('header');
    if (!header) return;

    // Create mobile menu button
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '☰';
    mobileMenuBtn.setAttribute('aria-label', 'Toggle mobile menu');

    // Create mobile menu overlay
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu-overlay';
    
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        const mobileNavLinks = navLinks.cloneNode(true);
        mobileNavLinks.className = 'mobile-nav-links';
        mobileMenu.appendChild(mobileNavLinks);
    }

    // Add close button to mobile menu
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-menu-close';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Close mobile menu');
    mobileMenu.insertBefore(closeBtn, mobileMenu.firstChild);

    // Add elements to DOM
    const nav = header.querySelector('nav');
    if (nav) {
        nav.appendChild(mobileMenuBtn);
        document.body.appendChild(mobileMenu);
    }

    // Event listeners
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    closeBtn.addEventListener('click', closeMobileMenu);
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) closeMobileMenu();
    });

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

// Global Search Functionality
function setupSearchFunctionality() {
    const searchInputs = document.querySelectorAll('.search-box input, #searchInput');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce(handleSearch, 300));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(input.value);
            }
        });
    });
}

function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    const searchContainer = event.target.closest('.search-container');
    
    if (query.length < 2) return;

    // Page-specific search handling
    if (document.querySelector('.monitor-grid')) {
        searchMonitors(query);
    } else if (document.querySelector('.blog-grid')) {
        searchBlogPosts(query);
    } else if (document.querySelector('.faq-container')) {
        searchFAQ(query);
    }

    // Track search events
    trackEvent('search', 'query', query);
}

function searchMonitors(query) {
    const monitorCards = document.querySelectorAll('.monitor-card');
    
    monitorCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const isVisible = text.includes(query);
        card.style.display = isVisible ? 'block' : 'none';
        
        if (isVisible) {
            highlightSearchTerm(card, query);
        }
    });
    
    updateResultsCount('.monitor-grid', query);
}

function searchBlogPosts(query) {
    const blogCards = document.querySelectorAll('.blog-card');
    
    blogCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const isVisible = text.includes(query);
        card.style.display = isVisible ? 'block' : 'none';
    });
    
    updateResultsCount('.blog-grid', query);
}

function searchFAQ(query) {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        const isVisible = text.includes(query);
        item.style.display = isVisible ? 'block' : 'none';
        
        if (isVisible && query.length > 0) {
            // Auto-expand matching FAQ items
            item.classList.add('active');
        }
    });
    
    updateResultsCount('.faq-container', query);
}

function updateResultsCount(containerSelector, query) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const visibleItems = container.querySelectorAll('[style*="block"], :not([style*="none"])').length;
    
    let resultsInfo = container.querySelector('.search-results-info');
    if (!resultsInfo) {
        resultsInfo = document.createElement('div');
        resultsInfo.className = 'search-results-info';
        container.insertBefore(resultsInfo, container.firstChild);
    }
    
    if (query) {
        resultsInfo.textContent = `Found ${visibleItems} results for "${query}"`;
        resultsInfo.style.display = 'block';
    } else {
        resultsInfo.style.display = 'none';
    }
}

// Scroll Animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe cards, sections, and other elements
    const elementsToAnimate = document.querySelectorAll(
        '.card, .tool-container, .blog-card, .monitor-card, .faq-item, .metric'
    );
    
    elementsToAnimate.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Tooltip System
function setupTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('focus', showTooltip);
        element.addEventListener('blur', hideTooltip);
    });
}

function showTooltip(event) {
    const element = event.target;
    const tooltipText = element.getAttribute('data-tooltip');
    
    if (!tooltipText) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-popup';
    tooltip.textContent = tooltipText;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    element._tooltip = tooltip;
    
    setTimeout(() => tooltip.classList.add('visible'), 10);
}

function hideTooltip(event) {
    const element = event.target;
    if (element._tooltip) {
        element._tooltip.remove();
        delete element._tooltip;
    }
}

// Lazy Loading for Images and Content
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    lazyImageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            lazyImageObserver.observe(img);
        });
    }
}

// Service Worker Registration
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// Error Handling and Reporting
function setupErrorHandling() {
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        trackEvent('error', 'javascript', event.error.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        trackEvent('error', 'promise', event.reason.toString());
    });
}

// Accessibility Enhancements
function setupAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Keyboard navigation improvements
    document.addEventListener('keydown', (e) => {
        // Escape key handling
        if (e.key === 'Escape') {
            // Close any open modals, dropdowns, etc.
            const activeElements = document.querySelectorAll('.active, .open');
            activeElements.forEach(el => {
                el.classList.remove('active', 'open');
            });
        }
    });

    // Focus management
    const focusableElements = 'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select';
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const focusable = Array.from(document.querySelectorAll(focusableElements));
            const currentIndex = focusable.indexOf(document.activeElement);
            
            if (e.shiftKey) {
                // Shift + Tab (backward)
                if (currentIndex === 0) {
                    focusable[focusable.length - 1].focus();
                    e.preventDefault();
                }
            } else {
                // Tab (forward)
                if (currentIndex === focusable.length - 1) {
                    focusable[0].focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// Analytics and Tracking
function initializeAnalytics() {
    // Google Analytics 4
    if (CONFIG.analyticsId) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.analyticsId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', CONFIG.analyticsId);
        
        window.gtag = gtag;
    }

    // Track page views
    trackPageView();
    
    // Track user engagement
    setupEngagementTracking();
}

function trackEvent(action, category, label, value) {
    if (window.gtag) {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
    
    console.log('Event tracked:', { action, category, label, value });
}

function trackPageView() {
    const page = window.location.pathname;
    trackEvent('page_view', 'navigation', page);
}

function setupEngagementTracking() {
    let startTime = Date.now();
    let scrollDepth = 0;
    
    // Track time on page
    window.addEventListener('beforeunload', () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        trackEvent('time_on_page', 'engagement', window.location.pathname, timeSpent);
    });
    
    // Track scroll depth
    window.addEventListener('scroll', debounce(() => {
        const currentScroll = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (currentScroll > scrollDepth) {
            scrollDepth = currentScroll;
            if (scrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                trackEvent('scroll_depth', 'engagement', `${scrollDepth}%`);
            }
        }
    }, 500));
    
    // Track clicks on important elements
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.matches('.btn, .cta-button')) {
            trackEvent('button_click', 'interaction', target.textContent.trim());
        }
        
        if (target.matches('a[href^="http"]')) {
            trackEvent('external_link', 'navigation', target.href);
        }
        
        if (target.matches('.nav-links a')) {
            trackEvent('navigation', 'menu', target.textContent.trim());
        }
    });
}

// AdSense Integration
function initializeAdsense() {
    if (CONFIG.adsenseClient) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CONFIG.adsenseClient}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
        
        // Initialize ads after script loads
        script.onload = () => {
            const ads = document.querySelectorAll('.adsbygoogle');
            ads.forEach(ad => {
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                } catch (e) {
                    console.warn('AdSense error:', e);
                }
            });
        };
    }
}

// Performance Monitoring
function initializePerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
        import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(onPerfEntry);
            getFID(onPerfEntry);
            getFCP(onPerfEntry);
            getLCP(onPerfEntry);
            getTTFB(onPerfEntry);
        });
    }
    
    function onPerfEntry({name, delta, rating}) {
        trackEvent('web_vital', name, rating, Math.round(delta));
    }
    
    // Monitor resource loading
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const loadTime = Math.round(perfData.loadEventEnd - perfData.fetchStart);
        trackEvent('page_load_time', 'performance', window.location.pathname, loadTime);
    });
}

// Utility Functions
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function highlightSearchTerm(element, term) {
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        const regex = new RegExp(`(${term})`, 'gi');
        
        if (regex.test(text)) {
            const highlightedText = text.replace(regex, '<mark>$1</mark>');
            const wrapper = document.createElement('span');
            wrapper.innerHTML = highlightedText;
            textNode.parentNode.replaceChild(wrapper, textNode);
        }
    });
}

// Export for use in other scripts
window.DisplayRefreshRateAnalyzer = {
    CONFIG,
    trackEvent,
    debounce,
    throttle,
    highlightSearchTerm
};

// Console welcome message
console.log(`
🎮 Display Refresh Rate Analyzer v${CONFIG.version}
🚀 Professional monitor testing and optimization platform
📊 Advanced analytics and performance monitoring enabled
💡 Report issues: https://github.com/your-repo/issues
`);

// Add CSS for animations and mobile menu
const globalStyles = `
<style>
/* Global Animation Styles */
.animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
}

/* Mobile Menu Styles */
.mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #333;
    padding: 10px;
}

.mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 9999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.mobile-menu-overlay.active {
    opacity: 1;
    visibility: visible;
}

.mobile-nav-links {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    gap: 30px;
}

.mobile-nav-links a {
    color: white;
    font-size: 1.5rem;
    text-decoration: none;
    transition: color 0.3s ease;
}

.mobile-nav-links a:hover {
    color: #667eea;
}

.mobile-menu-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Skip Link */
.skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 10000;
    transition: top 0.3s ease;
}

.skip-link:focus {
    top: 6px;
}

/* Tooltip Popup */
.tooltip-popup {
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.8rem;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.tooltip-popup.visible {
    opacity: 1;
}

/* Search Results Info */
.search-results-info {
    background: #e3f2fd;
    color: #1565c0;
    padding: 10px 15px;
    border-radius: 5px;
    margin-bottom: 20px;
    font-size: 0.9rem;
    border-left: 4px solid #2196f3;
}

/* Highlight Search Terms */
mark {
    background: #ffeb3b;
    padding: 2px 4px;
    border-radius: 2px;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
    .mobile-menu-btn {
        display: block;
    }
    
    .nav-links {
        display: none;
    }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
    .tooltip-popup {
        background: #000;
        border: 2px solid #fff;
    }
    
    .search-results-info {
        background: #fff;
        color: #000;
        border: 2px solid #000;
    }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
    .animate-on-scroll {
        transition: none;
        opacity: 1;
        transform: none;
    }
    
    .mobile-menu-overlay {
        transition: none;
    }
}
</style>
`;

// Inject global styles
document.head.insertAdjacentHTML('beforeend', globalStyles);