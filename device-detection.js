/**
 * Device Detection Script for CompareHubPrices
 * Detects mobile, tablet, and desktop devices and adds appropriate classes
 */

(function() {
    'use strict';
    
    // Device detection function
    function detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isTablet = /ipad|android(?!.*mobile)|tablet|kindle|silk/i.test(userAgent);
        const isDesktop = !isMobile && !isTablet;
        
        // Additional checks for tablets
        const isIPad = /ipad/i.test(userAgent);
        const isAndroidTablet = /android/i.test(userAgent) && !/mobile/i.test(userAgent);
        const isKindle = /kindle|silk/i.test(userAgent);
        
        // Screen size checks
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Touch capability
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // High DPI detection
        const isHighDPI = window.devicePixelRatio > 1;
        
        // Determine device type with more precision
        let deviceType = 'desktop';
        let deviceClass = 'desktop';
        
        if (isIPad || isAndroidTablet || isKindle) {
            deviceType = 'tablet';
            deviceClass = 'tablet';
        } else if (isTablet || (isTouchDevice && (screenWidth >= 768 && screenWidth <= 1366))) {
            deviceType = 'tablet';
            deviceClass = 'tablet';
        } else if (isMobile || (isTouchDevice && screenWidth < 768)) {
            deviceType = 'mobile';
            deviceClass = 'mobile';
        } else if (isTouchDevice && screenWidth >= 768 && screenWidth <= 1024) {
            deviceType = 'tablet';
            deviceClass = 'tablet';
        }
        
        // Special handling for iPad Pro and iPad Air
        if (isIPad) {
            if (screenWidth >= 1024 || viewportWidth >= 1024) {
                deviceType = 'tablet';
                deviceClass = 'tablet ipad-pro';
            } else {
                deviceType = 'tablet';
                deviceClass = 'tablet ipad';
            }
        }
        
        // Add device classes to body
        const body = document.body;
        
        // Remove existing device classes
        body.classList.remove('mobile', 'tablet', 'desktop', 'ipad', 'ipad-pro', 'android-tablet');
        
        // Add new device class
        body.classList.add(deviceClass);
        
        // Add touch/no-touch class
        if (isTouchDevice) {
            body.classList.add('touch-device');
        } else {
            body.classList.add('no-touch');
        }
        
        // Add high DPI class
        if (isHighDPI) {
            body.classList.add('high-dpi');
        }
        
        // Store device info in window object for other scripts
        window.deviceInfo = {
            type: deviceType,
            class: deviceClass,
            isMobile: deviceType === 'mobile',
            isTablet: deviceType === 'tablet',
            isDesktop: deviceType === 'desktop',
            isTouch: isTouchDevice,
            isHighDPI: isHighDPI,
            screenWidth: screenWidth,
            screenHeight: screenHeight,
            viewportWidth: viewportWidth,
            viewportHeight: viewportHeight,
            userAgent: userAgent
        };
        
        // Log device info for debugging
        console.log('Device Detection:', {
            type: deviceType,
            class: deviceClass,
            screen: `${screenWidth}x${screenHeight}`,
            viewport: `${viewportWidth}x${viewportHeight}`,
            touch: isTouchDevice,
            highDPI: isHighDPI,
            userAgent: userAgent
        });
        
        return deviceType;
    }
    
    // Run detection on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectDevice);
    } else {
        detectDevice();
    }
    
    // Re-run detection on resize (with debouncing)
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            detectDevice();
        }, 250);
    });
    
    // Re-run detection on orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(detectDevice, 100);
    });
    
    // Make detectDevice function globally available
    window.detectDevice = detectDevice;
    
})();
