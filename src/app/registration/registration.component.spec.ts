/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { RegistrationComponent } from './registration.component';

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserService', ['addUser']);

    await TestBed.configureTestingModule({
      imports: [RegistrationComponent, ReactiveFormsModule],
      providers: [{ provide: UserService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationComponent);
    component = fixture.componentInstance;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a valid form initially', () => {
    expect(component.registrationForm.valid).toBeFalsy();
  });

  it('should validate required fields', () => {
    component.registrationForm.controls['firstName'].setValue('');
    component.registrationForm.controls['lastName'].setValue('');
    component.registrationForm.controls['email'].setValue('');
    component.registrationForm.controls['password'].setValue('');
    component.registrationForm.controls['confirmPassword'].setValue('');
    component.registrationForm.controls['phone'].setValue('');
    component.registrationForm.controls['dob'].setValue('');
    component.registrationForm.controls['country'].setValue('');
    component.registrationForm.controls['acceptTerms'].setValue(false);

    expect(component.registrationForm.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    component.registrationForm.controls['email'].setValue('invalid-email');
    expect(component.registrationForm.controls['email'].valid).toBeFalsy();
  });

  it('should validate password minimum length', () => {
    component.registrationForm.controls['password'].setValue('123');
    expect(component.registrationForm.controls['password'].valid).toBeFalsy();
  });

  it('should detect password mismatch', () => {
    component.registrationForm.controls['password'].setValue('password123');
    component.registrationForm.controls['confirmPassword'].setValue('different');
    expect(component.registrationForm.errors?.['passwordMismatch']).toBeTruthy();
  });

  it('should submit successfully with valid data and call userService.addUser', () => {
    // Set valid values for all required fields
    component.registrationForm.controls['firstName'].setValue('John');
    component.registrationForm.controls['lastName'].setValue('Doe');
    component.registrationForm.controls['email'].setValue('john@example.com');
    component.registrationForm.controls['password'].setValue('password123');
    component.registrationForm.controls['confirmPassword'].setValue('password123');
    component.registrationForm.controls['phone'].setValue('123-456-7890');
    component.registrationForm.controls['dob'].setValue('1990-01-01');
    component.registrationForm.controls['country'].setValue('United States');
    component.registrationForm.controls['acceptTerms'].setValue(true);

    spyOn(window, 'alert');
    component.onSubmit();
    
    expect(component.registrationForm.valid).toBeTruthy();
    expect(userServiceSpy.addUser).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Registration successful!');
  });
});