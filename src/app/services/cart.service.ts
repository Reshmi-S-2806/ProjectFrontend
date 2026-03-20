import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { CartItem } from '../models/models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000/api/cart';
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    console.log('🛒 CartService initialized');
    
    // Initialize cart when user is logged in
    if (this.authService.isLoggedIn()) {
      this.loadCartFromServer();
    }

    // Subscribe to auth changes
    this.authService.currentUser.subscribe(user => {
      console.log('👤 Auth state changed:', user ? 'logged in' : 'logged out');
      if (!user) {
        // User logged out - clear cart
        this.clearLocalCart();
      } else {
        // User logged in - load cart
        this.loadCartFromServer();
      }
    });
  }

  /**
   * Load cart from server
   */
  private loadCartFromServer(): void {
    if (!this.authService.isLoggedIn()) {
      console.log('❌ User not logged in, cannot load cart');
      this.clearLocalCart();
      return;
    }
    
    console.log('📦 Loading cart from server...');
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found');
      this.clearLocalCart();
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.get<CartItem[]>(this.apiUrl, { headers }).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe({
      next: (items) => {
        console.log('✅ Cart loaded:', items.length, 'items');
        console.log('Cart items:', items);
        this.cartItemsSubject.next(items);
        this.cartCountSubject.next(items.length);
        this.authService.updateCartCount(items.length);
      },
      error: (error) => {
        console.error('❌ Error loading cart:', error);
        if (error.status === 401) {
          console.log('🔒 Session expired, logging out');
          this.authService.logout();
        }
      }
    });
  }

  /**
   * Get cart items as observable
   */
  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  /**
   * Force refresh cart from server
   */
  refreshCart(): void {
    console.log('🔄 Refreshing cart...');
    this.loadCartFromServer();
  }

  /**
   * Add a product to cart
   */
  addToCart(productId: number, quantity: number): Observable<any> {
    console.log('➕ Adding to cart:', { productId, quantity });
    
    if (!this.authService.isLoggedIn()) {
      console.log('❌ User not logged in');
      return throwError(() => ({ error: 'Please login to add items to cart' }));
    }
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(this.apiUrl, { productId, quantity }, { headers }).pipe(
      tap(response => {
        console.log('✅ Add to cart response:', response);
        // Immediately refresh cart to get updated items
        setTimeout(() => this.loadCartFromServer(), 500);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Update quantity of a cart item
   */
  updateCartItem(itemId: number, quantity: number): Observable<any> {
    console.log('🔄 Updating cart item:', { itemId, quantity });
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}/${itemId}`, { quantity }, { headers }).pipe(
      tap(response => {
        console.log('✅ Update response:', response);
        this.loadCartFromServer();
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Remove an item from cart
   */
  removeFromCart(itemId: number): Observable<any> {
    console.log('🗑️ Removing cart item:', itemId);
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete(`${this.apiUrl}/${itemId}`, { headers }).pipe(
      tap(response => {
        console.log('✅ Remove response:', response);
        // Immediately refresh cart after deletion
        this.loadCartFromServer();
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Clear entire cart
   */
  clearCart(): Observable<any> {
    console.log('🧹 ===== CLEARING CART =====');
    console.log('Timestamp:', new Date().toISOString());
    
    if (!this.authService.isLoggedIn()) {
      console.log('❌ User not logged in, clearing local cart only');
      this.clearLocalCart();
      return of({ success: true, message: 'Cart cleared locally' });
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found');
      this.clearLocalCart();
      return of({ success: true, message: 'Cart cleared locally' });
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    console.log('📡 Sending clear cart request to server...');

    return this.http.delete(`${this.apiUrl}/clear`, { headers }).pipe(
      tap((response: any) => {
        console.log('✅ Server response:', response);
        console.log(`✅ Cleared ${response.count || 0} items from cart`);
        this.clearLocalCart();
      }),
      catchError(error => {
        console.error('❌ Error clearing cart on server:', error);
        console.log('⚠️ Falling back to local cart clear');
        // Even if server fails, clear local cart
        this.clearLocalCart();
        return of({ success: true, message: 'Cart cleared locally', error: error });
      })
    );
  }

  /**
   * Clear local cart state
   */
  private clearLocalCart(): void {
    console.log('🧹 Clearing local cart state');
    console.log('Previous cart items:', this.cartItemsSubject.value);
    console.log('Previous cart count:', this.cartCountSubject.value);
    
    this.cartItemsSubject.next([]);
    this.cartCountSubject.next(0);
    this.authService.updateCartCount(0);
    
    console.log('✅ Local cart cleared');
  }

  /**
   * Get cart count from server
   */
  getCartCount(): void {
    if (!this.authService.isLoggedIn()) {
      this.cartCountSubject.next(0);
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.get<CartItem[]>(this.apiUrl, { headers }).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe({
      next: (items) => {
        this.cartCountSubject.next(items.length);
        this.authService.updateCartCount(items.length);
      },
      error: (error) => {
        console.error('❌ Error fetching cart count:', error);
        if (error.status === 401) {
          this.authService.logout();
        }
      }
    });
  }

  /**
   * Update cart count manually (for optimistic updates)
   */
  updateCartCount(count: number): void {
    console.log('📊 Manually updating cart count to:', count);
    this.cartCountSubject.next(count);
    this.authService.updateCartCount(count);
  }

  /**
   * Get cart total amount
   */
  getCartTotal(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      })
    );
  }

  /**
   * Check if cart is empty
   */
  isCartEmpty(): Observable<boolean> {
    return this.cartItems$.pipe(
      map(items => items.length === 0)
    );
  }

  /**
   * Error handler
   */
  private handleError(error: HttpErrorResponse) {
    console.error('❌ Cart service error:', error);
    
    let errorMessage = 'An error occurred';
    let statusCode = error.status;
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
      console.error('Client error:', errorMessage);
    } else {
      // Server-side error
      console.error(
        `Backend returned code ${error.status}, ` +
        `body:`, error.error
      );
      
      if (error.status === 0) {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      } else if (error.status === 401) {
        errorMessage = 'Your session has expired. Please login again.';
        console.log('🔒 Session expired, logging out');
        this.authService.logout();
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'Cart item not found.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.error?.error || error.message || 'Unknown error occurred';
      }
    }
    
    return throwError(() => ({
      status: statusCode,
      error: errorMessage,
      details: error.error
    }));
  }

  /**
   * Get cart count as observable
   */
  getCartCountObservable(): Observable<number> {
    return this.cartCount$;
  }

  /**
   * Get cart items as observable
   */
  getCartItemsObservable(): Observable<CartItem[]> {
    return this.cartItems$;
  }
}