import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ContractTopbarComponent } from '../../TopBar/contract-topbar/contract-topbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [ContractTopbarComponent, CommonModule, FormsModule, NgSelectModule],
  selector: 'app-contracts',
  templateUrl: './owner-contracts.component.html',
  styleUrls: ['./owner-contracts.component.css']
})
export class OwnerContractsComponent implements OnInit {
  contracts: any[] = [];
  users: any[] = [];
  apartments: any[] = [];

  selectedStatus: string = '';
  selectedUser: string = '';
  selectedApartment: string = '';
  selectedType: string = '';
  contractTypes: string[] = ['Sale', 'Rent'];
  
  selectedContract: any = null;

  statusOptions: string[] = ['Pending', 'Completed'];

  constructor(private http: HttpClient,private router: Router) {}

  ngOnInit(): void {
    this.loadContracts();
    this.loadUsers();
    this.loadApartments();
  }

  loadContracts(): void {
    let params = new HttpParams();

    if (this.selectedStatus) params = params.set('status', this.selectedStatus);
    if (this.selectedUser) params = params.set('user_id', this.selectedUser);
    if (this.selectedApartment) params = params.set('apartment_id', this.selectedApartment);
    if (this.selectedType) params = params.set('contract_type', this.selectedType);

    this.http.get<any[]>('http://localhost:5000/contracts', { params })
      .subscribe({
        next: (data) => {
          this.contracts = data;
        },
        error: (err) => {
          console.error('Error loading contracts:', err);
        }
      });
  }

  loadUsers(): void {
    this.http.get<any[]>('http://localhost:5000/users')
      .subscribe({
        next: (data) => {
          this.users = data;
        },
        error: (err) => {
          console.error('Error loading users:', err);
        }
      });
  }

  loadApartments(): void {
    this.http.get<any[]>('http://localhost:5000/apartments')
      .subscribe({
        next: (data) => {
          this.apartments = data;
        },
        error: (err) => {
          console.error('Error loading apartments:', err);
        }
      });
  }

  updateStatus(contract: any): void {
    const updatedStatus = contract.status;
  
    this.http.put(`http://localhost:5000/contracts/${contract.id}`, {
      status: updatedStatus
    }).subscribe({
      next: () => {
        console.log(`Status updated to ${updatedStatus} for contract ${contract.id}`);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        alert('Failed to update contract status.');
      }
    });
  }

  previousStatusMap = new Map<number, string>(); // key: contract.id

  onStatusChange(contract: any, newStatus: string) {
    const contractId = contract.id;
  
    // Save previous status if not already saved
    if (!this.previousStatusMap.has(contractId)) {
      this.previousStatusMap.set(contractId, contract.status);
    }
  
    const previousStatus = this.previousStatusMap.get(contractId) || contract.status;
  
    if (newStatus === 'Completed') {
      const confirmChange = confirm('Are you sure you want to mark this contract as Completed? This will attach the apartment to the user.');
      if (confirmChange) {
        contract.status = 'Completed';
        this.previousStatusMap.set(contractId, 'Completed');
        this.updateStatus(contract);
        this.assignApartmentToUser(contract);
      } else {
        // Revert to previous status in both model and view
        contract.status = previousStatus;
        this.previousStatusMap.set(contractId, previousStatus);
      }
    } else {
      // Update normally
      contract.status = newStatus;
      this.previousStatusMap.set(contractId, newStatus);
      this.updateStatus(contract);
    }
  }
  
  
  assignApartmentToUser(contract: any) {
    if (!contract.apartment_id || !contract.buyer_id) {
      console.error('Missing apartment_id or user_id for assignment');
      return;
    }

    if (!contract.price) {
      console.error('Missing price on contract!');
      alert('Contract price is missing. Cannot assign apartment.');
      return;
    }
  
    this.http.post('http://localhost:5000/api/assign-apartment', {
      apartment_id: contract.apartment_id,
      user_id: contract.buyer_id,
      amount: contract.price,
      transaction_type: contract.contract_type

    }).subscribe({
      next: (res) => {
        console.log('Apartment assigned successfully:', res);
      },
      error: (err) => {
        console.error('Error assigning apartment:', err);
        alert('Failed to assign apartment after contract completion.');
      }
    });
  }
  
  
  selectedContractId: number | null = null;

  viewDetails(contract: any): void {
    console.log("navigatin: ",contract.id);
    this.router.navigate(['/owner-dashboard/contract-details', contract.id]);
  }
  
  closeDetails(): void {
    this.selectedContractId = null;
  }

  createContract() {
    // Navigate to contract creation page
    // Example:
    this.router.navigate(['/owner-dashboard/create-contract']);
  }  

  resetFilters(): void {
    this.selectedStatus = '';
    this.selectedUser = '';
    this.selectedApartment = '';
    this.selectedType = '';
    this.loadContracts();
  }
}
