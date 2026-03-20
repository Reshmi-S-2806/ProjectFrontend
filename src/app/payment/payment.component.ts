import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../services/payment.service';
import { OrderService } from '../services/order.service';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  orderId: number = 0;
  paymentMethod: string = 'upi';
  loading = false;
  error = '';
  orderTotal = 0;
  
  // Payment forms
  upiForm: FormGroup;
  cardForm: FormGroup;
  netBankingForm: FormGroup;

  paymentMethods = [
    { id: 'upi', name: 'UPI', icon: 'fas fa-mobile-alt' },
    { id: 'card', name: 'Credit/Debit Card', icon: 'fas fa-credit-card' },
    { id: 'netbanking', name: 'Net Banking', icon: 'fas fa-university' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private orderService: OrderService,
    private cartService: CartService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.upiForm = this.fb.group({
      upiId: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$')]]
    });

    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      cardName: ['', Validators.required],
      expiryMonth: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])$')]],
      expiryYear: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]]
    });

    this.netBankingForm = this.fb.group({
      bank: ['', Validators.required],
      accountNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9,18}$')]],
      ifscCode: ['', [Validators.required, Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$')]]
    });
  }

  ngOnInit() {
    this.orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    this.loadOrderDetails();
  }

  loadOrderDetails() {
    this.orderService.getOrderDetails(this.orderId).subscribe({
      next: (order) => {
        this.orderTotal = order.total_amount;
      },
      error: (error) => {
        this.error = 'Failed to load order details';
        this.toastService.showError('Failed to load order details');
      }
    });
  }

  selectPaymentMethod(method: string) {
    this.paymentMethod = method;
  }

  processPayment() {
    let isValid = false;
    let paymentDetails = {};

    switch(this.paymentMethod) {
      case 'upi':
        isValid = this.upiForm.valid;
        paymentDetails = this.upiForm.value;
        break;
      case 'card':
        isValid = this.cardForm.valid;
        paymentDetails = this.cardForm.value;
        break;
      case 'netbanking':
        isValid = this.netBankingForm.valid;
        paymentDetails = this.netBankingForm.value;
        break;
    }

    if (!isValid) {
      this.toastService.showError('Please fill all payment details correctly');
      return;
    }

    this.loading = true;
    this.error = '';

    this.paymentService.processPayment(this.orderId, this.paymentMethod, paymentDetails)
      .subscribe({
        next: (response) => {

  this.loading = false;

  if(response.message === "Transaction blocked - suspicious activity detected"){

    this.toastService.showError("⚠️ Suspicious transaction detected. Payment blocked.");
    return;

  }

  this.toastService.showSuccess('Payment processed successfully!');

  // Clear cart from local state
  this.cartService.clearCart().subscribe({
    next: () => {
      console.log('Cart cleared after payment');
      this.cartService.refreshCart();
    },
    error: (err) => {
      console.error('Error clearing cart:', err);
      this.cartService.refreshCart();
    }
  });

  this.router.navigate(['/payment-success', response.transaction.id]);
          
          this.router.navigate(['/payment-success', response.transaction.id]);
        },
        error: (error) => {

  this.loading = false;

  if(error.status === 403){
      this.toastService.showError("⚠️ Transaction blocked due to fraud detection");
      return;
  }

  this.error = error.error?.error || 'Payment failed. Please try again.';
  this.toastService.showError(this.error);
}
}
      );
    }
  }