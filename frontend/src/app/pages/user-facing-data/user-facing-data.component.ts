import {
  Component,
  OnInit,
  OnDestroy,
  Injector,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Fund } from '../../components/funds-table/funds-table.component';
import { TagListComponent } from '../../components/tag-list/tag-list.component';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-user-facing-data',
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    TagListComponent,
    IconComponent,
  ],
  templateUrl: './user-facing-data.component.html',
  styleUrl: './user-facing-data.component.scss',
  standalone: true,
})
export class UserFacingDataComponent implements OnInit, OnDestroy {
  fund: Fund | null = null;
  loading = false;
  error: string | null = null;
  fundName: string | null = null;
  private readonly platformId: Object;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private injector: Injector
  ) {
    this.platformId = this.injector.get(PLATFORM_ID);
  }

  ngOnInit(): void {
    // Disable body scroll (only in browser and on larger screens)
    if (isPlatformBrowser(this.platformId)) {
      const checkScreenSize = () => {
        if (window.innerWidth > 768) {
          document.body.style.overflow = 'hidden';
          document.documentElement.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        }
      };

      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);

      // Store cleanup function
      (this as any)._cleanupResize = () => {
        window.removeEventListener('resize', checkScreenSize);
      };
    }

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

  ngOnDestroy(): void {
    // Re-enable body scroll when component is destroyed (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';

      // Clean up resize listener
      if ((this as any)._cleanupResize) {
        (this as any)._cleanupResize();
      }
    }
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
          this.fund = data;
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

  goBack(): void {
    this.router.navigate(['/admin/funds']);
  }

  editFund(): void {
    if (!this.fundName) {
      return;
    }
    const encodedName = encodeURIComponent(this.fundName);
    this.router.navigate(['/admin/funds', encodedName, 'edit']);
  }

  deleteFund(): void {
    if (!this.fundName) {
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete "${this.fundName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    const encodedName = encodeURIComponent(this.fundName);
    this.http
      .delete(`http://localhost:3000/api/funds/${encodedName}`)
      .subscribe({
        next: () => {
          // Navigate back to the list after successful deletion
          this.router.navigate(['/admin/funds']);
        },
        error: (err) => {
          alert('Failed to delete fund. Please try again.');
          console.error('Error deleting fund:', err);
        },
      });
  }
}
