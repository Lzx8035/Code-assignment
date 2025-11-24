import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { TagComponent } from '../tag/tag.component';

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

@Component({
  selector: 'app-funds-table',
  imports: [CommonModule, RouterModule, IconComponent, TagComponent],
  templateUrl: './funds-table.component.html',
  styleUrl: './funds-table.component.scss',
  standalone: true,
})
export class FundsTableComponent {
  @Input() funds: Fund[] = [];
  @Input() loading: boolean = false;
  @Output() editFund = new EventEmitter<string>();
  @Output() deleteFund = new EventEmitter<string>();

  getFundLink(fundName: string): string[] {
    return ['/funds', encodeURIComponent(fundName)];
  }

  onEdit(fundName: string): void {
    this.editFund.emit(fundName);
  }

  onDelete(fundName: string): void {
    this.deleteFund.emit(fundName);
  }
}
