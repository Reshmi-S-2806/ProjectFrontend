import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: any[] = [];
  orders: any[] = [];
  loading = true;
  error = '';
  dateFilter = '';

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.fetchTransactions();
    this.fetchOrders();
  }

  fetchTransactions() {
    const token = localStorage.getItem('token');
    this.http.get('http://localhost:30002/api/admin/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data: any) => {
        this.transactions = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load transactions';
        this.toastService.showError(this.error);
        this.loading = false;
      }
    });
  }

  fetchOrders() {
    const token = localStorage.getItem('token');
    this.http.get('http://localhost:30002/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data: any) => {
        this.orders = data;
      },
      error: (err) => {
        console.error('Error loading orders', err);
      }
    });
  }

  get filteredTransactions() {
    if (!this.dateFilter) return this.transactions;
    return this.transactions.filter(t =>
      new Date(t.transaction_date).toLocaleDateString().includes(this.dateFilter)
    );
  }

  getUserName(userId: number): string {
    const order = this.orders.find(o => o.user_id === userId);
    return order ? order.user_name : 'Unknown';
  }
}
