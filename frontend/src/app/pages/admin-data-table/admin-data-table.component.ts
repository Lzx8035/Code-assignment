import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
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
  private isInitialLoad = true;
  private isUserAction = false; // Track if loadFunds is called from user action

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadMeta();

    // Subscribe to query params changes to reload data when navigating back
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      (params) => {
        this.loadFiltersFromUrl(params);
        // Only call loadFunds if this is not a user action
        // User actions will call loadFunds themselves after setting isUserAction
        if (!this.isUserAction) {
          this.loadFunds();
        }
        // Mark that initial load is complete after first subscription
        if (this.isInitialLoad) {
          this.isInitialLoad = false;
        }
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
    const queryParams: { [key: string]: string | number | null | undefined } =
      {};

    // Always set pagination parameters
    queryParams['page'] = this.currentPage;
    queryParams['pageSize'] = this.pageSize;

    // Set filter parameters (only if they have values)
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

    // Update URL without reloading the page
    // Use replaceUrl to avoid adding to browser history
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: '',
      replaceUrl: false,
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

          // Use requestAnimationFrame for initial load to ensure DOM is ready
          const showErrorToast = () => {
            this.toastr.error(
              'Failed to load filter options. Some filters may not be available.',
              'Warning',
              {
                timeOut: 5000,
                positionClass: 'toast-bottom-right',
              }
            );
          };

          if (this.isInitialLoad) {
            requestAnimationFrame(() => {
              requestAnimationFrame(showErrorToast);
            });
          } else {
            showErrorToast();
          }
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

        // Show success toast only for user actions (not on initial load)
        // This prevents toast timeout issues on first mount
        // Save isUserAction before it might be reset by URL changes
        const shouldShowToast = this.isUserAction;
        // Reset after checking, but before any async operations
        this.isUserAction = false;

        if (
          shouldShowToast &&
          (response.pagination.total > 0 || this.hasActiveFilters())
        ) {
          this.toastr.success(
            `Found ${response.pagination.total} items`,
            'Search Successful',
            {
              timeOut: 3000,
              positionClass: 'toast-bottom-right',
            }
          );
        }
      },
      error: (err) => {
        this.error =
          'Failed to load funds data. Please make sure the backend server is running.';
        this.loading = false;

        // Always show error toast, but use requestAnimationFrame for initial load
        const showErrorToast = () => {
          this.toastr.error(
            'Failed to load funds data. Please make sure the backend server is running.',
            'Error',
            {
              timeOut: 5000,
              positionClass: 'toast-bottom-right',
            }
          );
        };

        if (this.isInitialLoad) {
          // Use requestAnimationFrame to ensure DOM and animations are ready
          requestAnimationFrame(() => {
            requestAnimationFrame(showErrorToast);
          });
        } else {
          showErrorToast();
        }

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
    this.isUserAction = true; // Mark as user action (must be set before updateUrlParams)
    this.updateUrlParams();
    // Always call loadFunds - queryParams subscription won't call it if isUserAction is true
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
    this.isUserAction = true; // Mark as user action (must be set before clearUrlParams)
    this.clearUrlParams();
    // loadFunds will be called by queryParams subscription, but isUserAction is already set
    // Call loadFunds directly to ensure it runs
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
    this.isUserAction = true; // Mark as user action (must be set before updateUrlParams)
    this.updateUrlParams();
    // loadFunds will be called by queryParams subscription, but isUserAction is already set
    // Call loadFunds directly to ensure it runs
    this.loadFunds();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1; // Reset to first page when page size changes
    this.isUserAction = true; // Mark as user action (must be set before updateUrlParams)
    this.updateUrlParams();
    // loadFunds will be called by queryParams subscription, but isUserAction is already set
    // Call loadFunds directly to ensure it runs
    this.loadFunds();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.name ||
      this.filters.strategies.length > 0 ||
      this.filters.geographies.length > 0 ||
      this.filters.managers.length > 0 ||
      this.filters.currency ||
      this.filters.minFundSize !== null ||
      this.filters.maxFundSize !== null ||
      this.filters.minVintage !== null ||
      this.filters.maxVintage !== null ||
      this.filters.sortBy
    );
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
          // Show success toast
          this.toastr.success(
            `Fund "${fundName}" has been deleted successfully.`,
            'Deleted',
            {
              timeOut: 3000,
              positionClass: 'toast-bottom-right',
            }
          );
          // Reload the funds list after successful deletion
          this.isUserAction = false; // Don't show toast for this reload
          this.loadFunds();
        },
        error: (err) => {
          this.toastr.error(
            `Failed to delete fund "${fundName}". Please try again.`,
            'Error',
            {
              timeOut: 5000,
              positionClass: 'toast-bottom-right',
            }
          );
          console.error('Error deleting fund:', err);
        },
      });
  }
}
