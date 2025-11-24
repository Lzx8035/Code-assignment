import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { AdminDataTableComponent } from './pages/admin-data-table/admin-data-table.component';
import { UserFacingDataComponent } from './pages/user-facing-data/user-facing-data.component';
import { AdminEditComponent } from './pages/admin-edit/admin-edit.component';

export const routes: Routes = [
  { path: 'index', component: IndexComponent },
  { path: 'admin/funds', component: AdminDataTableComponent },
  { path: 'admin/funds/:id/edit', component: AdminEditComponent },
  { path: 'funds/:id', component: UserFacingDataComponent },
  { path: '**', redirectTo: 'index' },
];
