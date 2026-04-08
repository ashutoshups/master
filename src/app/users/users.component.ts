import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  users$!: Observable<User[]>;
  editingIndex: number | null = null;
  editingUser: User | null = null;

  constructor(private userService: UserService) {
    this.users$ = this.userService.users$;
  }

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

  trackByUser(index: number, user: User): string {
    return user.email;
  }
}