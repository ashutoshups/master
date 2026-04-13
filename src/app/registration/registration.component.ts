import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { UserService, User } from '../services/user.service';
import { FormErrorComponent } from '../shared/form-error/form-error.component';

type RegistrationFormModel = {
  profilePhoto: FormControl<File | null>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  phone: FormControl<string>;
  dob: FormControl<string>;
  acceptTerms: FormControl<boolean>;
};

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormErrorComponent],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  @ViewChild('registrationFormEl') private registrationFormEl?: ElementRef<HTMLFormElement>;

  registrationForm: FormGroup<RegistrationFormModel>;
  submitted = false;
  photoPreviewUrl: string | null = null;
  isSubmitting = false;

  get f(): RegistrationFormModel {
    return this.registrationForm.controls;
  }

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.registrationForm = this.fb.nonNullable.group(
      {
        profilePhoto: new FormControl<File | null>(null),
        firstName: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
        lastName: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
        email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
        password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
        confirmPassword: this.fb.nonNullable.control('', [Validators.required]),
        phone: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^[0-9\-\+\s()]+$/)]),
        dob: this.fb.nonNullable.control('', [Validators.required]),
        acceptTerms: this.fb.nonNullable.control(false, [Validators.requiredTrue])
      },
      { validators: [RegistrationComponent.passwordsMatch] }
    );
  }

  static passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value as string | null | undefined;
    const confirmPassword = control.get('confirmPassword')?.value as string | null | undefined;
    if (!password || !confirmPassword) return null;
    return password !== confirmPassword ? { passwordMismatch: true } : null;
  }

  onSubmit() {
    this.submitted = true;

    this.registrationForm.markAllAsTouched();
    this.registrationForm.updateValueAndValidity();

    if (this.registrationForm.invalid) {
      this.focusFirstInvalidControl();
      return;
    }

    if (this.registrationForm.valid) {
      this.isSubmitting = true;
      const { firstName, lastName, email, phone, dob } = this.registrationForm.getRawValue();
      const payload: User = {
        profilePhotoUrl: this.photoPreviewUrl,
        firstName,
        lastName,
        email,
        phone,
        dob
      };

      // Add user to service
      this.userService.addUser(payload);

      console.log('Registration submitted', payload);
      alert('Registration successful!');
      this.registrationForm.reset();
      this.photoPreviewUrl = null;
      this.submitted = false;
      this.isSubmitting = false;
    }
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    this.registrationForm.patchValue({ profilePhoto: file });
    this.registrationForm.get('profilePhoto')?.markAsDirty();

    if (!file) {
      this.photoPreviewUrl = null;
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.photoPreviewUrl = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreviewUrl = typeof reader.result === 'string' ? reader.result : null;
    };
    reader.readAsDataURL(file);
  }

  private focusFirstInvalidControl(): void {
    const form = this.registrationFormEl?.nativeElement;
    if (!form) return;

    const el = form.querySelector<HTMLElement>(
      'input.ng-invalid, select.ng-invalid, textarea.ng-invalid'
    );
    el?.focus?.();
  }
}