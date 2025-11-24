import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Fund } from '../../components/funds-table/funds-table.component';
import { TagComponent } from '../../components/tag/tag.component';
import { IconComponent } from '../../components/icon/icon.component';

interface FilterMeta {
  strategies: string[];
  geographies: string[];
  currencies: string[];
  managers: string[];
}

@Component({
  selector: 'app-admin-edit',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    TagComponent,
    IconComponent,
  ],
  templateUrl: './admin-edit.component.html',
  styleUrl: './admin-edit.component.scss',
  standalone: true,
})
export class AdminEditComponent implements OnInit {
  fund: Fund | null = null;
  originalFund: Fund | null = null;
  loading = false;
  saving = false;
  error: string | null = null;
  success: string | null = null;
  fundName: string | null = null;
  autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  metaLoading = false;
  filterMeta: FilterMeta = {
    strategies: [],
    geographies: [],
    currencies: [],
    managers: [],
  };

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMeta();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.fundName = decodeURIComponent(id);
        this.loadFund();
      } else {
        this.error = 'Fund ID is required';
      }
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

  loadFund(): void {
    if (!this.fundName) {
      return;
    }

    this.loading = true;
    this.error = null;

    const encodedName = encodeURIComponent(this.fundName);
    this.http
      .get<Fund>(`http://localhost:3000/api/funds/${encodedName}`)
      .subscribe({
        next: (data) => {
          this.fund = { ...data };
          this.originalFund = { ...data };
          this.loading = false;
        },
        error: (err) => {
          if (err.status === 404) {
            this.error = `Fund "${this.fundName}" not found.`;
          } else {
            this.error =
              'Failed to load fund data. Please make sure the backend server is running.';
          }
          this.loading = false;
          console.error('Error loading fund:', err);
        },
      });
  }

  onFieldChange(): void {
    if (!this.fund || !this.originalFund) {
      return;
    }

    // Clear existing timer
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    // Set new timer for auto-save (debounce 1 second)
    this.autoSaveTimer = setTimeout(() => {
      this.saveFund();
    }, 1000);
  }

  saveFund(): void {
    if (!this.fund || !this.fundName) {
      return;
    }

    this.saving = true;
    this.error = null;
    this.success = null;

    const encodedName = encodeURIComponent(this.fundName);
    this.http
      .put<Fund>(`http://localhost:3000/api/funds/${encodedName}`, this.fund)
      .subscribe({
        next: (data) => {
          this.fund = data;
          this.originalFund = { ...data };
          this.saving = false;
          this.success = 'Changes saved successfully!';
          setTimeout(() => {
            this.success = null;
          }, 3000);
        },
        error: (err) => {
          this.error = 'Failed to save changes. Please try again.';
          this.saving = false;
          console.error('Error saving fund:', err);
        },
      });
  }

  removeStrategy(index: number): void {
    if (!this.fund) return;
    this.fund.strategies.splice(index, 1);
    this.onFieldChange();
  }

  removeGeography(index: number): void {
    if (!this.fund) return;
    this.fund.geographies.splice(index, 1);
    this.onFieldChange();
  }

  removeManager(index: number): void {
    if (!this.fund) return;
    this.fund.managers.splice(index, 1);
    this.onFieldChange();
  }

  // Get available options that are not already selected
  getAvailableStrategies(): string[] {
    if (!this.fund) return this.filterMeta.strategies;
    const fund = this.fund;
    return this.filterMeta.strategies.filter(
      (strategy) => !fund.strategies.includes(strategy)
    );
  }

  getAvailableGeographies(): string[] {
    if (!this.fund) return this.filterMeta.geographies;
    const fund = this.fund;
    return this.filterMeta.geographies.filter(
      (geography) => !fund.geographies.includes(geography)
    );
  }

  getAvailableManagers(): string[] {
    if (!this.fund) return this.filterMeta.managers;
    const fund = this.fund;
    return this.filterMeta.managers.filter(
      (manager) => !fund.managers.includes(manager)
    );
  }

  // Add selected option from dropdown
  addStrategyFromDropdown(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;
    if (!this.fund || !selectedValue) return;
    if (!this.fund.strategies) {
      this.fund.strategies = [];
    }
    if (!this.fund.strategies.includes(selectedValue)) {
      this.fund.strategies.push(selectedValue);
      this.onFieldChange();
    }
    // Reset dropdown
    target.value = '';
  }

  addGeographyFromDropdown(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;
    if (!this.fund || !selectedValue) return;
    if (!this.fund.geographies) {
      this.fund.geographies = [];
    }
    if (!this.fund.geographies.includes(selectedValue)) {
      this.fund.geographies.push(selectedValue);
      this.onFieldChange();
    }
    // Reset dropdown
    target.value = '';
  }

  addManagerFromDropdown(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;
    if (!this.fund || !selectedValue) return;
    if (!this.fund.managers) {
      this.fund.managers = [];
    }
    if (!this.fund.managers.includes(selectedValue)) {
      this.fund.managers.push(selectedValue);
      this.onFieldChange();
    }
    // Reset dropdown
    target.value = '';
  }

  goBack(): void {
    this.router.navigate(['/admin/funds']);
  }
}
