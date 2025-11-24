import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-index',
  imports: [RouterModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
  standalone: true,
})
export class IndexComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.navigate(['/admin/funds']);
  }
}
