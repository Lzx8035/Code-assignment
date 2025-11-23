import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

export interface Fund {
  name: string;
  strategies: string[];
  geographies: string[];
  currency: string;
  fundSize: number;
  vintage: number;
  managers: string[];
  description: string;
}

interface FilterMeta {
  strategies: string[];
  geographies: string[];
  currencies: string[];
}

interface FilterOptions {
  name: string;
  strategies: string[];
  geographies: string[];
  currency: string;
  minFundSize: number | null;
  maxFundSize: number | null;
  minVintage: number | null;
  maxVintage: number | null;
  sortBy: string;
  sortOrder: string;
}

@Component({
  selector: 'app-admin-data-table',
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './admin-data-table.component.html',
  styleUrl: './admin-data-table.component.scss',
  standalone: true,
})
export class AdminDataTableComponent implements OnInit {
  funds: Fund[] = [];
  loading = false;
  error: string | null = null;
  metaLoading = false;
  filterMeta: FilterMeta = {
    strategies: [],
    geographies: [],
    currencies: [],
  };

  filters: FilterOptions = {
    name: '',
    strategies: [],
    geographies: [],
    currency: '',
    minFundSize: null,
    maxFundSize: null,
    minVintage: null,
    maxVintage: null,
    sortBy: '',
    sortOrder: 'asc',
  };

  showStrategiesDropdown = false;
  showGeographiesDropdown = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadMeta();
    this.loadFunds();

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      this.closeDropdowns();
    });
  }

  loadMeta(): void {
    this.metaLoading = true;
    this.http
      .get<FilterMeta>('http://localhost:3000/api/funds/meta')
      .subscribe({
        next: (data) => {
          this.filterMeta = data;
          this.metaLoading = false;
        },
        error: (err) => {
          console.error('Error loading meta data:', err);
          this.metaLoading = false;
        },
      });
  }

  loadFunds(): void {
    this.loading = true;
    this.error = null;

    const params = this.buildQueryParams();
    const url = `http://localhost:3000/api/funds${params}`;

    this.http.get<Fund[]>(url).subscribe({
      next: (data) => {
        this.funds = data;
        this.loading = false;
      },
      error: (err) => {
        this.error =
          'Failed to load funds data. Please make sure the backend server is running.';
        this.loading = false;
        console.error('Error loading funds:', err);
      },
    });
  }

  buildQueryParams(): string {
    const params: string[] = [];

    if (this.filters.name) {
      params.push(`name=${encodeURIComponent(this.filters.name)}`);
    }

    if (this.filters.strategies.length > 0) {
      params.push(`strategies=${this.filters.strategies.join(',')}`);
    }

    if (this.filters.geographies.length > 0) {
      params.push(`geographies=${this.filters.geographies.join(',')}`);
    }

    if (this.filters.currency) {
      params.push(`currency=${encodeURIComponent(this.filters.currency)}`);
    }

    if (this.filters.minFundSize !== null) {
      params.push(`minFundSize=${this.filters.minFundSize}`);
    }

    if (this.filters.maxFundSize !== null) {
      params.push(`maxFundSize=${this.filters.maxFundSize}`);
    }

    if (this.filters.minVintage !== null) {
      params.push(`minVintage=${this.filters.minVintage}`);
    }

    if (this.filters.maxVintage !== null) {
      params.push(`maxVintage=${this.filters.maxVintage}`);
    }

    if (this.filters.sortBy) {
      params.push(`sortBy=${this.filters.sortBy}`);
      params.push(`sortOrder=${this.filters.sortOrder}`);
    }

    return params.length > 0 ? `?${params.join('&')}` : '';
  }

  onFilterChange(): void {
    this.loadFunds();
  }

  toggleStrategy(strategy: string): void {
    const index = this.filters.strategies.indexOf(strategy);
    if (index > -1) {
      this.filters.strategies.splice(index, 1);
    } else {
      this.filters.strategies.push(strategy);
    }
    this.onFilterChange();
  }

  toggleGeography(geography: string): void {
    const index = this.filters.geographies.indexOf(geography);
    if (index > -1) {
      this.filters.geographies.splice(index, 1);
    } else {
      this.filters.geographies.push(geography);
    }
    this.onFilterChange();
  }

  toggleStrategiesDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showStrategiesDropdown = !this.showStrategiesDropdown;
    if (this.showStrategiesDropdown) {
      this.showGeographiesDropdown = false;
    }
  }

  toggleGeographiesDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showGeographiesDropdown = !this.showGeographiesDropdown;
    if (this.showGeographiesDropdown) {
      this.showStrategiesDropdown = false;
    }
  }

  closeDropdowns(): void {
    this.showStrategiesDropdown = false;
    this.showGeographiesDropdown = false;
  }

  resetFilters(): void {
    this.filters = {
      name: '',
      strategies: [],
      geographies: [],
      currency: '',
      minFundSize: null,
      maxFundSize: null,
      minVintage: null,
      maxVintage: null,
      sortBy: '',
      sortOrder: 'asc',
    };
    this.loadFunds();
  }

  editFund(fundName: string): void {
    const encodedName = encodeURIComponent(fundName);
    this.router.navigate(['/admin/funds', encodedName, 'edit']);
  }

  deleteFund(fundName: string): void {
    if (
      !confirm(
        `Are you sure you want to delete "${fundName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    const encodedName = encodeURIComponent(fundName);
    this.http
      .delete(`http://localhost:3000/api/funds/${encodedName}`)
      .subscribe({
        next: () => {
          // Reload the funds list after successful deletion
          this.loadFunds();
        },
        error: (err) => {
          alert('Failed to delete fund. Please try again.');
          console.error('Error deleting fund:', err);
        },
      });
  }
}
