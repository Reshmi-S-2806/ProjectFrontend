import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Product } from '../models/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  error = '';
  selectedCategory = 'All';
  searchQuery = '';
  highlightedProductIds: Set<number> = new Set();
  
  // Category list
  categoryList: string[] = ['Electronics', 'Fashion', 'Home', 'Books'];

  // Gradient mapping for categories
  private categoryGradients: { [key: string]: string } = {
    'Electronics': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'Fashion': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'Home': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'Books': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'All': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  // Icon mapping for categories
  private categoryIcons: { [key: string]: string } = {
    'Electronics': 'fas fa-laptop',
    'Fashion': 'fas fa-tshirt',
    'Home': 'fas fa-home',
    'Books': 'fas fa-book',
    'All': 'fas fa-th-large'
  };

  // Icon mapping for specific products
  private productIcons: { [key: string]: string } = {
    // Electronics
    'Smartphone X': 'fas fa-mobile-alt',
    'Laptop Pro': 'fas fa-laptop',
    'Wireless Headphones': 'fas fa-headphones',
    'Smart Watch': 'fas fa-clock',
    'Digital Camera': 'fas fa-camera',
    
    // Fashion
    'Designer Jeans': 'fas fa-shopping-bag',
    'Leather Jacket': 'fas fa-vest',
    'Cotton T-shirt': 'fas fa-tshirt',
    'Running Shoes': 'fas fa-shoe-prints',
    'Leather Belt': 'fas fa-grip-lines',
    
    // Home
    'Sofa Set': 'fas fa-couch',
    'Dining Table': 'fas fa-utensils',
    'Bed Sheet Set': 'fas fa-bed',
    'Coffee Table': 'fas fa-coffee',
    'Floor Lamp': 'fas fa-lightbulb',
    'Wall Clock': 'fas fa-clock',
    
    // Books
    'Fiction Novel': 'fas fa-book-open',
    'Cookbook': 'fas fa-utensil-spoon',
    'Self-Help Book': 'fas fa-brain',
    'Science Book': 'fas fa-flask',
    'History Book': 'fas fa-landmark',
    
    'default': 'fas fa-box'
  };

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadProducts();
    
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      if (this.products.length > 0) {
        this.applyFilters();
        if (this.searchQuery) {
          setTimeout(() => this.highlightSearchedProducts(), 500);
        }
      }
    });
  }

  ngAfterViewInit() {
    if (this.searchQuery) {
      setTimeout(() => this.highlightSearchedProducts(), 500);
    }
  }

  loadProducts() {
    this.loading = true;
    this.http.get<Product[]>('http://localhost:3000/api/products')
      .subscribe({
        next: (data) => {
          this.products = data;
          this.filteredProducts = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load products';
          this.loading = false;
          this.toastService.showError('Failed to load products');
          console.error('Error loading products:', error);
        }
      });
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
    this.highlightedProductIds.clear();
  }

  applyFilters() {
    let filtered = [...this.products];
    
    // Apply category filter
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }
    
    // Apply search filter if exists
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
      
      // Highlight ALL matching products
      this.highlightedProductIds.clear();
      filtered.forEach(p => this.highlightedProductIds.add(p.id));
    } else {
      // No search query, clear all highlights
      this.highlightedProductIds.clear();
    }
    
    this.filteredProducts = filtered;
  }

  highlightSearchedProducts() {
    if (this.highlightedProductIds.size > 0) {
      // Scroll to the first highlighted product
      const firstId = Array.from(this.highlightedProductIds)[0];
      setTimeout(() => {
        const element = document.getElementById(`product-${firstId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.highlightedProductIds.clear();
    
    // Remove search param from URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: null },
      queryParamsHandling: 'merge'
    });
    
    this.applyFilters();
  }

  addToCart(product: Product) {
    if (!this.authService.isLoggedIn()) {
      this.toastService.showError('Please login to add items to cart');
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        this.cartService.refreshCart();
        this.toastService.showSuccess(`${product.name} added to cart successfully!`);
      },
      error: (err: any) => {
        this.toastService.showError(err.error?.error || 'Failed to add to cart');
      }
    });
  }

  shopNow() {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      // Calculate offset to account for fixed header
      const headerOffset = 80;
      const elementPosition = productsSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  // Helper methods for template
  isProductHighlighted(productId: number): boolean {
    return this.highlightedProductIds.has(productId);
  }

  getCategoryGradient(category: string): string {
    return this.categoryGradients[category] || this.categoryGradients['All'];
  }

  getCategoryIcon(category: string): string {
    return this.categoryIcons[category] || this.categoryIcons['All'];
  }

  getProductIcon(productName: string): string {
    if (this.productIcons[productName]) {
      return this.productIcons[productName];
    }
    
    for (const [key, icon] of Object.entries(this.productIcons)) {
      if (productName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    return this.productIcons['default'];
  }

  getProductCountByCategory(category: string): number {
    if (category === 'All') {
      return this.products.length;
    }
    return this.products.filter(p => p.category === category).length;
  }

  getTotalProducts(): number {
    return this.products.length;
  }
  
}
