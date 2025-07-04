import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,HeaderComponent],
  selector: 'app-buy-homes',
  templateUrl: './buy-homes.component.html',
  styleUrls: ['./buy-homes.component.scss']
})
export class BuyHomesComponent implements OnInit {
  apartments: any[] = [];
  
  filterPriceMin: number | null = null;  // Default to null (not an empty string)
  filterPriceMax: number | null = null;  // Default to null (not an empty string)
  filterLocation: string | null = null;  // Default to null
  filterAreaMin: number | null = null;   // Default to null
  filterAreaMax: number | null = null;   // Default to null
  filterType: "For Sale" = "For Sale";  // Added for apartment type filter

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getApartments();
  }

  applyFilters(): void {
    this.getApartments();
  }

  getApartments(): void {
    let filterQuery = '';
  
    if (this.filterPriceMin !== null) filterQuery += `price_min=${this.filterPriceMin}&`;
    if (this.filterPriceMax !== null) filterQuery += `price_max=${this.filterPriceMax}&`;
    if (this.filterLocation) filterQuery += `location=${this.filterLocation}&`;
    if (this.filterAreaMin !== null) filterQuery += `area_min=${this.filterAreaMin}&`;
    if (this.filterAreaMax !== null) filterQuery += `area_max=${this.filterAreaMax}&`;
    if (this.filterType) filterQuery += `type=${this.filterType}&`;
  
    // Always include status=Available
    filterQuery += `status=Available`;
  
    const url = `http://localhost:5000/apartments?${filterQuery}`;
    this.http.get<any[]>(url)
      .subscribe(data => {
        this.apartments = data;
      });
  }
  
  resetFilters(): void {
    this.filterPriceMin = null;
    this.filterPriceMax = null;
    this.filterLocation = null;
    this.filterAreaMin = null;
    this.filterAreaMax = null;
    this.getApartments();
  }
  
}
