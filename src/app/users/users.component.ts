import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  private readonly userService = inject(UserService);
  readonly users = toSignal(this.userService.users$, { initialValue: [] as User[] });
  editingIndex: number | null = null;
  editingUser: User | null = null;

  startEdit(index: number, user: User): void {
    this.editingIndex = index;
    this.editingUser = { ...user };
  }

  saveEdit(index: number): void {
    if (!this.editingUser) {
      return;
    }

    this.userService.updateUser(index, this.editingUser);
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingIndex = null;
    this.editingUser = null;
  }

  clearAllUsers(): void {
    if (confirm('Are you sure you want to clear all registered users? This action cannot be undone.')) {
      this.userService.clearAllUsers();
    }
  }

  removeUser(index: number): void {
    if (confirm('Delete this user? This action cannot be undone.')) {
      this.userService.removeUser(index);
    }
  }

  initials(user: User): string {
    const first = user.firstName.trim().charAt(0) || '?';
    const last = user.lastName.trim().charAt(0) || '';
    return (first + last).toUpperCase();
  }

  trackByUser(index: number, user: User): string {
    return user.email;
  }
}