import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../services/order.service';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';
import { Order, Transaction } from '../models/models';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  order: Order | null = null;
  transaction: Transaction | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const transactionId = this.route.snapshot.paramMap.get('id');
    console.log('Payment success for transaction:', transactionId);
    
    if (transactionId) {
      this.loadOrderDetails(Number(transactionId));
      this.clearCart();
    } else {
      this.error = 'Invalid transaction';
      this.loading = false;
    }
  }

  loadOrderDetails(orderId: number) {
    console.log('Loading order details for ID:', orderId);
    
    this.orderService.getOrderDetails(orderId).subscribe({
      next: (order) => {
        console.log('Order details loaded:', order);
        this.order = order;
        this.transaction = order.transaction || null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.error = 'Failed to load order details';
        this.loading = false;
        this.toastService.showError('Failed to load order details');
      }
    });
  }

  clearCart() {
    console.log('🔄 Clearing cart after successful payment...');
    
    this.cartService.clearCart().subscribe({
      next: (response) => {
        console.log('✅ Cart cleared successfully:', response);
        this.cartService.refreshCart();
      },
      error: (error) => {
        console.error('❌ Error clearing cart:', error);
        this.cartService.refreshCart();
      }
    });
  }

  downloadReceipt() {
    if (!this.order) return;

    this.orderService.downloadReceipt(this.order.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${this.order?.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastService.showSuccess('Receipt downloaded successfully');
      },
      error: (error) => {
        console.error('Error downloading receipt:', error);
        this.toastService.showError('Failed to download receipt');
      }
    });
  }

  printReceipt() {
    window.print();
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}