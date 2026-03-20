import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  
  // Category-based color mapping for fallback images
  private categoryColors: { [key: string]: string } = {
    'Electronics': '#3498db', // Blue
    'Fashion': '#e74c3c',     // Red
    'Home': '#2ecc71',         // Green
    'Books': '#f39c12',        // Orange
    'default': '#95a5a6'       // Gray
  };

  // Category-based icon mapping
  private categoryIcons: { [key: string]: string } = {
    'Electronics': 'fas fa-laptop',
    'Fashion': 'fas fa-tshirt',
    'Home': 'fas fa-home',
    'Books': 'fas fa-book',
    'default': 'fas fa-box'
  };

  // Product-specific icon mapping
  private productIcons: { [key: string]: string } = {
    // Electronics
    'Smartphone X': 'fas fa-mobile-alt',
    'Laptop Pro': 'fas fa-laptop',
    'Wireless Headphones': 'fas fa-headphones',
    'Smart Watch': 'fas fa-clock',
    'Tablet Plus': 'fas fa-tablet-alt',
    'Digital Camera': 'fas fa-camera',
    
    // Fashion
    'Designer Jeans': 'fas fa-shopping-bag',
    'Leather Jacket': 'fas fa-vest',
    'Cotton T-shirt': 'fas fa-tshirt',
    'Running Shoes': 'fas fa-shoe-prints',
    'Sun Hat': 'fas fa-hat-cowboy',
    
    // Home
    'Sofa Set': 'fas fa-couch',
    'Dining Table': 'fas fa-utensils',
    'Bed Sheet Set': 'fas fa-bed',
    'Coffee Table': 'fas fa-coffee',
    'Floor Lamp': 'fas fa-lightbulb',
    
    // Books
    'Fiction Novel': 'fas fa-book-open',
    'Cookbook': 'fas fa-utensil-spoon',
    'Self-Help Book': 'fas fa-brain',
    'Science Book': 'fas fa-flask',
    'History Book': 'fas fa-landmark',
    
    'default': 'fas fa-box'
  };

  constructor() { }

  /**
   * Get product image URL based on category and product name
   * Using free placeholder images with category-based colors
   */
  getProductImage(productName: string, category: string): string {
    const color = this.getCategoryColor(category);
    const encodedName = encodeURIComponent(productName);
    
    // Using free placeholder services
    const imageServices = [
      `https://via.placeholder.com/400x400/${color}/ffffff?text=${encodedName}`,
      `https://placehold.co/400x400/${color}/ffffff?text=${encodedName}`,
      `https://picsum.photos/400/400?random=${this.getSeedFromName(productName)}`
    ];
    
    // Return a consistent image based on product name hash
    const seed = this.getSeedFromName(productName);
    return `https://picsum.photos/400/400?random=${seed}`;
  }

  /**
   * Get product icon based on product name
   */
  getProductIcon(productName: string): string {
    // Clean product name for matching
    const cleanName = productName.trim();
    
    // Try to find exact match
    if (this.productIcons[cleanName]) {
      return this.productIcons[cleanName];
    }
    
    // Try partial matching
    for (const [key, icon] of Object.entries(this.productIcons)) {
      if (cleanName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    return this.productIcons['default'];
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category: string): string {
    return this.categoryIcons[category] || this.categoryIcons['default'];
  }

  /**
   * Get category color
   */
  getCategoryColor(category: string): string {
    return this.categoryColors[category] || this.categoryColors['default'];
  }

  /**
   * Generate consistent seed from product name
   */
  private getSeedFromName(name: string): number {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 1000;
  }

  /**
   * Get category-based placeholder image
   */
  getCategoryPlaceholder(category: string, text: string): string {
    const color = this.getCategoryColor(category).replace('#', '');
    return `https://placehold.co/400x400/${color}/ffffff?text=${encodeURIComponent(text)}`;
  }

  /**
   * Get Font Awesome icon class for product
   */
  getIconClass(productName: string, category: string): string {
    return this.getProductIcon(productName);
  }

  /**
   * Get gradient style based on category
   */
  getCategoryGradient(category: string): string {
    const gradients: { [key: string]: string } = {
      'Electronics': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Fashion': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Home': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'Books': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'default': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    return gradients[category] || gradients['default'];
  }
}