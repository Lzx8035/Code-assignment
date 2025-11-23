import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Fund } from '../admin-data-table/admin-data-table.component';

@Component({
  selector: 'app-user-facing-data',
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './user-facing-data.component.html',
  styleUrl: './user-facing-data.component.scss',
  standalone: true,
})
export class UserFacingDataComponent implements OnInit {
  fund: Fund | null = null;
  loading = false;
  error: string | null = null;
  fundName: string | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
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
}
