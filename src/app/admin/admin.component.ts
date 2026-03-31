import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  stats: any = {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentTransactions: []
  };
  transactions: any[] = [];
  orders: any[] = [];
  loading = true;
  error = '';
  activeTab: 'dashboard' | 'transactions' | 'orders' = 'dashboard';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDashboard();
    this.loadTransactions();
    this.loadOrders();
  }

  loadDashboard() {
    this.http.get('http://localhost:30002/api/admin/stats').subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  loadTransactions() {
    this.http.get('http://localhost:30002/api/admin/transactions').subscribe({
      next: (data) => {
        this.transactions = data as any[];
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
      }
    });
  }

  loadOrders() {
    this.http.get('http://localhost:30002/api/admin/orders').subscribe({
      next: (data) => {
        this.orders = data as any[];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load orders';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'fraud': return 'status-fraud';
      default: return '';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  switchTab(tab: 'dashboard' | 'transactions' | 'orders') {
    this.activeTab = tab;
  }
}
