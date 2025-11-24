import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

export interface DropdownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-custom-dropdown',
  imports: [CommonModule, IconComponent],
  templateUrl: './custom-dropdown.component.html',
  styleUrl: './custom-dropdown.component.scss',
  standalone: true,
})
export class CustomDropdownComponent implements OnInit, OnDestroy {
  @Input() options: DropdownOption[] = [];
  @Input() selectedValues: string[] = [];
  @Input() placeholder: string = 'Select...';
  @Input() multiple: boolean = false;
  @Input() displayValue?: string; // For single select, custom display value
  @Input() active: boolean = false; // Whether dropdown is active (has selection)
  @Input() isOpen: boolean = false; // External control of open state
  @Output() selectionChange = new EventEmitter<string[]>();
  @Output() isOpenChange = new EventEmitter<boolean>();

  private internalIsOpen = false;

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.closeOnOutsideClick);
    }
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.closeOnOutsideClick);
    }
  }

  get isDropdownOpen(): boolean {
    return this.isOpen !== undefined ? this.isOpen : this.internalIsOpen;
  }

  private closeOnOutsideClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.close();
    }
  };

  onToggle(event: Event): void {
    event.stopPropagation();
    if (this.isOpen !== undefined) {
      // External control
      this.isOpenChange.emit(!this.isOpen);
    } else {
      // Internal control
      this.internalIsOpen = !this.internalIsOpen;
    }
  }

  private close(): void {
    if (this.isOpen !== undefined) {
      this.isOpenChange.emit(false);
    } else {
      this.internalIsOpen = false;
    }
  }

  get displayText(): string {
    if (this.multiple) {
      return this.selectedValues.length > 0
        ? `${this.selectedValues.length} selected`
        : this.placeholder;
    } else {
      if (this.displayValue) {
        return this.displayValue;
      }
      const selected = this.options.find(
        (opt) => opt.value === this.selectedValues[0]
      );
      return selected ? selected.label : this.placeholder;
    }
  }

  onOptionClick(option: DropdownOption, event: Event): void {
    event.stopPropagation();
    if (this.multiple) {
      this.toggleMultiple(option.value);
    } else {
      this.selectSingle(option.value);
    }
  }

  private toggleMultiple(value: string): void {
    const index = this.selectedValues.indexOf(value);
    if (index > -1) {
      this.selectedValues.splice(index, 1);
    } else {
      this.selectedValues.push(value);
    }
    this.selectionChange.emit([...this.selectedValues]);
  }

  private selectSingle(value: string): void {
    this.selectedValues = [value];
    this.selectionChange.emit([...this.selectedValues]);
    this.close();
  }

  isSelected(value: string): boolean {
    return this.selectedValues.includes(value);
  }
}
