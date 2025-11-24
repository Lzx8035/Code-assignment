import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagComponent, TagType } from '../tag/tag.component';

@Component({
  selector: 'app-tag-list',
  imports: [CommonModule, TagComponent],
  templateUrl: './tag-list.component.html',
  styleUrl: './tag-list.component.scss',
  standalone: true,
})
export class TagListComponent {
  @Input() tags: string[] = [];
  @Input() type: TagType = 'strategy';

  trackByTag(index: number, tag: string): string {
    return tag;
  }
}
