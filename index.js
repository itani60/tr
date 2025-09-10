



// API URL for smartphone data
const SMARTPHONE_API_URL = 'https://xf9zlapr5e.execute-api.af-south-1.amazonaws.com/smartphones';

// Make API URL globally available
window.SMARTPHONE_API_URL = SMARTPHONE_API_URL;

/**
 * Shuffle array to randomize order
 * @param {Array} array - The array to shuffle
 * @returns {Array} - The shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Load and display smartphone products from API in the products grid
 */
async function loadSmartphoneProductsGrid() {
    try {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) {
            console.error('Products grid not found');
            return;
        }

        // Show loading state
        productsGrid.innerHTML = `
            <div class="loading-state" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 0;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <p style="color: #64748b;">Loading smartphone deals...</p>
            </div>
        `;

        // Fetch smartphone data from API
        const smartphoneProducts = await fetchSmartphoneData();

        if (!smartphoneProducts || smartphoneProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 0;">
                    <i class="fas fa-search" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <h3 style="color: #334155; margin-bottom: 0.5rem;">No smartphone deals available</h3>
                    <p style="color: #64748b;">Please check back later for the latest deals.</p>
                </div>
            `;
            return;
        }

        // Clear loading state and populate with real data
        productsGrid.innerHTML = '';

        // Shuffle products to randomize display order
        const shuffledProducts = shuffleArray([...smartphoneProducts]);
        
        // Display up to 12 products from the shuffled array (4 slides x 3 products)
        const displayProducts = shuffledProducts.slice(0, 12);
        
        displayProducts.forEach(product => {
            const productCard = createSmartphoneProductCardForGrid(product);
            productsGrid.appendChild(productCard);
        });
        
        // Initialize carousel with indicators
        initializeCarouselWithIndicators(displayProducts.length);

    } catch (error) {
        console.error('Error loading smartphone products grid:', error);
        
        const productsGrid = document.querySelector('.products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="error-state" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 0;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                    <h3 style="color: #334155; margin-bottom: 0.5rem;">Failed to load smartphone deals</h3>
                    <p style="color: #64748b; margin-bottom: 1rem;">${error.message}</p>
                    <button onclick="loadSmartphoneProductsGrid()" class="retry-btn" style="padding: 0.75rem 1.5rem; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Retry</button>
                </div>
            `;
        }
    }
}

/**
 * Create a product card element for the products grid (different from carousel)
 * @param {Object} product - The product data from API
 * @returns {HTMLElement} - The product card element
 */
function createSmartphoneProductCardForGrid(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-category", product.category || 'smartphones');

    // Get the lowest price from offers
    let lowestPrice = Infinity;
    let highestOriginalPrice = 0;
    let bestOffer = null;

    if (product.offers && product.offers.length > 0) {
        product.offers.forEach(offer => {
            if (offer.price && offer.price < lowestPrice) {
                lowestPrice = offer.price;
                bestOffer = offer;
            }
            if (offer.originalPrice && offer.originalPrice > highestOriginalPrice) {
                highestOriginalPrice = offer.originalPrice;
            }
        });
    }

    // Calculate discount percentage
    const discountPercentage = highestOriginalPrice > 0 && lowestPrice < highestOriginalPrice 
        ? Math.round(((highestOriginalPrice - lowestPrice) / highestOriginalPrice) * 100)
        : 0;

    // Format price
    const formatPrice = (price) => {
        if (price === 0 || price === null || price === undefined) return 'Price TBD';
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    // Get product specs for display
    const specs = product.specs || {};
    const displaySpecs = [];
    
    if (specs.Display && specs.Display.Main && specs.Display.Main.Size) {
        displaySpecs.push(specs.Display.Main.Size);
    }
    if (specs.Performance && specs.Performance.Storage) {
        displaySpecs.push(specs.Performance.Storage);
    }
    if (specs.Camera && specs.Camera.Rear_Main) {
        const cameraMatch = specs.Camera.Rear_Main.match(/(\d+)MP/);
        if (cameraMatch) {
            displaySpecs.push(`${cameraMatch[1]}MP Camera`);
        }
    }

    card.innerHTML = `
        <div class="product-image">
            <img src="${product.imageUrl || 'https://via.placeholder.com/400x400/f1f5f9/64748b?text=No+Image'}" 
                 alt="${product.model || product.name || 'Smartphone'}"
                 loading="lazy"
                 decoding="async"
                 width="400"
                 height="400"
                 style="object-fit: contain; object-position: center;"
                 onload="this.classList.add('loaded')"
                 onerror="this.src='https://via.placeholder.com/400x400/f1f5f9/64748b?text=No+Image'; this.style.objectFit='contain'; this.classList.add('loaded');">
        </div>
        <div class="product-info">
            <h3 class="product-title">
                ${product.brand ? `<span class="brand-name">${product.brand}</span>` : ''}
                ${product.model || product.name || 'Smartphone'}
            </h3>
            <div class="product-specs">
                ${displaySpecs.map(spec => `<span class="spec">${spec}</span>`).join('')}
            </div>
            <div class="product-prices">
                <span class="current-price">${formatPrice(lowestPrice)}</span>
                ${highestOriginalPrice > 0 && lowestPrice < highestOriginalPrice ? 
                    `<span class="original-price">${formatPrice(highestOriginalPrice)}</span>` : ''}
                ${discountPercentage > 0 ? `<span class="discount">-${discountPercentage}%</span>` : ''}
            </div>
            ${product.offers && product.offers.length > 0 ? 
                `<div class="offers-count">
                    <i class="fas fa-store"></i>
                    <span>${product.offers.length} ${product.offers.length === 1 ? 'retailer' : 'retailers'}</span>
                </div>` : ''}
            <div class="product-actions">
                <button class="btn-compare" onclick="compareProduct('${product.category || 'smartphones'}')">Compare</button>
                <button class="btn-view-deals" onclick="viewProductDeals('${product.category || 'smartphones'}')">Add to Wishlist</button>
            </div>
        </div>
    `;

    return card;
}

/**
 * Create a product card element for smartphone deals
 * @param {Object} product - The product data
 * @returns {HTMLElement} - The product card element
 */
function createSmartphoneProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-product-id", product.product_id || product.id || product.productId);

    // Get the lowest price from offers
    let lowestPrice = Infinity;
    let highestOriginalPrice = 0;

    if (product.offers && product.offers.length > 0) {
        product.offers.forEach(offer => {
            if (offer.price && offer.price < lowestPrice) {
                lowestPrice = offer.price;
            }
            if (offer.originalPrice && offer.originalPrice > highestOriginalPrice) {
                highestOriginalPrice = offer.originalPrice;
            }
        });
    }

    // If no valid price was found, set to null
    if (lowestPrice === Infinity) {
        lowestPrice = null;
    }

    // Format price with commas
    const formattedPrice = lowestPrice ? lowestPrice.toLocaleString('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) : 'Price not available';
    const discount = product.discount || product.discount_percentage || '';

    // Format image URL
    const imageUrl = product.imageUrl || product.image || product.img || '';

    // Format product name
    const productName = product.model || (product.brand ? product.brand + ' ' + (product.product_id || product.id || product.productId) : 'Smartphone');
    const specs = [];

    // Extract RAM, storage, and OS from specs if available
    if (product.specs) {
        if (product.specs.Performance) {
            if (product.specs.Performance.Ram) {
                specs.push(product.specs.Performance.Ram);
            }
            if (product.specs.Performance.Storage) {
                specs.push(product.specs.Performance.Storage);
            }
        }
        if (product.specs.Os && product.specs.Os['Operating System']) {
            specs.push(product.specs.Os['Operating System']);
        }
    }

    card.innerHTML = `
        <a href="smartphones-info.html?id=${product.product_id || product.id || product.productId}" class="product-link">
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${productName}" class="product-image" loading="lazy"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
            </div>
            <div class="product-details">
                <h3 class="product-name">${productName}</h3>
                ${specs.length > 0 ? `<div class="product-specs"><span>${specs.join(' • ')}</span></div>` : ''}
                <div class="product-price">
                    <span class="current-price">${formattedPrice}</span>
                    ${highestOriginalPrice > lowestPrice ? `<span class="original-price">R${highestOriginalPrice.toLocaleString()}</span>` : ''}
                </div>
                <div class="product-retailers">
                    <span>${product.offers ? product.offers.length : 0} retailers</span>
                </div>
            </div>
        </a>
        <div class="product-buttons">
            <button class="compare-button" data-product-id="${product.product_id || product.id || product.productId}">Compare</button>
            <button class="wishlist-button" data-product-id="${product.product_id || product.id || product.productId}">Add to Wishlist</button>
        </div>
    `;

    // Add event listener for compare button
    const compareButton = card.querySelector('.compare-button');
    compareButton.addEventListener('click', function () {
        window.location.href = `smartphones-info.html?id=${product.product_id || product.id || product.productId}`;
    });

    // Add event listener for wishlist button
    const wishlistButton = card.querySelector('.wishlist-button');
    wishlistButton.addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Only call wishlist.js functions if loaded
        if (typeof addToWishlist === 'function' && typeof removeFromWishlist === 'function') {
            const productId = this.getAttribute('data-product-id');
            // Check if product is in wishlist by comparing with wishlistItems
            const isCurrentlyInWishlist = wishlistItems && wishlistItems.some(item => item.id === productId);

            // Show loading indicator
            this.classList.add('wishlist-loading');
            const originalText = this.innerHTML;
            this.innerHTML = '<div class="wishlist-spinner"></div>';

            try {
                if (isCurrentlyInWishlist) {
                    await removeFromWishlist(productId);
                } else {
                    const wishlistItem = {
                        id: productId,
                        name: `${product.brand || ''} ${product.model || product.product_id || product.id || product.productId}`.trim(),
                        price: getLowestPrice(product),
                        image: product.imageUrl || product.image || product.img || '',
                        url: `smartphones-info.html?id=${product.product_id || product.id || product.productId}`
                    };

                    const result = await addToWishlist(wishlistItem);
                }
            } catch (error) {
                console.error('Error updating wishlist:', error);
                // Use a notification function from your main app if available
                if (typeof showNotification === 'function') {
                    showNotification('Wishlist Error', 'There was a problem updating your wishlist. Please try again.', 'error');
                }
            } finally {
                // Hide loading indicator
                this.classList.remove('wishlist-loading');
                this.innerHTML = originalText;
            }
        }
    });

    return card;
}

/**
 * Display smartphone products in carousel format with mobile optimizations
 * @param {Array} products - The products to display
 */
function displaySmartphoneProducts(products) {
    // Get the carousel elements
    const slidesContainer = document.getElementById("smartphoneSlides");
    const indicatorsContainer = document.getElementById("smartphoneIndicators");

    // Clear existing content
    slidesContainer.innerHTML = "";
    indicatorsContainer.innerHTML = "";

    // Filter out any invalid products
    const validProducts = products.filter(product => product && (product.name || product.model || product.title));

    if (validProducts.length === 0) {
        slidesContainer.innerHTML = `
            <div class="no-results" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px 15px; width: 100%; font-size: 14px;">
                <i class="fas fa-search" style="font-size: 32px; color: #ccc; margin-bottom: 15px;"></i>
                <p style="font-size: 16px; margin-bottom: 15px; font-weight: bold;">No smartphone deals available.</p>
                <p style="color: #666; font-size: 13px;">Please check back later for the latest deals.</p>
            </div>
        `;
        return;
    }

    // Use 4 products per slide for all screen sizes to maintain consistency
    const productsPerSlide = 4;
    const totalSlides = 4; // Fixed 4 slides for all devices

    // Take products for carousel
    const maxProducts = totalSlides * productsPerSlide;
    const carouselProducts = validProducts.slice(0, maxProducts);

    // Create slides
    for (let slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
        const slide = document.createElement('div');
        slide.className = 'smartphone-slide';
        if (slideIndex === 0) slide.classList.add('active');

        // Get products for this slide
        const startIndex = slideIndex * productsPerSlide;
        const endIndex = Math.min(startIndex + productsPerSlide, carouselProducts.length);
        const slideProducts = carouselProducts.slice(startIndex, endIndex);

        // Create product cards for this slide
        slideProducts.forEach(product => {
            const productCard = createSmartphoneProductCard(product);
            slide.appendChild(productCard);
        });

        slidesContainer.appendChild(slide);

        // Create indicator
        const indicator = document.createElement('span');
        indicator.className = 'smartphone-indicator';
        if (slideIndex === 0) indicator.classList.add('active');
        indicator.setAttribute('aria-label', `Go to slide ${slideIndex + 1}`);
        indicatorsContainer.appendChild(indicator);
    }

    // Initialize carousel
    initializeSmartphoneCarousel();
}


/**
 * Fetch smartphone data from API
 * @returns {Promise<Array>} - The smartphone products data
 */
async function fetchSmartphoneData() {
    try {
        const apiUrl = SMARTPHONE_API_URL || window.SMARTPHONE_API_URL || 'https://xf9zlapr5e.execute-api.af-south-1.amazonaws.com/smartphones';
        console.log('Fetching smartphone data from:', apiUrl);
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle different response formats
        if (Array.isArray(data)) {
            return data;
        } else if (data.products || data.smartphones || data.items) {
            return data.products || data.smartphones || data.items;
        } else if (data.data) {
            return Array.isArray(data.data) ? data.data : [data.data];
        }

        return [];
    } catch (error) {
        console.error('Error fetching smartphone data:', error);
        return [];
    }
}

/**
 * Initialize smartphone carousel with mobile optimizations
 */
function initializeSmartphoneCarousel() {
    const slidesContainer = document.getElementById('smartphoneSlides');
    const indicators = document.querySelectorAll('.smartphone-indicator');
    let currentIndex = 0;
    let interval;
    let isTransitioning = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let isScrolling = false;

    // Performance optimization: Use transform3d for hardware acceleration
    function showSlide(index, smooth = true) {
        if (isTransitioning) return;
        isTransitioning = true;

        const slides = slidesContainer.querySelectorAll('.smartphone-slide');
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });

        // Use transform3d for better performance
        slidesContainer.style.transform = `translate3d(-${index * 100}%, 0, 0)`;

        if (!smooth) {
            slidesContainer.style.transition = 'none';
            setTimeout(() => {
                slidesContainer.style.transition = '';
            }, 50);
        }

        currentIndex = index;

        // Reset transition flag after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, smooth ? 400 : 50);
    }

    function nextSlide() {
        const nextIndex = (currentIndex + 1) % 4;
        showSlide(nextIndex);
    }

    function prevSlide() {
        const prevIndex = (currentIndex - 1 + 4) % 4;
        showSlide(prevIndex);
    }

    function startCarousel() {
        stopCarousel();
        // Auto-advance every 25 seconds, but only if user is not actively interacting
        interval = setInterval(() => {
            if (!isTransitioning && !isScrolling) {
                nextSlide();
            }
        }, 25000);
    }

    function stopCarousel() {
        clearInterval(interval);
    }

    // Enhanced touch/swipe support for mobile
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isScrolling = false;
        stopCarousel();
    }

    function handleTouchMove(e) {
        if (!touchStartX || !touchStartY) return;

        const touchCurrentX = e.touches[0].clientX;
        const touchCurrentY = e.touches[0].clientY;
        const diffX = Math.abs(touchCurrentX - touchStartX);
        const diffY = Math.abs(touchCurrentY - touchStartY);

        // Determine if user is scrolling vertically (prevent horizontal swipe)
        if (diffY > diffX && diffY > 10) {
            isScrolling = true;
        }
    }

    function handleTouchEnd(e) {
        if (isScrolling) {
            startCarousel();
            return;
        }

        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;

        // Minimum swipe distance (50px) and not too slow
        if (Math.abs(diff) > 50 && !isTransitioning) {
            if (diff > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        }

        // Reset touch variables
        touchStartX = 0;
        touchStartY = 0;
        startCarousel();
    }

    // Add click handlers to indicators with haptic feedback simulation
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            stopCarousel();
            showSlide(index);
            startCarousel();

            // Simulate haptic feedback on mobile
            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
        });
    });

    // Touch event listeners with passive option for better performance
    slidesContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    slidesContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    slidesContainer.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Pause carousel on hover/focus for accessibility
    slidesContainer.addEventListener('mouseenter', stopCarousel);
    slidesContainer.addEventListener('mouseleave', startCarousel);

    // Keyboard navigation for accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
        }
    });

    // Handle visibility change (pause when tab is not active)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopCarousel();
        } else {
            startCarousel();
        }
    });

    // Initialize carousel
    showSlide(0, false);
    startCarousel();

    // Return cleanup function
    return function cleanup() {
        stopCarousel();
        slidesContainer.removeEventListener('touchstart', handleTouchStart);
        slidesContainer.removeEventListener('touchmove', handleTouchMove);
        slidesContainer.removeEventListener('touchend', handleTouchEnd);
        slidesContainer.removeEventListener('mouseenter', stopCarousel);
        slidesContainer.removeEventListener('mouseleave', startCarousel);
    };
}


/**
 * Initialize smartphone deals section
 */
async function initializeSmartphoneDeals() {
    try {
        // Show loading state
        const slidesContainer = document.getElementById("smartphoneSlides");
        if (slidesContainer) {
            slidesContainer.innerHTML = `
                <div class="loading-indicator" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 0; width: 100%;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #ff0000; margin-bottom: 1rem;"></i>
                    <p>Loading smartphone deals...</p>
                </div>
            `;
        }

        // Fetch smartphone data
        const smartphoneProducts = await fetchSmartphoneData();

        // Store products globally
        window.currentSmartphoneProducts = smartphoneProducts;

        // Display products in carousel format
        displaySmartphoneProducts(smartphoneProducts);

    } catch (error) {
        console.error('Error initializing smartphone deals:', error);

        // Show error state
        const slidesContainer = document.getElementById("smartphoneSlides");
        if (slidesContainer) {
            slidesContainer.innerHTML = `
                <div class="error-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 0; width: 100%;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
                    <h3 style="color: #333; margin-bottom: 10px;">Failed to load smartphone deals</h3>
                    <p style="color: #666; margin-bottom: 20px;">${error.message}</p>
                    <button onclick="initializeSmartphoneDeals()" class="retry-btn" style="padding: 10px 20px; background: #ff0000; color: white; border: none; border-radius: 5px; cursor: pointer;">Retry</button>
                </div>
            `;
        }
    }
}

/**
 * Navigate to smartphone page with type filter
 * @param {string} type - The product type (android, ios, etc.)
 */
function navigateToSmartphonesByType(type) {
    // Close the sidebar
    if (typeof closeSidebar === 'function') {
        closeSidebar();
    }

    // Navigate to smartphones page with type parameter
    window.location.href = `smartphones.html?type=${type}`;
}

// Price Alert Functions (similar to climate-control.js)
function getPriceAlerts() {
    const savedAlerts = localStorage.getItem('priceAlerts');
    if (savedAlerts) {
        try {
            return JSON.parse(savedAlerts);
        } catch (e) {
            console.error('Error parsing price alerts:', e);
            return [];
        }
    }
    return [];
}

function savePriceAlerts(alerts) {
    localStorage.setItem('priceAlerts', JSON.stringify(alerts));
}

function togglePriceAlert(productId, currentPrice, productName, productImage) {
    const alerts = getPriceAlerts();
    const existingAlertIndex = alerts.findIndex(alert => alert.productId === productId);

    if (existingAlertIndex >= 0) {
        // Remove existing alert
        alerts.splice(existingAlertIndex, 1);
        if (typeof showNotification === 'function') {
            showNotification('Price Alert Removed', `Price alert for ${productName} has been removed.`, 'info');
        }

        // Update UI
        const bellIcon = document.querySelector(`.price-alert-bell[data-product-id="${productId}"]`);
        if (bellIcon) {
            bellIcon.classList.remove('active');
        }
    } else {
        // Show price alert modal
        showPriceAlertModal(productId, currentPrice, productName, productImage);
    }

    savePriceAlerts(alerts);
}

function showPriceAlertModal(productId, currentPrice, productName, productImage) {
    // Check if modal already exists
    let modal = document.getElementById('priceAlertModal');
    if (modal) {
        modal.remove();
    }

    // Create modal HTML
    const modalHTML = `
        <div class="price-alert-modal" id="priceAlertModal">
            <div class="price-alert-container">
                <div class="price-alert-header">
                    <h2 class="price-alert-title">Set Price Alert</h2>
                    <button class="price-alert-close" id="priceAlertModalClose">&times;</button>
                </div>
                <div class="price-alert-content">
                    <div class="price-alert-product">
                        <div class="price-alert-product-image">
                            <img src="${productImage}" alt="${productName}">
                        </div>
                        <div class="price-alert-product-info">
                            <h3 class="price-alert-product-title">${productName}</h3>
                            <div class="price-alert-product-price">R${typeof currentPrice === 'number' ? currentPrice.toLocaleString() : currentPrice}</div>
                        </div>
                    </div>

                    <form id="priceAlertForm">
                        <div class="price-alert-form-group">
                            <label for="alertPrice">Alert me when price drops below:</label>
                            <div class="price-alert-input-container">
                                <span class="price-alert-currency">R</span>
                                <input type="number" id="alertPrice" class="price-alert-input" value="${Math.floor(currentPrice * 0.9)}" min="1" max="${currentPrice - 1}">
                            </div>
                        </div>

                        <div class="price-alert-form-group">
                            <label for="alertEmail">Email for notifications (optional):</label>
                            <input type="email" id="alertEmail" class="price-alert-input" placeholder="Enter your email address">
                        </div>

                        <div class="price-alert-actions">
                            <button type="button" class="price-alert-btn secondary" id="cancelPriceAlert">Cancel</button>
                            <button type="button" id="savePriceAlert" class="price-alert-btn primary">Set Alert</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Add modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);

    // Show modal with animation
    setTimeout(() => {
        document.getElementById('priceAlertModal').classList.add('active');
    }, 10);

    // Add event listeners
    document.getElementById('priceAlertModalClose').addEventListener('click', () => {
        document.getElementById('priceAlertModal').classList.remove('active');
        setTimeout(() => {
            document.getElementById('priceAlertModal').remove();
        }, 300);
    });

    document.getElementById('cancelPriceAlert').addEventListener('click', () => {
        document.getElementById('priceAlertModal').classList.remove('active');
        setTimeout(() => {
            document.getElementById('priceAlertModal').remove();
        }, 300);
    });

    document.getElementById('savePriceAlert').addEventListener('click', () => {
        const alertPrice = parseFloat(document.getElementById('alertPrice').value);
        const alertEmail = document.getElementById('alertEmail').value;

        if (isNaN(alertPrice) || alertPrice >= currentPrice || alertPrice <= 0) {
            if (typeof showNotification === 'function') {
                showNotification('Invalid Price', 'Please enter a valid price below the current price.', 'error');
            }
            return;
        }

        // Save the alert
        const alerts = getPriceAlerts();
        alerts.push({
            productId,
            productName,
            currentPrice,
            alertPrice,
            email: alertEmail,
            dateCreated: new Date().toISOString()
        });
        savePriceAlerts(alerts);

        // Update UI
        const bellIcon = document.querySelector(`.price-alert-bell[data-product-id="${productId}"]`);
        if (bellIcon) {
            bellIcon.classList.add('active');
        }

        // Show confirmation
        if (typeof showNotification === 'function') {
            showNotification('Price Alert Set', `We'll notify you when ${productName} drops below R${alertPrice.toLocaleString()}.`, 'success');
        }

        // Close modal with animation
        document.getElementById('priceAlertModal').classList.remove('active');
        setTimeout(() => {
            document.getElementById('priceAlertModal').remove();
        }, 300);
    });
}

// Initialize smartphone deals when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Ensure API URL is available before proceeding
    if (typeof window.SMARTPHONE_API_URL === 'undefined') {
        console.error('SMARTPHONE_API_URL is not defined. Retrying in 100ms...');
        setTimeout(() => {
            if (typeof window.SMARTPHONE_API_URL !== 'undefined') {
                initializeSmartphoneDeals();
                loadSmartphoneProductsGrid();
            } else {
                console.error('SMARTPHONE_API_URL still not defined after retry');
            }
        }, 100);
        return;
    }
    
    // Initialize smartphone deals section
    initializeSmartphoneDeals();
    
    // Load smartphone products grid with API data
    loadSmartphoneProductsGrid();
});

// Helper function to get lowest price from offers
function getLowestPrice(product) {
    let lowestPrice = Infinity;
    if (product.offers && product.offers.length > 0) {
        product.offers.forEach(offer => {
            if (offer.price && offer.price < lowestPrice) {
                lowestPrice = offer.price;
            }
        });
    }
    return lowestPrice === Infinity ? 0 : lowestPrice;
}

/**
 * Compare a product with others
 * @param {string} category - The product category to compare
 */
function compareProduct(category) {
    console.log('Comparing products in category:', category);
    // TODO: Implement comparison functionality
    alert(`Compare functionality for ${category} will be implemented soon!`);
}

/**
 * View deals for a specific product
 * @param {string} category - The product category to view deals for
 */
function viewProductDeals(category) {
    console.log('Viewing deals for category:', category);
    // TODO: Implement view deals functionality
    alert(`View deals functionality for ${category} will be implemented soon!`);
}

// Carousel functionality with indicators
let currentSlide = 0;
let totalSlides = 0;
let productsPerSlide = 3;

function initializeCarouselWithIndicators(totalProducts) {
    totalSlides = Math.ceil(totalProducts / productsPerSlide);
    currentSlide = 0;
    
    // Create indicators
    const indicatorsContainer = document.getElementById('carousel-indicators');
    if (indicatorsContainer && totalSlides > 1) {
        indicatorsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
            indicator.addEventListener('click', () => goToSlide(i));
            indicatorsContainer.appendChild(indicator);
        }
    } else if (indicatorsContainer) {
        indicatorsContainer.innerHTML = '';
    }
    
    // Show first slide
    showSlide(0);
}

function goToSlide(slideIndex) {
    if (slideIndex < 0) {
        slideIndex = totalSlides - 1;
    } else if (slideIndex >= totalSlides) {
        slideIndex = 0;
    }
    
    currentSlide = slideIndex;
    showSlide(currentSlide);
    updateIndicators();
}

function showSlide(slideIndex) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    const products = productsGrid.querySelectorAll('.product-card');
    const startIndex = slideIndex * productsPerSlide;
    const endIndex = Math.min(startIndex + productsPerSlide, products.length);
    
    // Hide all products
    products.forEach((product, index) => {
        if (index >= startIndex && index < endIndex) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

function updateIndicators() {
    const indicators = document.querySelectorAll('.carousel-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
}


// Make functions globally available
window.navigateToSmartphonesByType = navigateToSmartphonesByType;
window.initializeSmartphoneDeals = initializeSmartphoneDeals;
window.loadSmartphoneProductsGrid = loadSmartphoneProductsGrid;
window.createSmartphoneProductCardForGrid = createSmartphoneProductCardForGrid;
window.compareProduct = compareProduct;
window.viewProductDeals = viewProductDeals;
window.goToSlide = goToSlide;
window.shuffleArray = shuffleArray;

/**
 * TRENDING DEALS SECTION
 * Separate from smartphone deals for clean organization
 */

// API URL for trending deals
const TRENDING_DEALS_API_URL = 'https://xf9zlapr5e.execute-api.af-south-1.amazonaws.com/trending-deals';

/**
 * Fetch trending deals from API
 */
async function fetchTrendingDeals() {
    try {
        const response = await fetch(TRENDING_DEALS_API_URL, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        displayTrendingDeals(data);
    } catch (error) {
        console.error('Error fetching trending deals:', error);
        showTrendingDealsError();
    }
}

/**
 * Display trending deals in carousel format
 */
function displayTrendingDeals(data) {
    // Get the carousel elements
    const slidesContainer = document.getElementById("trendingSlides");
    const indicatorsContainer = document.getElementById("trendingIndicators");

    // Clear existing content
    slidesContainer.innerHTML = "";
    indicatorsContainer.innerHTML = "";

    console.log('Displaying trending deals:', data);

    // Handle both API response formats: direct array or object with products property
    let products = [];
    if (Array.isArray(data)) {
        products = data;
    } else if (data && data.products && Array.isArray(data.products)) {
        products = data.products;
    }

    // Filter out any invalid products
    const validProducts = products.filter(product => product && (product.name || product.model || product.title));

    if (validProducts.length === 0) {
        slidesContainer.innerHTML = `
            <div class="no-results" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px 15px; width: 100%; font-size: 14px;">
                <i class="fas fa-search" style="font-size: 32px; color: #ccc; margin-bottom: 15px;"></i>
                <p style="font-size: 16px; margin-bottom: 15px; font-weight: bold;">No trending deals available.</p>
                <p style="color: #666; font-size: 13px;">Please check back later for the latest deals.</p>
            </div>
        `;
        return;
    }

    // Use 4 products per slide for all screen sizes to maintain consistency
    const productsPerSlide = 4;
    const maxProducts = 16; // Maximum products to display
    const carouselProducts = validProducts.slice(0, maxProducts);
    const totalSlides = Math.ceil(carouselProducts.length / productsPerSlide);

    // Create slides
    for (let slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
        const slide = document.createElement('div');
        slide.className = 'trending-slide';
        if (slideIndex === 0) slide.classList.add('active');

        // Get products for this slide
        const startIndex = slideIndex * productsPerSlide;
        const endIndex = Math.min(startIndex + productsPerSlide, carouselProducts.length);
        const slideProducts = carouselProducts.slice(startIndex, endIndex);

        // Create product cards for this slide
        slideProducts.forEach(product => {
            const productCard = createTrendingProductCard(product);
            slide.appendChild(productCard);
        });

        slidesContainer.appendChild(slide);

        // Create indicator
        const indicator = document.createElement('span');
        indicator.className = 'trending-indicator';
        if (slideIndex === 0) indicator.classList.add('active');
        indicator.setAttribute('aria-label', `Go to slide ${slideIndex + 1}`);
        indicatorsContainer.appendChild(indicator);
    }

    // Initialize carousel
    initializeTrendingCarousel(totalSlides);
}

/**
 * Initialize trending carousel with mobile optimizations
 */
function initializeTrendingCarousel(totalSlides) {
    const slidesContainer = document.getElementById('trendingSlides');
    const indicators = document.querySelectorAll('.trending-indicator');
    let currentIndex = 0;
    let interval;
    let isTransitioning = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let isScrolling = false;

    // Performance optimization: Use transform3d for hardware acceleration
    function showSlide(index, smooth = true) {
        if (isTransitioning) return;
        isTransitioning = true;

        const slides = slidesContainer.querySelectorAll('.trending-slide');
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });

        // Use transform3d for better performance
        slidesContainer.style.transform = `translate3d(-${index * 100}%, 0, 0)`;

        if (!smooth) {
            slidesContainer.style.transition = 'none';
            setTimeout(() => {
                slidesContainer.style.transition = '';
            }, 50);
        }

        currentIndex = index;

        // Reset transition flag after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, smooth ? 400 : 50);
    }

    function nextSlide() {
        const nextIndex = (currentIndex + 1) % totalSlides;
        showSlide(nextIndex);
    }

    function prevSlide() {
        const prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        showSlide(prevIndex);
    }

    function startCarousel() {
        stopCarousel();
        // Auto-advance every 25 seconds, but only if user is not actively interacting
        interval = setInterval(() => {
            if (!isTransitioning && !isScrolling) {
                nextSlide();
            }
        }, 25000);
    }

    function stopCarousel() {
        clearInterval(interval);
    }

    // Enhanced touch/swipe support for mobile
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isScrolling = false;
        stopCarousel();
    }

    function handleTouchMove(e) {
        if (!touchStartX || !touchStartY) return;

        const touchCurrentX = e.touches[0].clientX;
        const touchCurrentY = e.touches[0].clientY;
        const diffX = Math.abs(touchCurrentX - touchStartX);
        const diffY = Math.abs(touchCurrentY - touchStartY);

        // Determine if user is scrolling vertically (prevent horizontal swipe)
        if (diffY > diffX && diffY > 10) {
            isScrolling = true;
        }
    }

    function handleTouchEnd(e) {
        if (isScrolling) {
            startCarousel();
            return;
        }

        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;

        // Minimum swipe distance (50px) and not too slow
        if (Math.abs(diff) > 50 && !isTransitioning) {
            if (diff > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        }

        // Reset touch variables
        touchStartX = 0;
        touchStartY = 0;
        startCarousel();
    }

    // Add click handlers to indicators with haptic feedback simulation
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            stopCarousel();
            showSlide(index);
            startCarousel();

            // Simulate haptic feedback on mobile
            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
        });
    });

    // Touch event listeners with passive option for better performance
    slidesContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    slidesContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    slidesContainer.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Pause carousel on hover/focus for accessibility
    slidesContainer.addEventListener('mouseenter', stopCarousel);
    slidesContainer.addEventListener('mouseleave', startCarousel);

    // Keyboard navigation for accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
        }
    });

    // Handle visibility change (pause when tab is not active)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopCarousel();
        } else {
            startCarousel();
        }
    });

    // Initialize carousel
    showSlide(0, false);
    startCarousel();

    // Return cleanup function
    return function cleanup() {
        stopCarousel();
        slidesContainer.removeEventListener('touchstart', handleTouchStart);
        slidesContainer.removeEventListener('touchmove', handleTouchMove);
        slidesContainer.removeEventListener('touchend', handleTouchEnd);
        slidesContainer.removeEventListener('mouseenter', stopCarousel);
        slidesContainer.removeEventListener('mouseleave', startCarousel);
    };
}

/**
 * Create a trending product card (similar to smartphone card structure)
 */
function createTrendingProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-product-id", product.product_id || product.id || product.productId);

    // Get the lowest price from offers
    let lowestPrice = Infinity;
    let highestOriginalPrice = 0;

    if (product.offers && product.offers.length > 0) {
        product.offers.forEach(offer => {
            if (offer.price && offer.price < lowestPrice) {
                lowestPrice = offer.price;
            }
            if (offer.originalPrice && offer.originalPrice > highestOriginalPrice) {
                highestOriginalPrice = offer.originalPrice;
            }
        });
    }

    // If no valid price was found, set to null
    if (lowestPrice === Infinity) {
        lowestPrice = null;
    }

    // Format price with commas
    const formattedPrice = lowestPrice ? lowestPrice.toLocaleString('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) : 'Price not available';

    // Format image URL
    const imageUrl = product.imageUrl || product.image || product.img || '';

    // Extract RAM and storage from specs if available
    let ramText = '';
    let storageText = '';
    let osText = '';

    if (product.specs) {
        if (product.specs.Performance) {
            if (product.specs.Performance.Ram) {
                ramText = product.specs.Performance.Ram;
            }
            if (product.specs.Performance.Storage) {
                storageText = product.specs.Performance.Storage;
            }
        }
        if (product.specs.Os && product.specs.Os['Operating System']) {
            osText = product.specs.Os['Operating System'];
        }
    }

    // Format product name and brand
    const productName = product.model || product.product_id || product.id || 'Product';
    const brandName = product.brand || 'Unknown Brand';

    // Determine product URL based on category
    let productUrl = '#';
    const productId = product.product_id || product.id || '';
    if (product.category) {
        switch(product.category.toLowerCase()) {
            case 'smartphones':
                productUrl = `smartphones-info.html?id=${productId}`;
                break;
            case 'laptops':
                productUrl = `laptops-info.html?id=${productId}`;
                break;
            case 'tablets':
                productUrl = `tablets-info.html?id=${productId}`;
                break;
            case 'gaming consoles':
                productUrl = `gaming-info.html?id=${productId}`;
                break;
         
        }
    }

    card.innerHTML = `
        <a href="${productUrl}" class="product-link">
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${productName}" class="product-image" loading="lazy"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
            </div>
            <div class="product-details">
                <div class="product-brand">${brandName}</div>
                <h3 class="product-name">${productName}</h3>
                <div class="product-specs">
                    <span>${ramText} ${storageText}</span>
                    <span>${osText}</span>
                </div>
                <div class="product-price">
                    <span class="current-price">${formattedPrice}</span>
                    ${highestOriginalPrice > lowestPrice ? `<span class="original-price">R${highestOriginalPrice.toLocaleString()}</span>` : ''}
                </div>
                <div class="product-retailers">
                    <span>${product.offers ? product.offers.length : 0} retailers</span>
                </div>
            </div>
        </a>
        <div class="product-buttons">
            <button class="compare-button" data-product-id="${productId}">Compare</button>
            <button class="wishlist-button" data-product-id="${productId}">Add to Wishlist</button>
        </div>
    `;

    // Add event listener for compare button
    const compareButton = card.querySelector('.compare-button');
    compareButton.addEventListener('click', function () {
        window.location.href = productUrl;
    });

    // Add event listener for wishlist button
    const wishlistButton = card.querySelector('.wishlist-button');
    wishlistButton.addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Only call wishlist.js functions if loaded
        if (typeof addToWishlist === 'function' && typeof removeFromWishlist === 'function') {
            const productId = this.getAttribute('data-product-id');
            // Check if product is in wishlist by comparing with wishlistItems
            const isCurrentlyInWishlist = wishlistItems && wishlistItems.some(item => item.id === productId);

            // Show loading indicator
            this.classList.add('wishlist-loading');
            const originalText = this.innerHTML;
            this.innerHTML = '<div class="wishlist-spinner"></div>';

            try {
                if (isCurrentlyInWishlist) {
                    await removeFromWishlist(productId);
                } else {
                    const wishlistItem = {
                        id: productId,
                        name: `${product.brand || ''} ${product.model || product.product_id || product.id || product.productId}`.trim(),
                        price: getLowestPrice(product),
                        image: product.imageUrl || product.image || product.img || '',
                        url: productUrl
                    };

                    const result = await addToWishlist(wishlistItem);
                }
            } catch (error) {
                console.error('Error updating wishlist:', error);
                // Use a notification function from your main app if available
                if (typeof showNotification === 'function') {
                    showNotification('Wishlist Error', 'There was a problem updating your wishlist. Please try again.', 'error');
                }
            } finally {
                // Hide loading indicator
                this.classList.remove('wishlist-loading');
                this.innerHTML = originalText;
            }
        }
    });

    return card;
}

/**
 * Show error state for trending deals
 */
function showTrendingDealsError() {
    const slidesContainer = document.getElementById('trendingSlides');
    if (!slidesContainer) return;

    slidesContainer.innerHTML = `
        <div class="error-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 0; width: 100%;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
            <h3 style="color: #333; margin-bottom: 10px;">Failed to load trending deals</h3>
            <p style="color: #666; margin-bottom: 20px;">Please try again later</p>
            <button onclick="fetchTrendingDeals()" class="retry-btn" style="padding: 10px 20px; background: #ff0000; color: white; border: none; border-radius: 5px; cursor: pointer;">Retry</button>
        </div>
    `;
}

// Make trending deals functions globally available
window.fetchTrendingDeals = fetchTrendingDeals;
window.displayTrendingDeals = displayTrendingDeals;
window.createTrendingDealCard = createTrendingProductCard;
window.showTrendingDealsError = showTrendingDealsError;

/**
 * GAMING SECTION
 * Functions to display all gaming products in one unified container
 */

// API URLs for gaming products (from gaming.js)
const GAMING_API_URLS = {
    'gaming-console': 'https://xf9zlapr5e.execute-api.af-south-1.amazonaws.com/console-gaming',
    'gaming-laptops': 'https://xf9zlapr5e.execute-api.af-south-1.amazonaws.com/laptop-gaming',
    'gaming-monitor': 'https://xf9zlapr5e.execute-api.af-south-1.amazonaws.com/gaming-monitors'
};

/**
 * Create a gaming product card element
 * @param {Object} product - The product data
 * @param {string} category - The gaming category
 * @returns {HTMLElement} - The product card element
 */
function createGamingProductCard(product, category) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-product-id", product.product_id || product.id || product.productId);

    // Get the lowest price from offers
    let lowestPrice = Infinity;
    let highestOriginalPrice = 0;

    if (product.offers && product.offers.length > 0) {
        product.offers.forEach(offer => {
            if (offer.price && offer.price < lowestPrice) {
                lowestPrice = offer.price;
            }
            if (offer.originalPrice && offer.originalPrice > highestOriginalPrice) {
                highestOriginalPrice = offer.originalPrice;
            }
        });
    }

    // If no valid price was found, set to null
    if (lowestPrice === Infinity) {
        lowestPrice = null;
    }

    // Format price with commas
    const formattedPrice = lowestPrice ? lowestPrice.toLocaleString('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) : 'Price not available';

    // Format image URL
    const imageUrl = product.imageUrl || product.image || product.img || '';

    // Format product name
    const productName = product.model || (product.brand ? product.brand + ' ' + (product.product_id || product.id || product.productId) : 'Gaming Product');
    const specs = [];

    // Extract relevant specs based on category
    if (product.specs) {
        if (category === 'gaming-laptops' && product.specs.Performance) {
            if (product.specs.Performance.Processor) {
                specs.push(product.specs.Performance.Processor);
            }
            if (product.specs.Performance.Ram) {
                specs.push(product.specs.Performance.Ram);
            }
            if (product.specs.Performance.Storage) {
                specs.push(product.specs.Performance.Storage);
            }
        } else if (category === 'gaming-monitor' && product.specs.Display) {
            if (product.specs.Display.Size) {
                specs.push(product.specs.Display.Size);
            }
            if (product.specs.Display.Resolution) {
                specs.push(product.specs.Display.Resolution);
            }
        } else if (category === 'gaming-console' && product.specs.Storage) {
            if (product.specs.Storage.Capacity) {
                specs.push(product.specs.Storage.Capacity);
            }
        }
    }

    card.innerHTML = `
        <a href="gaming-info.html?id=${product.product_id || product.id || product.productId}" class="product-link">
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${productName}" class="product-image" loading="lazy"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
            </div>
            <div class="product-details">
                <div class="product-brand">${product.brand || 'Unknown Brand'}</div>
                <h3 class="product-name">${productName}</h3>
                ${specs.length > 0 ? `<div class="product-specs"><span>${specs.join(' • ')}</span></div>` : ''}
                <div class="product-price">
                    <span class="current-price">${formattedPrice}</span>
                    ${highestOriginalPrice > lowestPrice ? `<span class="original-price">R${highestOriginalPrice.toLocaleString()}</span>` : ''}
                </div>
                <div class="product-retailers">
                    <span>${product.offers ? product.offers.length : 0} retailers</span>
                </div>
            </div>
        </a>
        <div class="product-buttons">
            <button class="compare-button" data-product-id="${product.product_id || product.id || product.productId}">Compare</button>
            <button class="wishlist-button" data-product-id="${product.product_id || product.id || product.productId}">Add to Wishlist</button>
        </div>
    `;

    // Add event listener for compare button
    const compareButton = card.querySelector('.compare-button');
    compareButton.addEventListener('click', function () {
        window.location.href = `gaming-info.html?id=${product.product_id || product.id || product.productId}`;
    });

    // Add event listener for wishlist button
    const wishlistButton = card.querySelector('.wishlist-button');
    wishlistButton.addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Only call wishlist.js functions if loaded
        if (typeof addToWishlist === 'function' && typeof removeFromWishlist === 'function') {
            const productId = this.getAttribute('data-product-id');
            // Check if product is in wishlist by comparing with wishlistItems
            const isCurrentlyInWishlist = wishlistItems && wishlistItems.some(item => item.id === productId);

            // Show loading indicator
            this.classList.add('wishlist-loading');
            const originalText = this.innerHTML;
            this.innerHTML = '<div class="wishlist-spinner"></div>';

            try {
                if (isCurrentlyInWishlist) {
                    await removeFromWishlist(productId);
                } else {
                    const wishlistItem = {
                        id: productId,
                        name: `${product.brand || ''} ${product.model || product.product_id || product.id || product.productId}`.trim(),
                        price: getLowestPrice(product),
                        image: product.imageUrl || product.image || product.img || '',
                        url: `gaming-info.html?id=${product.product_id || product.id || product.productId}`
                    };

                    const result = await addToWishlist(wishlistItem);
                }
            } catch (error) {
                console.error('Error updating wishlist:', error);
                // Use a notification function from your main app if available
                if (typeof showNotification === 'function') {
                    showNotification('Wishlist Error', 'There was a problem updating your wishlist. Please try again.', 'error');
                }
            } finally {
                // Hide loading indicator
                this.classList.remove('wishlist-loading');
                this.innerHTML = originalText;
            }
        }
    });

    return card;
}

/**
 * Display all gaming products in unified carousel format
 * @param {Array} allProducts - All gaming products from different categories
 */
function displayGamingProducts(allProducts) {
    // Get the carousel elements
    const slidesContainer = document.getElementById('gamingSlides');
    const indicatorsContainer = document.getElementById('gamingIndicators');

    // Clear existing content
    slidesContainer.innerHTML = "";
    indicatorsContainer.innerHTML = "";

    // Filter out any invalid products
    const validProducts = allProducts.filter(product => product && (product.name || product.model || product.title));

    if (validProducts.length === 0) {
        slidesContainer.innerHTML = `
            <div class="no-results" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px 15px; width: 100%; font-size: 14px;">
                <i class="fas fa-search" style="font-size: 32px; color: #ccc; margin-bottom: 15px;"></i>
                <p style="font-size: 16px; margin-bottom: 15px; font-weight: bold;">No gaming deals available.</p>
                <p style="color: #666; font-size: 13px;">Please check back later for the latest deals.</p>
            </div>
        `;
        return;
    }

    // Use 4 products per slide for all screen sizes to maintain consistency
    const productsPerSlide = 4;
    const totalSlides = 4; // Fixed 4 slides for all devices

    // Take products for carousel
    const maxProducts = totalSlides * productsPerSlide;
    const carouselProducts = validProducts.slice(0, maxProducts);

    // Create slides
    for (let slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
        const slide = document.createElement('div');
        slide.className = 'gaming-slide';
        if (slideIndex === 0) slide.classList.add('active');

        // Get products for this slide
        const startIndex = slideIndex * productsPerSlide;
        const endIndex = Math.min(startIndex + productsPerSlide, carouselProducts.length);
        const slideProducts = carouselProducts.slice(startIndex, endIndex);

        // Create product cards for this slide
        slideProducts.forEach(product => {
            const productCard = createGamingProductCard(product, product.category || 'gaming');
            slide.appendChild(productCard);
        });

        slidesContainer.appendChild(slide);

        // Create indicator
        const indicator = document.createElement('span');
        indicator.className = 'gaming-indicator';
        if (slideIndex === 0) indicator.classList.add('active');
        indicator.setAttribute('aria-label', `Go to slide ${slideIndex + 1}`);
        indicatorsContainer.appendChild(indicator);
    }

    // Initialize carousel
    initializeGamingCarousel();
}

/**
 * Fetch all gaming data from all APIs
 * @returns {Promise<Array>} - All gaming products data
 */
async function fetchAllGamingData() {
    const allProducts = [];
    
    try {
        // Fetch from all gaming APIs in parallel
        const promises = Object.entries(GAMING_API_URLS).map(async ([category, apiUrl]) => {
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Handle different response formats
                let products = [];
                if (Array.isArray(data)) {
                    products = data;
                } else if (data.products || data.items) {
                    products = data.products || data.items;
                } else if (data.data) {
                    products = Array.isArray(data.data) ? data.data : [data.data];
                }

                // Add category information to each product
                return products.map(product => ({
                    ...product,
                    category: category
                }));
            } catch (error) {
                console.error(`Error fetching ${category} data:`, error);
                return [];
            }
        });

        // Wait for all API calls to complete
        const results = await Promise.all(promises);
        
        // Flatten and combine all products
        results.forEach(products => {
            allProducts.push(...products);
        });

        // Shuffle the products to mix different categories
        return allProducts.sort(() => Math.random() - 0.5);
        
    } catch (error) {
        console.error('Error fetching gaming data:', error);
        return [];
    }
}

/**
 * Initialize gaming carousel with mobile optimizations
 */
function initializeGamingCarousel() {
    const slidesContainer = document.getElementById('gamingSlides');
    const indicators = document.querySelectorAll('.gaming-indicator');
    let currentIndex = 0;
    let interval;
    let isTransitioning = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let isScrolling = false;

    // Performance optimization: Use transform3d for hardware acceleration
    function showSlide(index, smooth = true) {
        if (isTransitioning) return;
        isTransitioning = true;

        const slides = slidesContainer.querySelectorAll('.gaming-slide');
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });

        // Use transform3d for better performance
        slidesContainer.style.transform = `translate3d(-${index * 100}%, 0, 0)`;

        if (!smooth) {
            slidesContainer.style.transition = 'none';
            setTimeout(() => {
                slidesContainer.style.transition = '';
            }, 50);
        }

        currentIndex = index;

        // Reset transition flag after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, smooth ? 400 : 50);
    }

    function nextSlide() {
        const nextIndex = (currentIndex + 1) % 4;
        showSlide(nextIndex);
    }

    function prevSlide() {
        const prevIndex = (currentIndex - 1 + 4) % 4;
        showSlide(prevIndex);
    }

    function startCarousel() {
        stopCarousel();
        // Auto-advance every 25 seconds, but only if user is not actively interacting
        interval = setInterval(() => {
            if (!isTransitioning && !isScrolling) {
                nextSlide();
            }
        }, 25000);
    }

    function stopCarousel() {
        clearInterval(interval);
    }

    // Enhanced touch/swipe support for mobile
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isScrolling = false;
        stopCarousel();
    }

    function handleTouchMove(e) {
        if (!touchStartX || !touchStartY) return;

        const touchCurrentX = e.touches[0].clientX;
        const touchCurrentY = e.touches[0].clientY;
        const diffX = Math.abs(touchCurrentX - touchStartX);
        const diffY = Math.abs(touchCurrentY - touchStartY);

        // Determine if user is scrolling vertically (prevent horizontal swipe)
        if (diffY > diffX && diffY > 10) {
            isScrolling = true;
        }
    }

    function handleTouchEnd(e) {
        if (isScrolling) {
            startCarousel();
            return;
        }

        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;

        // Minimum swipe distance (50px) and not too slow
        if (Math.abs(diff) > 50 && !isTransitioning) {
            if (diff > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        }

        // Reset touch variables
        touchStartX = 0;
        touchStartY = 0;
        startCarousel();
    }

    // Add click handlers to indicators with haptic feedback simulation
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            stopCarousel();
            showSlide(index);
            startCarousel();

            // Simulate haptic feedback on mobile
            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
        });
    });

    // Touch event listeners with passive option for better performance
    slidesContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    slidesContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    slidesContainer.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Pause carousel on hover/focus for accessibility
    slidesContainer.addEventListener('mouseenter', stopCarousel);
    slidesContainer.addEventListener('mouseleave', startCarousel);

    // Handle visibility change (pause when tab is not active)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopCarousel();
        } else {
            startCarousel();
        }
    });

    // Initialize carousel
    showSlide(0, false);
    startCarousel();

    // Return cleanup function
    return function cleanup() {
        stopCarousel();
        slidesContainer.removeEventListener('touchstart', handleTouchStart);
        slidesContainer.removeEventListener('touchmove', handleTouchMove);
        slidesContainer.removeEventListener('touchend', handleTouchEnd);
        slidesContainer.removeEventListener('mouseenter', stopCarousel);
        slidesContainer.removeEventListener('mouseleave', startCarousel);
    };
}

/**
 * Initialize unified gaming deals section
 */
async function initializeGamingDeals() {
    try {
        // Show loading state
        const slidesContainer = document.getElementById('gamingSlides');
        if (slidesContainer) {
            slidesContainer.innerHTML = `
                <div class="loading-indicator" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 0; width: 100%;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #ff0000; margin-bottom: 1rem;"></i>
                    <p>Loading gaming deals...</p>
                </div>
            `;
        }

        // Fetch all gaming data
        const allGamingProducts = await fetchAllGamingData();

        // Store products globally
        window.currentGamingProducts = allGamingProducts;

        // Display products in carousel format
        displayGamingProducts(allGamingProducts);

    } catch (error) {
        console.error('Error initializing gaming deals:', error);

        // Show error state
        const slidesContainer = document.getElementById('gamingSlides');
        if (slidesContainer) {
            slidesContainer.innerHTML = `
                <div class="error-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 0; width: 100%;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
                    <h3 style="color: #333; margin-bottom: 10px;">Failed to load gaming deals</h3>
                    <p style="color: #666; margin-bottom: 20px;">${error.message}</p>
                    <button onclick="initializeGamingDeals()" class="retry-btn" style="padding: 10px 20px; background: #ff0000; color: white; border: none; border-radius: 5px; cursor: pointer;">Retry</button>
                </div>
            `;
        }
    }
}

// Initialize gaming deals when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize unified gaming deals section
    initializeGamingDeals();
});

// Make gaming functions globally available
window.initializeGamingDeals = initializeGamingDeals;
window.displayGamingProducts = displayGamingProducts;
window.createGamingProductCard = createGamingProductCard;

/**
 * LAPTOPS SECTION
 * Functions to display all laptop products in one unified container
 */

// API URLs for laptop products (from laptops.js)
const LAPTOPS_API_URLS = {
    'chromebooks-laptops': 'https://xf9zlapr5e.execute-api.af-south-1.amazonaws.com/chromebooks-laptops',
    'windows-laptops': 'https://xf9zlapr5e.execute-api.af-south-1.amazonaws.com/windows-laptops',
    'macbooks-laptops': 'https://xf9zlapr5e.execute-api.af-south-1.amazonaws.com/macbooks-laptops'
};

/**
 * Create a laptop product card element
 * @param {Object} product - The product data
 * @param {string} category - The laptop category
 * @returns {HTMLElement} - The product card element
 */
function createLaptopProductCard(product, category) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-product-id", product.product_id || product.id || product.productId);

    // Get the lowest price from offers
    let lowestPrice = Infinity;
    let highestOriginalPrice = 0;

    if (product.offers && product.offers.length > 0) {
        product.offers.forEach(offer => {
            if (offer.price && offer.price < lowestPrice) {
                lowestPrice = offer.price;
            }
            if (offer.originalPrice && offer.originalPrice > highestOriginalPrice) {
                highestOriginalPrice = offer.originalPrice;
            }
        });
    }

    // If no valid price was found, set to null
    if (lowestPrice === Infinity) {
        lowestPrice = null;
    }

    // Format price with commas
    const formattedPrice = lowestPrice ? lowestPrice.toLocaleString('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) : 'Price not available';

    // Format image URL
    const imageUrl = product.imageUrl || product.image || product.img || '';

    // Format product name
    const productName = product.model || (product.brand ? product.brand + ' ' + (product.product_id || product.id || product.productId) : 'Laptop');
    const specs = [];

    // Extract relevant specs based on category
    if (product.specs) {
        if (product.specs.Performance) {
            if (product.specs.Performance.Ram) {
                specs.push(product.specs.Performance.Ram);
            }
            if (product.specs.Performance.Storage) {
                specs.push(product.specs.Performance.Storage);
            }
            if (product.specs.Performance.Processor) {
                specs.push(product.specs.Performance.Processor);
            }
        }
        if (product.specs.Os && product.specs.Os['Operating System']) {
            specs.push(product.specs.Os['Operating System']);
        }
    }

    // Set default OS based on category if not available
    if (specs.length === 0 || !specs.some(spec => spec.includes('OS') || spec.includes('Windows') || spec.includes('macOS') || spec.includes('Chrome'))) {
        switch (category) {
            case 'chromebooks-laptops':
                specs.push('Chrome OS');
                break;
            case 'windows-laptops':
                specs.push('Windows 11');
                break;
            case 'macbooks-laptops':
                specs.push('macOS');
                break;
        }
    }

    card.innerHTML = `
        <a href="laptops-info.html?id=${product.product_id || product.id || product.productId}" class="product-link">
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${productName}" class="product-image" loading="lazy"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
            </div>
            <div class="product-details">
                <div class="product-brand">${product.brand || (category === 'macbooks-laptops' ? 'Apple' : 'Unknown Brand')}</div>
                <h3 class="product-name">${productName}</h3>
                ${specs.length > 0 ? `<div class="product-specs"><span>${specs.join(' • ')}</span></div>` : ''}
                <div class="product-price">
                    <span class="current-price">${formattedPrice}</span>
                    ${highestOriginalPrice > lowestPrice ? `<span class="original-price">R${highestOriginalPrice.toLocaleString()}</span>` : ''}
                </div>
                <div class="product-retailers">
                    <span>${product.offers ? product.offers.length : 0} retailers</span>
                </div>
            </div>
        </a>
        <div class="product-buttons">
            <button class="compare-button" data-product-id="${product.product_id || product.id || product.productId}">Compare</button>
            <button class="wishlist-button" data-product-id="${product.product_id || product.id || product.productId}">Add to Wishlist</button>
        </div>
    `;

    // Add event listener for compare button
    const compareButton = card.querySelector('.compare-button');
    compareButton.addEventListener('click', function () {
        window.location.href = `laptops-info.html?id=${product.product_id || product.id || product.productId}`;
    });

    // Add event listener for wishlist button
    const wishlistButton = card.querySelector('.wishlist-button');
    wishlistButton.addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Only call wishlist.js functions if loaded
        if (typeof addToWishlist === 'function' && typeof removeFromWishlist === 'function') {
            const productId = this.getAttribute('data-product-id');
            // Check if product is in wishlist by comparing with wishlistItems
            const isCurrentlyInWishlist = wishlistItems && wishlistItems.some(item => item.id === productId);

            // Show loading indicator
            this.classList.add('wishlist-loading');
            const originalText = this.innerHTML;
            this.innerHTML = '<div class="wishlist-spinner"></div>';

            try {
                if (isCurrentlyInWishlist) {
                    await removeFromWishlist(productId);
                } else {
                    const wishlistItem = {
                        id: productId,
                        name: `${product.brand || ''} ${product.model || product.product_id || product.id || product.productId}`.trim(),
                        price: getLowestPrice(product),
                        image: product.imageUrl || product.image || product.img || '',
                        url: `laptops-info.html?id=${product.product_id || product.id || product.productId}`
                    };

                    const result = await addToWishlist(wishlistItem);
                }
            } catch (error) {
                console.error('Error updating wishlist:', error);
                // Use a notification function from your main app if available
                if (typeof showNotification === 'function') {
                    showNotification('Wishlist Error', 'There was a problem updating your wishlist. Please try again.', 'error');
                }
            } finally {
                // Hide loading indicator
                this.classList.remove('wishlist-loading');
                this.innerHTML = originalText;
            }
        }
    });

    return card;
}

/**
 * Display all laptop products in unified carousel format
 * @param {Array} allProducts - All laptop products from different categories
 */
function displayLaptopProducts(allProducts) {
    // Get the carousel elements
    const slidesContainer = document.getElementById('laptopsSlides');
    const indicatorsContainer = document.getElementById('laptopsIndicators');

    // Clear existing content
    slidesContainer.innerHTML = "";
    indicatorsContainer.innerHTML = "";

    // Filter out any invalid products
    const validProducts = allProducts.filter(product => product && (product.name || product.model || product.title));

    if (validProducts.length === 0) {
        slidesContainer.innerHTML = `
            <div class="no-results" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px 15px; width: 100%; font-size: 14px;">
                <i class="fas fa-search" style="font-size: 32px; color: #ccc; margin-bottom: 15px;"></i>
                <p style="font-size: 16px; margin-bottom: 15px; font-weight: bold;">No laptop deals available.</p>
                <p style="color: #666; font-size: 13px;">Please check back later for the latest deals.</p>
            </div>
        `;
        return;
    }

    // Use 4 products per slide for all screen sizes to maintain consistency
    const productsPerSlide = 4;
    const totalSlides = 4; // Fixed 4 slides for all devices

    // Take products for carousel
    const maxProducts = totalSlides * productsPerSlide;
    const carouselProducts = validProducts.slice(0, maxProducts);

    // Create slides
    for (let slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
        const slide = document.createElement('div');
        slide.className = 'laptops-slide';
        if (slideIndex === 0) slide.classList.add('active');

        // Get products for this slide
        const startIndex = slideIndex * productsPerSlide;
        const endIndex = Math.min(startIndex + productsPerSlide, carouselProducts.length);
        const slideProducts = carouselProducts.slice(startIndex, endIndex);

        // Create product cards for this slide
        slideProducts.forEach(product => {
            const productCard = createLaptopProductCard(product, product.category || 'laptop');
            slide.appendChild(productCard);
        });

        slidesContainer.appendChild(slide);

        // Create indicator
        const indicator = document.createElement('span');
        indicator.className = 'laptops-indicator';
        if (slideIndex === 0) indicator.classList.add('active');
        indicator.setAttribute('aria-label', `Go to slide ${slideIndex + 1}`);
        indicatorsContainer.appendChild(indicator);
    }

    // Initialize carousel
    initializeLaptopsCarousel();
}

/**
 * Fetch all laptop data from all APIs
 * @returns {Promise<Array>} - All laptop products data
 */
async function fetchAllLaptopData() {
    const allProducts = [];
    
    try {
        // Fetch from all laptop APIs in parallel
        const promises = Object.entries(LAPTOPS_API_URLS).map(async ([category, apiUrl]) => {
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Handle different response formats
                let products = [];
                if (Array.isArray(data)) {
                    products = data;
                } else if (data.products || data.items) {
                    products = data.products || data.items;
                } else if (data.data) {
                    products = Array.isArray(data.data) ? data.data : [data.data];
                }

                // Add category information to each product
                return products.map(product => ({
                    ...product,
                    category: category
                }));
            } catch (error) {
                console.error(`Error fetching ${category} data:`, error);
                return [];
            }
        });

        // Wait for all API calls to complete
        const results = await Promise.all(promises);
        
        // Flatten and combine all products
        results.forEach(products => {
            allProducts.push(...products);
        });

        // Shuffle the products to mix different categories
        return allProducts.sort(() => Math.random() - 0.5);
        
    } catch (error) {
        console.error('Error fetching laptop data:', error);
        return [];
    }
}

/**
 * Initialize laptops carousel with mobile optimizations
 */
function initializeLaptopsCarousel() {
    const slidesContainer = document.getElementById('laptopsSlides');
    const indicators = document.querySelectorAll('.laptops-indicator');
    let currentIndex = 0;
    let interval;
    let isTransitioning = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let isScrolling = false;

    // Performance optimization: Use transform3d for hardware acceleration
    function showSlide(index, smooth = true) {
        if (isTransitioning) return;
        isTransitioning = true;

        const slides = slidesContainer.querySelectorAll('.laptops-slide');
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });

        // Use transform3d for better performance
        slidesContainer.style.transform = `translate3d(-${index * 100}%, 0, 0)`;

        if (!smooth) {
            slidesContainer.style.transition = 'none';
            setTimeout(() => {
                slidesContainer.style.transition = '';
            }, 50);
        }

        currentIndex = index;

        // Reset transition flag after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, smooth ? 400 : 50);
    }

    function nextSlide() {
        const nextIndex = (currentIndex + 1) % 4;
        showSlide(nextIndex);
    }

    function prevSlide() {
        const prevIndex = (currentIndex - 1 + 4) % 4;
        showSlide(prevIndex);
    }

    function startCarousel() {
        stopCarousel();
        // Auto-advance every 25 seconds, but only if user is not actively interacting
        interval = setInterval(() => {
            if (!isTransitioning && !isScrolling) {
                nextSlide();
            }
        }, 25000);
    }

    function stopCarousel() {
        clearInterval(interval);
    }

    // Enhanced touch/swipe support for mobile
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isScrolling = false;
        stopCarousel();
    }

    function handleTouchMove(e) {
        if (!touchStartX || !touchStartY) return;

        const touchCurrentX = e.touches[0].clientX;
        const touchCurrentY = e.touches[0].clientY;
        const diffX = Math.abs(touchCurrentX - touchStartX);
        const diffY = Math.abs(touchCurrentY - touchStartY);

        // Determine if user is scrolling vertically (prevent horizontal swipe)
        if (diffY > diffX && diffY > 10) {
            isScrolling = true;
        }
    }

    function handleTouchEnd(e) {
        if (isScrolling) {
            startCarousel();
            return;
        }

        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;

        // Minimum swipe distance (50px) and not too slow
        if (Math.abs(diff) > 50 && !isTransitioning) {
            if (diff > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        }

        // Reset touch variables
        touchStartX = 0;
        touchStartY = 0;
        startCarousel();
    }

    // Add click handlers to indicators with haptic feedback simulation
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            stopCarousel();
            showSlide(index);
            startCarousel();

            // Simulate haptic feedback on mobile
            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
        });
    });

    // Touch event listeners with passive option for better performance
    slidesContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    slidesContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    slidesContainer.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Pause carousel on hover/focus for accessibility
    slidesContainer.addEventListener('mouseenter', stopCarousel);
    slidesContainer.addEventListener('mouseleave', startCarousel);

    // Handle visibility change (pause when tab is not active)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopCarousel();
        } else {
            startCarousel();
        }
    });

    // Initialize carousel
    showSlide(0, false);
    startCarousel();

    // Return cleanup function
    return function cleanup() {
        stopCarousel();
        slidesContainer.removeEventListener('touchstart', handleTouchStart);
        slidesContainer.removeEventListener('touchmove', handleTouchMove);
        slidesContainer.removeEventListener('touchend', handleTouchEnd);
        slidesContainer.removeEventListener('mouseenter', stopCarousel);
        slidesContainer.removeEventListener('mouseleave', startCarousel);
    };
}

/**
 * Initialize unified laptops deals section
 */
async function initializeLaptopsDeals() {
    try {
        // Show loading state
        const slidesContainer = document.getElementById('laptopsSlides');
        if (slidesContainer) {
            slidesContainer.innerHTML = `
                <div class="loading-indicator" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 0; width: 100%;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #ff0000; margin-bottom: 1rem;"></i>
                    <p>Loading laptop deals...</p>
                </div>
            `;
        }

        // Fetch all laptop data
        const allLaptopProducts = await fetchAllLaptopData();

        // Store products globally
        window.currentLaptopProducts = allLaptopProducts;

        // Display products in carousel format
        displayLaptopProducts(allLaptopProducts);

    } catch (error) {
        console.error('Error initializing laptops deals:', error);

        // Show error state
        const slidesContainer = document.getElementById('laptopsSlides');
        if (slidesContainer) {
            slidesContainer.innerHTML = `
                <div class="error-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 0; width: 100%;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
                    <h3 style="color: #333; margin-bottom: 10px;">Failed to load laptop deals</h3>
                    <p style="color: #666; margin-bottom: 20px;">${error.message}</p>
                    <button onclick="initializeLaptopsDeals()" class="retry-btn" style="padding: 10px 20px; background: #ff0000; color: white; border: none; border-radius: 5px; cursor: pointer;">Retry</button>
                </div>
            `;
        }
    }
}

// Initialize laptops deals when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize unified laptops deals section
    initializeLaptopsDeals();
});

// Make laptops functions globally available
window.initializeLaptopsDeals = initializeLaptopsDeals;
window.displayLaptopProducts = displayLaptopProducts;
window.createLaptopProductCard = createLaptopProductCard;

// Mobile Sidebar Functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileToggleBtn = document.getElementById('mobileToggleBtn');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarClose = document.getElementById('sidebarClose');

    // Open sidebar when hamburger menu is clicked
    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', function() {
            mobileSidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    }

    // Close sidebar when close button is clicked
    if (sidebarClose) {
        sidebarClose.addEventListener('click', function() {
            closeSidebar();
        });
    }

    // Close sidebar when overlay is clicked
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            closeSidebar();
        });
    }

    // Close sidebar when clicking on regular sidebar items and submenu links
    const regularSidebarItems = document.querySelectorAll('.sidebar-item:not(.submenu-item), .submenu .item a');
    regularSidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            closeSidebar();
        });
    });

    // Function to close sidebar
    function closeSidebar() {
        mobileSidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Close sidebar on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileSidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
});

// Toggle submenu function (matching demo implementation)
function toggleSubmenu(element) {
    const item = element.parentElement; // .item
    const submenu = item.querySelector(':scope > .submenu'); // direct child submenu
    const isActive = item.classList.contains('active');

    // Close all sibling submenus at the same level
    const siblings = item.parentElement.querySelectorAll(':scope > .item');
    siblings.forEach(sibling => {
        if (sibling !== item) sibling.classList.remove('active');
        // Also close any nested submenus within siblings
        sibling.querySelectorAll('.item.active').forEach(nested => nested.classList.remove('active'));
    });

    // Toggle current item
    if (!isActive) {
        item.classList.add('active');
        // Optionally animate submenu items
        if (submenu) {
            const submenuItems = submenu.querySelectorAll(':scope > .item');
            submenuItems.forEach((submenuItem, index) => {
                submenuItem.classList.remove('slide-in'); // reset
                setTimeout(() => {
                    submenuItem.classList.add('slide-in');
                }, index * 50);
            });
        }
    } else {
        item.classList.remove('active');
        // Also close any nested submenus when collapsing
        if (submenu) {
            submenu.querySelectorAll('.item.active').forEach(nested => nested.classList.remove('active'));
        }
    }
}

// Make toggleSubmenu globally available
window.toggleSubmenu = toggleSubmenu;

// Login Modal Functionality - Based on demo
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.querySelector('.login-btn');
    const loginModal = document.getElementById('loginModal');
    const loginModalClose = document.getElementById('loginModalClose');
    const loginForm = document.getElementById('loginModalForm');
    const passwordToggle = document.getElementById('loginModalPasswordToggle');
    const passwordInput = document.getElementById('loginModalPassword');
    const loginBtnElement = document.getElementById('loginModalBtn');
    const loginBtnText = document.getElementById('loginModalBtnText');
    const loginSpinner = document.getElementById('loginModalSpinner');

    // Open login modal when login button is clicked
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close login modal when close button is clicked
    if (loginModalClose) {
        loginModalClose.addEventListener('click', function() {
            loginModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close login modal when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Password toggle functionality
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = passwordToggle.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginModalEmail').value;
            const password = document.getElementById('loginModalPassword').value;

            // Basic validation
            if (!email || !password) {
                showAlert('Please fill in all fields', 'error');
                return;
            }

            // Show loading state
            loginBtnElement.disabled = true;
            loginBtnText.style.display = 'none';
            loginSpinner.style.display = 'block';

            // Simulate login process
            setTimeout(() => {
                console.log('Login attempt:', { email, password });
                
                // Simulate success
                showAlert('Login successful!', 'success');
                
                // Close modal after successful login
                setTimeout(() => {
                    loginModal.classList.remove('active');
                    document.body.style.overflow = '';
                    loginForm.reset();
                    
                    // Reset button state
                    loginBtnElement.disabled = false;
                    loginBtnText.style.display = 'block';
                    loginSpinner.style.display = 'none';
                }, 1500);
                
            }, 2000);
        });
    }

    // Show alert function
    function showAlert(message, type) {
        const alertContainer = document.getElementById('loginAlertContainer');
        if (alertContainer) {
            alertContainer.innerHTML = `
                <div class="alert alert-${type}">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                alertContainer.innerHTML = '';
            }, 3000);
        }
    }

    // Register Modal Functionality
    const registerModal = document.getElementById('registerModal');
    const registerModalClose = document.getElementById('registerModalClose');
    const registerForm = document.getElementById('registerModalForm');
    const registerBtn = document.getElementById('registerModalBtn');
    const registerBtnText = document.getElementById('registerModalBtnText');
    const registerSpinner = document.getElementById('registerModalSpinner');
    const registerLoginLink = document.getElementById('registerModalLoginLink');

    // Open register modal when register link is clicked
    const loginRegisterLink = document.getElementById('loginModalRegisterLink');
    if (loginRegisterLink) {
        loginRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.classList.remove('active');
            registerModal.classList.add('active');
        });
    }

    // Close register modal when close button is clicked
    if (registerModalClose) {
        registerModalClose.addEventListener('click', function() {
            registerModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close register modal when clicking outside
    if (registerModal) {
        registerModal.addEventListener('click', function(e) {
            if (e.target === registerModal) {
                registerModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Switch to login modal
    if (registerLoginLink) {
        registerLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            registerModal.classList.remove('active');
            loginModal.classList.add('active');
        });
    }

    // Handle register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('registerFirstname').value;
            const lastName = document.getElementById('registerLastname').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            const terms = document.getElementById('registerTerms').checked;

            // Basic validation
            if (!firstName || !lastName || !email || !password || !confirmPassword) {
                showRegisterAlert('Please fill in all fields', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showRegisterAlert('Passwords do not match', 'error');
                return;
            }

            if (!terms) {
                showRegisterAlert('Please accept the terms and conditions', 'error');
                return;
            }

            // Show loading state
            registerBtn.disabled = true;
            registerBtnText.style.display = 'none';
            registerSpinner.style.display = 'block';

            // Simulate registration process
            setTimeout(() => {
                console.log('Registration attempt:', { firstName, lastName, email, password });
                
                // Simulate success
                showRegisterAlert('Account created successfully!', 'success');
                
                // Close modal after successful registration
                setTimeout(() => {
                    registerModal.classList.remove('active');
                    document.body.style.overflow = '';
                    registerForm.reset();
                    
                    // Reset button state
                    registerBtn.disabled = false;
                    registerBtnText.style.display = 'block';
                    registerSpinner.style.display = 'none';
                }, 1500);
                
            }, 2000);
        });
    }

    // Show register alert function
    function showRegisterAlert(message, type) {
        const alertContainer = document.getElementById('registerAlertContainer');
        if (alertContainer) {
            alertContainer.innerHTML = `
                <div class="alert alert-${type}">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                alertContainer.innerHTML = '';
            }, 3000);
        }
    }

    // Forgot Password Modal Functionality
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const forgotPasswordBtnText = document.getElementById('forgotPasswordBtnText');
    const forgotPasswordSpinner = document.getElementById('forgotPasswordSpinner');

    // Open forgot password modal when link is clicked
    const loginForgotPasswordLink = document.getElementById('loginModalForgotPassword');
    if (loginForgotPasswordLink) {
        loginForgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.classList.remove('active');
            forgotPasswordModal.classList.add('active');
        });
    }

    // Close forgot password modal when clicking outside
    if (forgotPasswordModal) {
        forgotPasswordModal.addEventListener('click', function(e) {
            if (e.target === forgotPasswordModal) {
                forgotPasswordModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Handle forgot password form submission
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('forgotPasswordEmail').value;

            // Basic validation
            if (!email) {
                showForgotPasswordAlert('Please enter your email address', 'error');
                return;
            }

            // Show loading state
            forgotPasswordBtn.disabled = true;
            forgotPasswordBtnText.style.display = 'none';
            forgotPasswordSpinner.style.display = 'block';

            // Simulate password reset process
            setTimeout(() => {
                console.log('Password reset attempt:', { email });
                
                // Simulate success
                showForgotPasswordAlert('Password reset code sent to your email!', 'success');
                
                // Close modal after successful submission
                setTimeout(() => {
                    forgotPasswordModal.classList.remove('active');
                    document.body.style.overflow = '';
                    forgotPasswordForm.reset();
                    
                    // Reset button state
                    forgotPasswordBtn.disabled = false;
                    forgotPasswordBtnText.style.display = 'block';
                    forgotPasswordSpinner.style.display = 'none';
                }, 1500);
                
            }, 2000);
        });
    }

    // Show forgot password alert function
    function showForgotPasswordAlert(message, type) {
        const alertContainer = document.getElementById('forgotPasswordAlert');
        if (alertContainer) {
            alertContainer.innerHTML = `
                <div class="alert alert-${type}">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            alertContainer.style.display = 'block';
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                alertContainer.innerHTML = '';
                alertContainer.style.display = 'none';
            }, 3000);
        }
    }

    // Global functions for onclick handlers
    window.closeForgotPasswordModal = function() {
        forgotPasswordModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    window.showLoginModal = function() {
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.toggleRegisterPassword = function(inputId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(inputId + '-eye');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    };
});