import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { ToastService } from '../services/toast.service';
import { Order } from '../models/models';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  error = '';
  selectedOrder: Order | null = null;
  showFilters = false;
  statusFilter = 'all';
  dateFilter = '';

  constructor(
    private orderService: OrderService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders || [];
        this.filteredOrders = [...this.orders];
        this.loading = false;
        console.log('Orders loaded:', orders);
      },
      error: (error) => {
        this.error = 'Failed to load orders';
        this.loading = false;
        this.toastService.showError('Failed to load orders');
        console.error('Error loading orders:', error);
      }
    });
  }

  filterByStatus(event: any) {
    this.statusFilter = event.target.value;
    this.applyFilters();
  }

  filterByDate(event: any) {
    this.dateFilter = event.target.value;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      // Status filter
      if (this.statusFilter !== 'all' && order.status?.toLowerCase() !== this.statusFilter) {
        return false;
      }
      
      // Date filter
      if (this.dateFilter) {
        const orderDate = new Date(order.order_date).toISOString().split('T')[0];
        if (orderDate !== this.dateFilter) {
          return false;
        }
      }
      
      return true;
    });
  }

  viewOrderDetails(order: Order) {
    console.log('Fetching details for order:', order.id);
    this.orderService.getOrderDetails(order.id).subscribe({
      next: (orderDetails) => {
        console.log('Order details received:', orderDetails);
        this.selectedOrder = orderDetails;
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.toastService.showError('Failed to load order details');
      }
    });
  }

  closeModal() {
    this.selectedOrder = null;
  }

  downloadReceipt(orderId: number) {
    if (!orderId) {
      this.toastService.showError('Invalid order ID');
      return;
    }
    
    this.orderService.downloadReceipt(orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${orderId}.pdf`;
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

  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-pending';
    
    const statusLower = status.toLowerCase();
    switch(statusLower) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'cancelled': return 'status-cancelled';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }
}