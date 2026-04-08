/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserService } from '../services/user.service';
import { UsersComponent } from './users.component';
import { DatePipe } from '@angular/common';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserService', ['clearAllUsers'], {
      getUsers: jasmine.createSpy('getUsers').and.returnValue(of([]))
    });

    await TestBed.configureTestingModule({
      imports: [UsersComponent, DatePipe],
      providers: [{ provide: UserService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty users array', () => {
    expect(component.users).toEqual([]);
  });

  it('should call clearAllUsers when clearAllUsers is called', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.clearAllUsers();
    expect(userServiceSpy.clearAllUsers).toHaveBeenCalled();
  });
});