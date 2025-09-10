// Categories subcategory data
const subcategories = {
    'smartphones-tablets': {
        title: 'Smartphones and Tablets',
        items: [
            { name: 'Smartphones', href: '#smartphones' },
            { name: 'Tablets', href: '#tablets' },
            { name: 'Accessories', href: '#accessories' }
        ]
    },
    'laptops-accessories': {
        title: 'Laptops and Accessories',
        items: [
            { name: 'Windows Laptops', href: '#windows-laptops' },
            { name: 'Chromebooks', href: '#chromebooks' },
            { name: 'MacBooks', href: '#macbooks' },
            { name: 'Accessories', href: '#laptop-accessories' }
        ]
    }
};

// Initialize categories dropdown
document.addEventListener('DOMContentLoaded', function() {
    const categoryItems = document.querySelectorAll('.category-item');
    const subcategoryTitle = document.getElementById('subcategory-title');
    const subcategoryContent = document.getElementById('subcategory-content');

    categoryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const category = this.getAttribute('data-category');
            const subcategoryData = subcategories[category];
            
            if (subcategoryData) {
                subcategoryTitle.textContent = subcategoryData.title;
                subcategoryContent.innerHTML = subcategoryData.items.map(item => 
                    `<a href="${item.href}" class="subcategory-item">${item.name}</a>`
                ).join('');
            } else {
                subcategoryTitle.textContent = 'No subcategories';
                subcategoryContent.innerHTML = '<p>No subcategories available for this category.</p>';
            }
        });
    });
});


