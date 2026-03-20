import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { CartItem } from '../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  loading = true;
  error = '';
  showCheckout = false;
  checkoutForm: FormGroup;
  subtotal = 0;
  shipping = 0;
  tax = 0;
  total = 0;
  
  // For undo functionality
  private removedItem: { item: CartItem, index: number } | null = null;
  private undoTimeout: any;
  private cartSubscription: Subscription | null = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.checkoutForm = this.fb.group({
      shippingAddress: ['', Validators.required],
      shippingCity: ['', Validators.required],
      shippingState: ['', Validators.required],
      shippingPincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Subscribe to cart items
    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      console.log('📦 Cart items updated:', items.length);
      this.cartItems = items;
      this.calculateTotals();
      this.loading = false;
    });
    
    // Trigger initial load
    this.cartService.refreshCart();
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    // Clear timeout when component is destroyed
    if (this.undoTimeout) {
      clearTimeout(this.undoTimeout);
    }
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.shipping = this.subtotal > 999 ? 0 : 40;
    this.tax = this.subtotal * 0.18;
    this.total = this.subtotal + this.shipping + this.tax;
  }

  updateQuantity(item: CartItem, change: number) {
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }

    this.cartService.updateCartItem(item.id, newQuantity).subscribe({
      next: () => {
        this.toastService.showSuccess('Cart updated successfully');
      },
      error: (error) => {
        this.toastService.showError(error.error?.error || 'Failed to update quantity');
      }
    });
  }

  removeItem(item: CartItem) {
    // Store the removed item for potential undo
    const index = this.cartItems.findIndex(i => i.id === item.id);
    this.removedItem = { item, index };
    
    // Optimistically remove from UI
    this.cartItems = this.cartItems.filter(i => i.id !== item.id);
    this.calculateTotals();
    
    // Update cart count immediately
    this.cartService.updateCartCount(this.cartItems.length);
    
    // Show toast with undo option
    this.toastService.showUndo(
      'Item removed from cart', 
      () => this.undoRemove(), 
      5000
    );
    
    // Actually remove from backend after delay
    if (this.undoTimeout) {
      clearTimeout(this.undoTimeout);
    }
    
    this.undoTimeout = setTimeout(() => {
      this.cartService.removeFromCart(item.id).subscribe({
        next: () => {
          console.log('Item permanently removed from cart');
          this.removedItem = null;
          // Ensure cart count is still correct
          this.cartService.refreshCart();
        },
        error: (error) => {
          this.toastService.showError('Failed to remove item');
          // Revert the optimistic removal if backend fails
          if (this.removedItem) {
            this.cartItems.splice(this.removedItem.index, 0, this.removedItem.item);
            this.calculateTotals();
            this.cartService.updateCartCount(this.cartItems.length);
            this.removedItem = null;
          }
        }
      });
    }, 5000); // 5 seconds to undo
  }

  undoRemove() {
    if (this.removedItem && this.undoTimeout) {
      // Clear the timeout
      clearTimeout(this.undoTimeout);
      this.undoTimeout = null;
      
      // Restore the item
      this.cartItems.splice(this.removedItem.index, 0, this.removedItem.item);
      this.calculateTotals();
      
      // Update cart count when undoing
      this.cartService.updateCartCount(this.cartItems.length);
      
      // Show success message
      this.toastService.showSuccess('Item restored to cart');
      
      // Clear the removed item reference
      this.removedItem = null;
    }
  }

  proceedToCheckout() {
    if (this.cartItems.length === 0) {
      this.toastService.showError('Your cart is empty');
      return;
    }
    this.showCheckout = true;
  }

  placeOrder() {
    if (this.checkoutForm.invalid) {
      return;
    }

    this.loading = true;
    this.orderService.createOrder(this.checkoutForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.showCheckout = false;
        this.toastService.showSuccess('Order placed successfully!');
        this.router.navigate(['/payment', response.orderId]);
      },
      error: (error) => {
        this.loading = false;
        this.toastService.showError(error.error?.error || 'Failed to place order');
      }
    });
  }

  continueShopping() {
    this.router.navigate(['/home']);
  }
}