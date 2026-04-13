import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  profilePhotoUrl?: string | null;
  profilePhotoKey?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [];
  private usersSubject = new BehaviorSubject<User[]>(this.users);
  public users$ = this.usersSubject.asObservable();
  private readonly STORAGE_KEY = 'registered_users';

  constructor() {
    this.loadUsersFromStorage();
  }

  private isBrowserStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private loadUsersFromStorage(): void {
    if (!this.isBrowserStorageAvailable()) {
      return;
    }

    try {
      const storedUsers = window.localStorage.getItem(this.STORAGE_KEY);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
        this.usersSubject.next([...this.users]);
      }
    } catch (error) {
      console.error('Error loading users from localStorage:', error);
      this.users = [];
    }
  }

  private saveUsersToStorage(): void {
    if (!this.isBrowserStorageAvailable()) {
      return;
    }

    try {
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
  }

  addUser(user: User): void {
    this.users = [...this.users, user];
    this.usersSubject.next(this.users);
    this.saveUsersToStorage();
  }

  getUsers(): Observable<User[]> {
    return this.users$;
  }

  getUsersSnapshot(): User[] {
    return [...this.users];
  }

  clearAllUsers(): void {
    this.users = [];
    this.usersSubject.next(this.users);

    if (this.isBrowserStorageAvailable()) {
      window.localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  removeUser(index: number): void {
    if (index < 0 || index >= this.users.length) {
      return;
    }

    this.users = this.users.filter((_, i) => i !== index);
    this.usersSubject.next(this.users);
    this.saveUsersToStorage();
  }

  updateUser(index: number, user: User): void {
    if (index < 0 || index >= this.users.length) {
      return;
    }

    this.users = this.users.map((existing, i) => (i === index ? { ...user } : existing));
    this.usersSubject.next(this.users);
    this.saveUsersToStorage();
  }
}