import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../Services/api.service'; 
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../Services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ContactLoginPromptComponent } from '../contact-login-prompt/contact-login-prompt.component';
import { ApartmentTopbarComponent } from "../TopBar/apartment-topbar/apartment-topbar.component"; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-apartment-details',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ApartmentTopbarComponent, FormsModule],
  templateUrl: './apartment-details.component.html',
  styleUrls: ['./apartment-details.component.css']
})
export class ApartmentDetailsComponent implements OnInit {
  apartment: any = null;
  mediaGallery: string[] = [];
  mainMedia: string = '';

  error: string | null = null;
  mainPhoto: string = 'assets/default-image.jpg';
  safeVideoUrl: SafeResourceUrl | null = null;
  safeMapUrl: SafeResourceUrl | null = null;
  isLoggedIn = false;
  role: string | null = null;

  selectedUserId: number | null = null;
  potentialUsers: any[] = [];
  selectedStatus = '';

  transactionData = {
    amount: null as number | null,
    // transaction_type: 'Rent' as 'Rent' | 'Sale',
    payment_method: 'Visa' as 'Visa' | 'MasterCard' | 'Cash'
  };

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });

    const apartmentId = Number(this.route.snapshot.paramMap.get('id'));
    if (apartmentId) {
      this.fetchApartmentDetails(apartmentId);
    }

    this.role = localStorage.getItem('role');

    if (this.role === 'Owner' || this.role === 'Administrator') {
      this.loadPotentialUsers();
    }
  }

  fetchApartmentDetails(id: number): void {
    this.apiService.getApartment(id).subscribe({
      next: (data) => {
        this.apartment = data;
        this.selectedStatus = data.status;
  
        // Combine photos and video into a unified gallery
        this.mediaGallery = data.photos ? [...data.photos] : [];
        if (data.video) {
          this.mediaGallery.push(data.video);
        }
        console.log('Media Gallery:', this.mediaGallery);

        // Set main media to the first media item
        if (this.mediaGallery.length > 0) {
          this.mainMedia = this.mediaGallery[0];
        } else {
          this.mainMedia = 'assets/default-image.jpg';
        }
      },
      error: () => {
        this.error = 'Failed to load apartment';
      }
    });
  }
  
  

  loadPotentialUsers(): void {
    this.apiService.getPotentialBuyersOrTenants().subscribe({
      next: (users) => this.potentialUsers = users,
      error: () => console.error('Failed to load potential users')
    });
  }

  submitStatusUpdate(): void {
    if (!this.apartment) return;
  
    if (this.apartment.status !== 'Available') {
      alert('Status cannot be changed unless the apartment is Available.');
      return;
    }
  
    const isSoldOrRented = this.selectedStatus === 'Sale' || this.selectedStatus === 'Rent';
  
    if (isSoldOrRented) {
      if (
        this.transactionData.amount === null ||
        !this.transactionData.payment_method
      ) {
        alert('Please fill all transaction details.');
        return;
      }
      if (!this.selectedUserId) {
        alert('Please select a buyer/tenant.');
        return;
      }
  
      const payload = {
        apartment_id: this.apartment.id,
        user_id: this.selectedUserId,
        amount: this.transactionData.amount!,
        transaction_type: this.selectedStatus as 'Rent' | 'Sale',
        payment_method: this.transactionData.payment_method
      };
  
      this.apiService.assignApartment(payload).subscribe({
        next: () => {
          alert('Apartment assigned and updated successfully.');
          this.fetchApartmentDetails(this.apartment.id);
          this.resetTransactionData();
          this.selectedUserId = null;
        },
        error: () => alert('Failed to assign apartment.')
      });
  
    } else if (this.selectedStatus === 'Available') {
      // This shouldn't happen from UI since current is already Available
      this.apiService.updateApartmentStatusOnly(this.apartment.id, 'Available').subscribe({
        next: () => {
          alert('Apartment status set to Available.');
          this.fetchApartmentDetails(this.apartment.id);
        },
        error: () => alert('Failed to update apartment status.')
      });
    }
  }

  resetTransactionData(): void {
    this.transactionData = {
      amount: null,
      // transaction_type: 'Rent',
      payment_method: 'Visa'
    };
  }

  detachBuyerTenant(): void {
    if (!this.apartment) return;
  
    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${this.apartment.buyer?.full_name || 'this user'} from having the apartment?\nThis will also reset the apartment status to "Available".`
    );
  
    if (!confirmDelete) return;
  
    this.apiService.removeApartmentBuyer(this.apartment.id).subscribe({
      next: () => {
        alert('Buyer/Tenant successfully detached.');
        this.fetchApartmentDetails(this.apartment.id);
      },
      error: () => alert('Failed to detach buyer/tenant.')
    });
  }
  

  // changeMainPhoto(photo: string): void {
  //   this.mainPhoto = photo;
  // }

  changeMainMedia(media: string): void {
    this.mainMedia = media;
  }
  
  isVideo(media: string): boolean {
    return media.endsWith('.mp4') || media.includes('/video');
  }
  

  goBack(): void {
    window.history.back();
  }

  contactOwner(apartmentId: number): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/tenant-dashboard/messages'], { queryParams: { apartmentId } });

    } else {
      const dialogRef = this.dialog.open(ContactLoginPromptComponent);
      dialogRef.afterClosed().subscribe(choice => {
        if (choice === 'login') {
          this.router.navigate(['/login'], { queryParams: { redirectTo: `/tenant-dashboard/messages?apartmentId=${apartmentId}` } });
        } else if (choice === 'signup') {
          this.router.navigate(['/signup'], { queryParams: { redirectTo: `/tenant-dashboard/messages?apartmentId=${apartmentId}`, forcedRole: 'Buyer/Tenant' } });
        }
      });
    }
  }
}
