// Search suggestions functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const suggestionsGrid = document.getElementById('suggestionsGrid');
    const searchQueryDisplay = document.getElementById('searchQuery');
    
    const SEARCH_API_URL = 'https://xf9zlapr5e.execute-api.af-south-1.amazonaws.com/search';
    const MIN_SEARCH_LENGTH = 2;
    let debounceTimer;
    
    // Mock search suggestions for demo
    const mockSuggestions = [
        { name: 'iPhone 15 Pro', title: 'iPhone 15 Pro' },
        { name: 'Samsung Galaxy S24', title: 'Samsung Galaxy S24' },
        { name: 'MacBook Pro M3', title: 'MacBook Pro M3' },
        { name: 'Dell XPS 13', title: 'Dell XPS 13' },
        { name: 'iPad Air', title: 'iPad Air' },
        { name: 'Samsung Galaxy Tab', title: 'Samsung Galaxy Tab' },
        { name: 'AirPods Pro', title: 'AirPods Pro' },
        { name: 'Sony WH-1000XM5', title: 'Sony WH-1000XM5' }
    ];
    
    async function fetchSearchSuggestions(query) {
        try {
            // For demo purposes, filter mock suggestions
            const filtered = mockSuggestions.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.title.toLowerCase().includes(query.toLowerCase())
            );
            return { results: filtered };
        } catch (error) {
            console.error('Error fetching search suggestions:', error);
            return { results: [] };
        }
    }
    
    function displaySearchSuggestions(suggestions) {
        suggestionsGrid.innerHTML = '';
        
        if (suggestions.length === 0) {
            suggestionsGrid.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }
        
        suggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion-item';
            suggestionElement.innerHTML = `
                <div class="suggestion-content" onclick="selectSuggestion('${suggestion.name || suggestion.title}')">
                    ${suggestion.name || suggestion.title}
                </div>
            `;
            suggestionsGrid.appendChild(suggestionElement);
        });
    }
    
    if (searchInput && searchSuggestions) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            searchQueryDisplay.textContent = query || 'results';
            
            clearTimeout(debounceTimer);
            
            if (query.length > MIN_SEARCH_LENGTH) {
                searchSuggestions.classList.add('active');
                suggestionsGrid.innerHTML = '<div class="loading-suggestions">Loading suggestions...</div>';
                
                debounceTimer = setTimeout(async () => {
                    const data = await fetchSearchSuggestions(query);
                    displaySearchSuggestions(data.results || []);
                }, 300);
            } else {
                searchSuggestions.classList.remove('active');
            }
        });
        
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const query = searchInput.value.trim();
            
            if (query) {
                searchSuggestions.classList.remove('active');
                performSearch(query);
            }
        });
        
        document.addEventListener('click', function(e) {
            const searchContainer = document.querySelector('.search-container');
            if (searchContainer && !searchContainer.contains(e.target)) {
                searchSuggestions.classList.remove('active');
            }
        });
    }
    
    function performSearch(query) {
        console.log('Performing search for:', query);
        // You can implement actual search functionality here
    }
    
    window.selectSuggestion = function(suggestion) {
        searchInput.value = suggestion;
        searchSuggestions.classList.remove('active');
        performSearch(suggestion);
    };
});


