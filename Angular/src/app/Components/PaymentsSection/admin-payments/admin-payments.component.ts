import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PaymentsTopbarComponent } from '../../TopBar/payments-topbar/payments-topbar.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule,FormsModule,PaymentsTopbarComponent,NgSelectModule],
  templateUrl: './admin-payments.component.html',
  styleUrls: ['./admin-payments.component.scss']
})
export class AdminPaymentsComponent implements OnInit {

  statusFilter: string = 'All';

  payments: any[] = [];
  filteredPayments: any[] = [];

  users: any[] = [];
  userFilter: number | null = null;
  userSearch: string = '';
  
  apartments: any[] = [];
  apartmentSearch: string = '';
  apartmentFilter: number | null = null;

  monthOptions: string[] = [];
  monthFilter: string | null = null;

  typeFilter: string = 'All';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>('http://localhost:5000/payments').subscribe((data) => {
      this.payments = [
        ...data.due.map((p: any) => ({ ...p, status: 'Due' })),
        ...data.overdue.map((p: any) => ({ ...p, status: 'Overdue' })),
        ...data.completed.map((p: any) => ({ ...p, status: 'Completed' }))
      ];
  
      // Extract unique users
      this.users = Array.from(
        new Map(
          this.payments
            .filter(p => p.user)  // ignore nulls
            .map(p => [p.user.id, p.user])
        ).values()
      );
  
      // Extract unique apartments
      this.apartments = Array.from(
        new Map(
          this.payments
            .filter(p => p.apartment)  // ignore nulls
            .map(p => [p.apartment.id, p.apartment])
        ).values()
      );

      const monthsSet = new Set<string>();

      this.payments.forEach(p => {
        const date = new Date(p.due_date);
        const monthLabel = date.toLocaleString('default', { month: 'long', year: 'numeric' }); // e.g. April 2025
        monthsSet.add(monthLabel);
      });

      this.monthOptions = ['All', ...Array.from(monthsSet)];

      this.applyFilter(); // Apply filters after loading
    });
  }
  

  applyFilter(): void {
    this.filteredPayments = this.payments.filter(p => {
      const matchStatus =
        this.statusFilter === 'All' || p.status === this.statusFilter;
  
      const matchUserDropdown =
        !this.userFilter || p.user?.id === +this.userFilter;
  
      const matchUserSearch =
        !this.userSearch ||
        p.user?.full_name.toLowerCase().includes(this.userSearch.toLowerCase());
  
      const matchApartmentDropdown =
        !this.apartmentFilter || p.apartment?.id === +this.apartmentFilter;
  
      const matchApartmentSearch =
        !this.apartmentSearch ||
        p.apartment?.location.toLowerCase().includes(this.apartmentSearch.toLowerCase());
      
      const matchMonth =
        !this.monthFilter ||  this.monthFilter === 'All' || // if no month selected or all, show all
        new Date(p.due_date).toLocaleString('default', { month: 'long', year: 'numeric' }) === this.monthFilter;

        const matchType =
        this.typeFilter === 'All' || !this.typeFilter || p.transaction_type === this.typeFilter;
      

      return (
        matchStatus &&
        matchUserDropdown &&
        matchUserSearch &&
        matchApartmentDropdown &&
        matchApartmentSearch &&
        matchMonth &&
        matchType
      );
    });
  }

  showAddPaymentModal = false;
  newPayment: any = {
    user_id: null,
    apartment_id: null,
    amount: null,
    currency: 'USD',
    due_date: '',
    paid_date: '',
    status: 'Pending',
    markPaid: false,
    payment_method: '',
    transaction_type: 'Rent'
  };
  
  formError: string = '';

  openAddPayment() {
    this.newPayment = {
      user_id: null,
      apartment_id: null,
      amount: null,
      currency: 'USD',
      due_date: '',
      status: 'Pending',
      markPaid: false,
      transaction_type: 'Rent'
    };
    this.formError = '';
    this.showAddPaymentModal = true;
  }

  cancelAddPayment() {
    this.showAddPaymentModal = false;
    this.formError = '';
  }

  onMarkPaidChange() {
    if (this.newPayment.markPaid) {
      this.newPayment.paid_date = '';
    }
  }
  
  submitNewPayment() {
    this.formError = '';
  
    const np = this.newPayment;
  
    if (!np.user_id || !np.apartment_id || !np.amount || !np.due_date) {
      this.formError = 'Please fill in all required fields.';
      return;
    }
  
    if (np.amount <= 0) {
      this.formError = 'Amount must be greater than 0.';
      return;
    }
  
    if (np.status === 'Completed') {
      if (!np.markPaid && !np.paid_date) {
        this.formError = 'Please select a paid date.';
        return;
      }
  
      if (!np.payment_method) {
        this.formError = 'Please select a payment method.';
        return;
      }
    }
  
    const payload: any = {
      user_id: np.user_id,
      apartment_id: np.apartment_id,
      amount: np.amount,
      currency: np.currency,
      due_date: np.due_date,
      status: np.status,
      transaction_type: np.transaction_type,
      paid_date: np.status === 'Completed'
        ? (np.markPaid ? new Date() : new Date(np.paid_date))
        : null,
      payment_method: np.status === 'Completed' ? np.payment_method : null
    };
  
    this.http.post('http://localhost:5000/payments', payload).subscribe({
      next: () => {
        alert('Payment added successfully!');
        this.showAddPaymentModal = false;
        this.ngOnInit();
      },
      error: (err) => {
        this.formError = 'Error adding payment.';
        console.error(err);
      }
    });
  }  

  markAsCompleted(payment: any) {
    const confirmUpdate = confirm('Are you sure you want to mark this payment as completed?');
    if (!confirmUpdate) return;
  
    const payload = {
      status: 'Completed',
      paid_date: new Date(),
      payment_method: 'Cash' // optionally allow selection
    };
  
    this.http.put(`http://localhost:5000/payments/${payment.id}`, payload).subscribe({
      next: () => {
        alert('Marked as completed!');
        this.ngOnInit();
      },
      error: (err) => {
        console.error('Error marking as completed', err);
        alert('Error updating payment.');
      }
    });
  }
  
  
}
