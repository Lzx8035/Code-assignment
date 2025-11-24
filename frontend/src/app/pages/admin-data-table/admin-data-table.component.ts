import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import {
  FilterPanelComponent,
  FilterMeta,
  FilterOptions,
} from '../../components/filter-panel/filter-panel.component';
import {
  FundsTableComponent,
  Fund,
} from '../../components/funds-table/funds-table.component';

interface PaginatedResponse {
  data: Fund[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

@Component({
  selector: 'app-admin-data-table',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    PaginationComponent,
    FilterPanelComponent,
    FundsTableComponent,
  ],
  templateUrl: './admin-data-table.component.html',
  styleUrl: './admin-data-table.component.scss',
  standalone: true,
})
export class AdminDataTableComponent implements OnInit, OnDestroy {
  funds: Fund[] = [];
  loading = false;
  error: string | null = null;
  metaLoading = false;
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalItems = 0;
  filterMeta: FilterMeta = {
    strategies: [],
    geographies: [],
    currencies: [],
    managers: [],
  };

  filters: FilterOptions = {
    name: '',
    strategies: [],
    geographies: [],
    managers: [],
    currency: '',
    minFundSize: null,
    maxFundSize: null,
    minVintage: null,
    maxVintage: null,
    sortBy: '',
    sortOrder: 'asc',
  };

  private queryParamsSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadMeta();

    // Subscribe to query params changes to reload data when navigating back
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      (params) => {
        this.loadFiltersFromUrl(params);
        this.loadFunds();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  loadFiltersFromUrl(params?: { [key: string]: string | string[] }): void {
    const queryParams = params || this.route.snapshot.queryParams;

    // Reset filters first
    this.filters = {
      name: '',
      strategies: [],
      geographies: [],
      managers: [],
      currency: '',
      minFundSize: null,
      maxFundSize: null,
      minVintage: null,
      maxVintage: null,
      sortBy: '',
      sortOrder: 'asc',
    };
    this.currentPage = 1;
    this.pageSize = 10;

    // Load filters from URL
    if (queryParams['name']) {
      this.filters.name = decodeURIComponent(queryParams['name']);
    }

    if (queryParams['strategies']) {
      this.filters.strategies = Array.isArray(queryParams['strategies'])
        ? queryParams['strategies']
        : queryParams['strategies'].split(',').map((s: string) => s.trim());
    }

    if (queryParams['geographies']) {
      this.filters.geographies = Array.isArray(queryParams['geographies'])
        ? queryParams['geographies']
        : queryParams['geographies'].split(',').map((g: string) => g.trim());
    }

    if (queryParams['managers']) {
      this.filters.managers = Array.isArray(queryParams['managers'])
        ? queryParams['managers']
        : queryParams['managers'].split(',').map((m: string) => m.trim());
    }

    if (queryParams['currency']) {
      this.filters.currency = decodeURIComponent(queryParams['currency']);
    }

    if (queryParams['minFundSize']) {
      const min = parseFloat(queryParams['minFundSize']);
      this.filters.minFundSize = Number.isFinite(min) ? min : null;
    }

    if (queryParams['maxFundSize']) {
      const max = parseFloat(queryParams['maxFundSize']);
      this.filters.maxFundSize = Number.isFinite(max) ? max : null;
    }

    if (queryParams['minVintage']) {
      const min = parseInt(queryParams['minVintage'], 10);
      this.filters.minVintage = Number.isFinite(min) ? min : null;
    }

    if (queryParams['maxVintage']) {
      const max = parseInt(queryParams['maxVintage'], 10);
      this.filters.maxVintage = Number.isFinite(max) ? max : null;
    }

    if (queryParams['sortBy']) {
      this.filters.sortBy = queryParams['sortBy'];
    }

    if (queryParams['sortOrder']) {
      this.filters.sortOrder = queryParams['sortOrder'];
    }

    // Load pagination from URL
    if (queryParams['page']) {
      const page = parseInt(queryParams['page'], 10);
      this.currentPage = Number.isFinite(page) && page > 0 ? page : 1;
    }

    if (queryParams['pageSize']) {
      const pageSize = parseInt(queryParams['pageSize'], 10);
      this.pageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10;
    }
  }

  updateUrlParams(): void {
    const queryParams: { [key: string]: string | number } = {};

    if (this.filters.name) {
      queryParams['name'] = this.filters.name;
    }

    if (this.filters.strategies.length > 0) {
      queryParams['strategies'] = this.filters.strategies.join(',');
    }

    if (this.filters.geographies.length > 0) {
      queryParams['geographies'] = this.filters.geographies.join(',');
    }

    if (this.filters.managers.length > 0) {
      queryParams['managers'] = this.filters.managers.join(',');
    }

    if (this.filters.currency) {
      queryParams['currency'] = this.filters.currency;
    }

    if (this.filters.minFundSize !== null) {
      queryParams['minFundSize'] = this.filters.minFundSize;
    }

    if (this.filters.maxFundSize !== null) {
      queryParams['maxFundSize'] = this.filters.maxFundSize;
    }

    if (this.filters.minVintage !== null) {
      queryParams['minVintage'] = this.filters.minVintage;
    }

    if (this.filters.maxVintage !== null) {
      queryParams['maxVintage'] = this.filters.maxVintage;
    }

    if (this.filters.sortBy) {
      queryParams['sortBy'] = this.filters.sortBy;
      queryParams['sortOrder'] = this.filters.sortOrder;
    }

    // Add pagination parameters
    queryParams['page'] = this.currentPage;
    queryParams['pageSize'] = this.pageSize;

    // Update URL without reloading the page
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
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

    this.http.get<PaginatedResponse>(url).subscribe({
      next: (response) => {
        this.funds = response.data;
        this.currentPage = response.pagination.page;
        this.pageSize = response.pagination.pageSize;
        this.totalPages = response.pagination.totalPages;
        this.totalItems = response.pagination.total;
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

    if (this.filters.managers.length > 0) {
      params.push(`managers=${this.filters.managers.join(',')}`);
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

    // Add pagination parameters
    params.push(`page=${this.currentPage}`);
    params.push(`pageSize=${this.pageSize}`);

    return params.length > 0 ? `?${params.join('&')}` : '';
  }

  onFilterChange(filters: FilterOptions): void {
    this.filters = filters;
    this.currentPage = 1; // Reset to first page when filters change
    this.updateUrlParams();
    this.loadFunds();
  }

  onResetFilters(): void {
    this.filters = {
      name: '',
      strategies: [],
      geographies: [],
      managers: [],
      currency: '',
      minFundSize: null,
      maxFundSize: null,
      minVintage: null,
      maxVintage: null,
      sortBy: '',
      sortOrder: 'asc',
    };
    this.currentPage = 1; // Reset to first page when filters are reset
    this.clearUrlParams();
    this.loadFunds();
  }

  clearUrlParams(): void {
    // Clear all query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateUrlParams();
    this.loadFunds();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1; // Reset to first page when page size changes
    this.updateUrlParams();
    this.loadFunds();
  }

  onEditFund(fundName: string): void {
    const encodedName = encodeURIComponent(fundName);
    this.router.navigate(['/admin/funds', encodedName, 'edit']);
  }

  onDeleteFund(fundName: string): void {
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
