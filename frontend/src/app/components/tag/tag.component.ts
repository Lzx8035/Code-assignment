import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TagType = 'strategy' | 'geography' | 'manager';
export type TagSize = 'small' | 'default';

@Component({
  selector: 'app-tag',
  imports: [CommonModule],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
  standalone: true,
})
export class TagComponent {
  @Input() text: string = '';
  @Input() type: TagType = 'strategy';
  @Input() size: TagSize = 'default';
  @Input() closable: boolean = false;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
