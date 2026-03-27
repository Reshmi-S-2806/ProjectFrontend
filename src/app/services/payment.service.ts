import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:30002/api/payment';

  constructor(private http: HttpClient) {}

  processPayment(orderId: number, paymentMethod: string, cardDetails?: any): Observable<any> {
    return this.http.post(this.apiUrl, {
      orderId,
      paymentMethod,
      cardDetails
    });
  }
}
