import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  registrationForm!: FormGroup;

  submitted = false;

  get f(): any {
    return this.registrationForm.controls;
  }

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.registrationForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s()]+$/)]],
        dob: ['', Validators.required],
        country: ['', Validators.required],
        acceptTerms: [false, Validators.requiredTrue]
      },
      { validators: this.passwordsMatch }
    );
  }

  passwordsMatch(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  }

  onSubmit() {
    this.submitted = true;

    if (this.registrationForm.valid) {
      const payload = { ...this.registrationForm.value };
      delete payload.confirmPassword;
      delete payload.acceptTerms;

      // Add user to service
      this.userService.addUser(payload as User);

      console.log('Registration submitted', payload);
      alert('Registration successful!');
      this.registrationForm.reset();
      this.submitted = false;
    }
  }
}