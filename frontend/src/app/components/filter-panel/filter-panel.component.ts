import {
  Component,
  Input,
  Output,
  EventEmitter,
  type OnInit,
  type OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagComponent } from '../tag/tag.component';
import { IconComponent } from '../icon/icon.component';
import {
  CustomDropdownComponent,
  DropdownOption,
} from '../custom-dropdown/custom-dropdown.component';

export interface FilterMeta {
  strategies: string[];
  geographies: string[];
  currencies: string[];
  managers: string[];
}

export interface FilterOptions {
  name: string;
  strategies: string[];
  geographies: string[];
  managers: string[];
  currency: string;
  minFundSize: number | null;
  maxFundSize: number | null;
  minVintage: number | null;
  maxVintage: number | null;
  sortBy: string;
  sortOrder: string;
}

@Component({
  selector: 'app-filter-panel',
  imports: [
    CommonModule,
    FormsModule,
    TagComponent,
    IconComponent,
    CustomDropdownComponent,
  ],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
  standalone: true,
})
export class FilterPanelComponent implements OnInit, OnDestroy {
  @Input() filters: FilterOptions = {
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

  @Input() filterMeta: FilterMeta = {
    strategies: [],
    geographies: [],
    currencies: [],
    managers: [],
  };
  @Input() loading: boolean = false;

  @Output() filterChange = new EventEmitter<FilterOptions>();
  @Output() resetFilters = new EventEmitter<void>();

  showStrategiesDropdown = false;
  showGeographiesDropdown = false;
  showManagersDropdown = false;
  showSortByDropdown = false;
  showCurrencyDropdown = false;

  ngOnInit(): void {
    // Close dropdowns when clicking outside (only in browser)
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.closeDropdowns.bind(this));
    }
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.closeDropdowns.bind(this));
    }
  }

  onSearch(): void {
    // Validate Fund Size - cannot be negative
    if (this.filters.minFundSize !== null && this.filters.minFundSize < 0) {
      alert('Fund Size (Min) cannot be negative.');
      return;
    }

    if (this.filters.maxFundSize !== null && this.filters.maxFundSize < 0) {
      alert('Fund Size (Max) cannot be negative.');
      return;
    }

    // Validate Fund Size range
    if (
      this.filters.minFundSize !== null &&
      this.filters.maxFundSize !== null &&
      this.filters.minFundSize > this.filters.maxFundSize
    ) {
      alert(
        'Invalid Fund Size range: Minimum value must be less than or equal to Maximum value.'
      );
      return;
    }

    // Validate Vintage Year - cannot be negative
    if (this.filters.minVintage !== null && this.filters.minVintage < 0) {
      alert('Vintage Year (Min) cannot be negative.');
      return;
    }

    if (this.filters.maxVintage !== null && this.filters.maxVintage < 0) {
      alert('Vintage Year (Max) cannot be negative.');
      return;
    }

    // Validate Vintage Year range
    if (
      this.filters.minVintage !== null &&
      this.filters.maxVintage !== null &&
      this.filters.minVintage > this.filters.maxVintage
    ) {
      alert(
        'Invalid Vintage Year range: Minimum value must be less than or equal to Maximum value.'
      );
      return;
    }

    // Create a new object to ensure change detection works properly
    const filtersCopy: FilterOptions = {
      name: this.filters.name,
      strategies: [...this.filters.strategies],
      geographies: [...this.filters.geographies],
      managers: [...this.filters.managers],
      currency: this.filters.currency,
      minFundSize: this.filters.minFundSize,
      maxFundSize: this.filters.maxFundSize,
      minVintage: this.filters.minVintage,
      maxVintage: this.filters.maxVintage,
      sortBy: this.filters.sortBy,
      sortOrder: this.filters.sortOrder,
    };

    // If validation passes, emit the filter change
    this.filterChange.emit(filtersCopy);
  }

  onReset(): void {
    this.resetFilters.emit();
  }

  toggleStrategy(strategy: string): void {
    const index = this.filters.strategies.indexOf(strategy);
    if (index > -1) {
      this.filters.strategies.splice(index, 1);
    } else {
      this.filters.strategies.push(strategy);
    }
    // Don't trigger search immediately, wait for search button click
  }

  toggleGeography(geography: string): void {
    const index = this.filters.geographies.indexOf(geography);
    if (index > -1) {
      this.filters.geographies.splice(index, 1);
    } else {
      this.filters.geographies.push(geography);
    }
    // Don't trigger search immediately, wait for search button click
  }

  toggleManager(manager: string): void {
    const index = this.filters.managers.indexOf(manager);
    if (index > -1) {
      this.filters.managers.splice(index, 1);
    } else {
      this.filters.managers.push(manager);
    }
    // Don't trigger search immediately, wait for search button click
  }

  toggleStrategiesDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showStrategiesDropdown = !this.showStrategiesDropdown;
    if (this.showStrategiesDropdown) {
      this.showGeographiesDropdown = false;
      this.showManagersDropdown = false;
      this.showSortByDropdown = false;
      this.showCurrencyDropdown = false;
    }
  }

  toggleGeographiesDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showGeographiesDropdown = !this.showGeographiesDropdown;
    if (this.showGeographiesDropdown) {
      this.showStrategiesDropdown = false;
      this.showManagersDropdown = false;
      this.showSortByDropdown = false;
      this.showCurrencyDropdown = false;
    }
  }

  toggleManagersDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showManagersDropdown = !this.showManagersDropdown;
    if (this.showManagersDropdown) {
      this.showStrategiesDropdown = false;
      this.showGeographiesDropdown = false;
      this.showSortByDropdown = false;
      this.showCurrencyDropdown = false;
    }
  }

  toggleSortByDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showSortByDropdown = !this.showSortByDropdown;
    if (this.showSortByDropdown) {
      this.showStrategiesDropdown = false;
      this.showGeographiesDropdown = false;
      this.showManagersDropdown = false;
      this.showCurrencyDropdown = false;
    }
  }

  toggleCurrencyDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showCurrencyDropdown = !this.showCurrencyDropdown;
    if (this.showCurrencyDropdown) {
      this.showStrategiesDropdown = false;
      this.showGeographiesDropdown = false;
      this.showManagersDropdown = false;
      this.showSortByDropdown = false;
    }
  }

  selectCurrency(value: string): void {
    this.filters.currency = value;
    this.showCurrencyDropdown = false;
  }

  selectSortBy(value: string): void {
    this.filters.sortBy = value;
    this.showSortByDropdown = false;
  }

  closeDropdowns(): void {
    this.showStrategiesDropdown = false;
    this.showGeographiesDropdown = false;
    this.showManagersDropdown = false;
    this.showSortByDropdown = false;
    this.showCurrencyDropdown = false;
  }

  // Helper methods for dropdown options
  getCurrencyOptions(): DropdownOption[] {
    return [
      { value: '', label: 'All Currencies' },
      ...this.filterMeta.currencies.map((c) => ({ value: c, label: c })),
    ];
  }

  getSortByOptions(): DropdownOption[] {
    return [
      { value: '', label: 'No Sorting' },
      { value: 'name:asc', label: 'Name (a-z)' },
      { value: 'name:desc', label: 'Name (z-a)' },
      { value: 'fundSize:asc', label: 'Fund Size (Low to High)' },
      { value: 'fundSize:desc', label: 'Fund Size (High to Low)' },
      { value: 'vintage:asc', label: 'Vintage (Old to New)' },
      { value: 'vintage:desc', label: 'Vintage (New to Old)' },
    ];
  }

  getCurrentSortValue(): string[] {
    if (!this.filters.sortBy) {
      return [];
    }
    const sortValue = `${this.filters.sortBy}:${
      this.filters.sortOrder || 'asc'
    }`;
    return [sortValue];
  }

  getStrategyOptions(): DropdownOption[] {
    return this.filterMeta.strategies.map((s) => ({ value: s, label: s }));
  }

  getGeographyOptions(): DropdownOption[] {
    return this.filterMeta.geographies.map((g) => ({ value: g, label: g }));
  }

  getManagerOptions(): DropdownOption[] {
    return this.filterMeta.managers.map((m) => ({ value: m, label: m }));
  }

  // Event handlers for custom dropdown
  onCurrencyChange(values: string[]): void {
    this.filters.currency = values[0] || '';
  }

  onSortByChange(values: string[]): void {
    const sortValue = values[0] || '';
    if (!sortValue) {
      this.filters.sortBy = '';
      this.filters.sortOrder = 'asc';
    } else {
      const [sortBy, sortOrder] = sortValue.split(':');
      this.filters.sortBy = sortBy;
      this.filters.sortOrder = sortOrder || 'asc';
    }
  }

  onStrategiesChange(values: string[]): void {
    this.filters.strategies = values;
  }

  onGeographiesChange(values: string[]): void {
    this.filters.geographies = values;
  }

  onManagersChange(values: string[]): void {
    this.filters.managers = values;
  }

  onCurrencyToggle(): void {
    this.closeDropdowns();
    this.showCurrencyDropdown = !this.showCurrencyDropdown;
  }

  onSortByToggle(): void {
    this.closeDropdowns();
    this.showSortByDropdown = !this.showSortByDropdown;
  }

  onStrategiesToggle(): void {
    this.closeDropdowns();
    this.showStrategiesDropdown = !this.showStrategiesDropdown;
  }

  onGeographiesToggle(): void {
    this.closeDropdowns();
    this.showGeographiesDropdown = !this.showGeographiesDropdown;
  }

  onManagersToggle(): void {
    this.closeDropdowns();
    this.showManagersDropdown = !this.showManagersDropdown;
  }
}
