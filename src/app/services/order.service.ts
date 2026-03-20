import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

  createOrder(shippingDetails: any): Observable<any> {
    return this.http.post(this.apiUrl, shippingDetails);
  }

  getOrders(): Observable<Order[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Order[]>(this.apiUrl, { headers });
  }

  getOrderDetails(orderId: number): Observable<Order> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`, { headers });
  }

  downloadReceipt(orderId: number): Observable<Blob> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    // Use the correct endpoint
    return this.http.get(`http://localhost:3000/api/receipt/${orderId}`, {
      headers: headers,
      responseType: 'blob'
    });
  }
}