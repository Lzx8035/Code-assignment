import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  standalone: true,
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];
  @Input() totalItems: number = 0;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  jumpToPage: string = '1';

  ngOnInit(): void {
    this.jumpToPage = this.currentPage.toString();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage']) {
      this.jumpToPage = this.currentPage.toString();
    }
  }

  handlePrev(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  handleNext(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  handlePageClick(page: number | string): void {
    if (typeof page === 'number') {
      this.pageChange.emit(page);
    }
  }

  handleJumpToPage(): void {
    const page = parseInt(this.jumpToPage);
    if (
      page >= 1 &&
      page <= this.totalPages &&
      page !== this.currentPage &&
      !Number.isNaN(page)
    ) {
      this.pageChange.emit(page);
    } else {
      // If input is invalid, reset to current page
      this.jumpToPage = this.currentPage.toString();
    }
  }

  handleJumpToPageKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.handleJumpToPage();
    }
  }

  handlePageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newPageSize = parseInt(select.value);
    this.pageSizeChange.emit(newPageSize);
  }

  getPageNumbers(): (number | string)[] {
    if (this.totalPages <= 5) {
      // When total pages <= 5, show all page numbers
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    } else {
      // When total pages > 5, show partial page numbers with ellipsis
      const showPages: (number | string)[] = [];

      // Always show first page
      showPages.push(1);

      if (this.currentPage <= 3) {
        // When current page is in first 3 pages, show 1,2,3,4,5...totalPages
        showPages.push(2, 3, 4, 5);
        if (this.totalPages > 5) {
          showPages.push('...', this.totalPages);
        }
      } else if (this.currentPage >= this.totalPages - 2) {
        // When current page is in last 3 pages, show 1...totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages
        showPages.push('...');
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          if (i > 1) showPages.push(i);
        }
      } else {
        // When current page is in middle, show 1...currentPage-1,currentPage,currentPage+1...totalPages
        showPages.push('...');
        showPages.push(
          this.currentPage - 1,
          this.currentPage,
          this.currentPage + 1
        );
        showPages.push('...', this.totalPages);
      }

      return showPages;
    }
  }

  getMobilePageNumbers(): (number | string)[] {
    if (this.totalPages <= 4) {
      // When total pages <= 4, show all page numbers
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    } else {
      // Mobile shows max 4 buttons for visual harmony
      const pages: number[] = [];

      if (this.currentPage <= 2) {
        // When current page is in first 2 pages, show 1,2,3,4
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
      } else if (this.currentPage >= this.totalPages - 1) {
        // When current page is in last 2 pages, show last 4 pages
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // When current page is in middle, show 2 pages before and after current page
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          pages.push(i);
        }
      }

      return pages;
    }
  }
}
