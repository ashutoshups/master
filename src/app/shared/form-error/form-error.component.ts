import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="invalid-feedback" *ngIf="shouldShow()">
      {{ message() }}
    </div>
  `
})
export class FormErrorComponent {
  @Input({ required: true }) control: AbstractControl | null = null;
  @Input() show = false;
  @Input() messages: Record<string, string> = {};

  shouldShow(): boolean {
    const c = this.control;
    if (!c) return false;
    return this.show && c.invalid;
  }

  message(): string {
    const errors: ValidationErrors | null | undefined = this.control?.errors;
    if (!errors) return '';

    const keys = Object.keys(errors);
    for (const key of keys) {
      if (this.messages[key]) return this.messages[key];
    }
    return this.messages['default'] ?? 'Invalid value.';
  }
}

