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
  imports: [CommonModule, FormsModule, TagComponent, IconComponent],
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

  @Output() filterChange = new EventEmitter<FilterOptions>();
  @Output() resetFilters = new EventEmitter<void>();

  showStrategiesDropdown = false;
  showGeographiesDropdown = false;
  showManagersDropdown = false;

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
    this.filterChange.emit(this.filters);
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
    }
  }

  closeDropdowns(): void {
    this.showStrategiesDropdown = false;
    this.showGeographiesDropdown = false;
    this.showManagersDropdown = false;
  }
}
