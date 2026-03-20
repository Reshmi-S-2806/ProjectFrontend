import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'undo';
  duration?: number;
  undoCallback?: () => void;
  id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  toast$ = this.toastSubject.asObservable();
  private counter = 0;

  showSuccess(message: string, duration: number = 3000) {
    this.toastSubject.next({ 
      id: this.counter++, 
      message, 
      type: 'success', 
      duration 
    });
  }

  showError(message: string, duration: number = 5000) {
    this.toastSubject.next({ 
      id: this.counter++, 
      message, 
      type: 'error', 
      duration 
    });
  }

  showInfo(message: string, duration: number = 3000) {
    this.toastSubject.next({ 
      id: this.counter++, 
      message, 
      type: 'info', 
      duration 
    });
  }

  showUndo(message: string, undoCallback: () => void, duration: number = 5000) {
    this.toastSubject.next({ 
      id: this.counter++, 
      message, 
      type: 'undo', 
      duration,
      undoCallback 
    });
  }
}