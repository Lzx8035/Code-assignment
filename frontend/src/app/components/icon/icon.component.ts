import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Heroicons SVG paths (from Lucide/Heroicons style)
const iconPaths: { [key: string]: string[] } = {
  pencil: [
    'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
    'm15 5 4 4',
  ],
  trash: [
    'M3 6h18',
    'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6',
    'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2',
  ],
  'arrow-left': ['m15 18-6-6 6-6'],
  'chevron-down': ['m6 9 6 6 6-6'],
};

@Component({
  selector: 'app-icon',
  imports: [CommonModule],
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      [ngClass]="className"
    >
      <path *ngFor="let path of paths" [attr.d]="path" />
    </svg>
  `,
  standalone: true,
})
export class IconComponent {
  @Input() name: string = '';
  @Input() size: number = 16;
  @Input() strokeWidth: number = 2;
  @Input() className: string = '';

  get paths(): string[] {
    return iconPaths[this.name] || [];
  }
}
