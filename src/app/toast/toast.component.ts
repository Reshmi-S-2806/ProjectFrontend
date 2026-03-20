import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: (Toast & { visible: boolean })[] = [];
  private subscription!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toast$.subscribe(toast => {
      const newToast = { ...toast, visible: true };
      this.toasts.push(newToast);
      
      setTimeout(() => {
        this.removeToast(toast.id!);
      }, toast.duration || 3000);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeToast(id: number) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      this.toasts[index].visible = false;
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, 300);
    }
  }

  onUndo(toast: Toast) {
    if (toast.undoCallback) {
      toast.undoCallback();
    }
    this.removeToast(toast.id!);
  }

  getIcon(type: string): string {
    switch(type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      case 'info': return 'fas fa-info-circle';
      case 'undo': return 'fas fa-undo-alt';
      default: return '';
    }
  }
}