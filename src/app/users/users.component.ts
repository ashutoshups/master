import { ChangeDetectionStrategy, Component, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { S3UploadService } from '../services/s3-upload.service';

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
  private readonly s3UploadService = inject(S3UploadService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly users = toSignal(this.userService.users$, { initialValue: [] as User[] });
  private readonly signedPhotoUrls = signal<Record<string, string>>({});
  editingIndex: number | null = null;
  editingUser: User | null = null;

  constructor() {
    effect(() => {
      // During SSR, skip network calls; we'll load signed URLs in the browser after hydration.
      if (!isPlatformBrowser(this.platformId)) return;

      const users = this.users();
      for (const u of users) {
        const key = u.profilePhotoKey ?? '';
        if (!key) continue;
        if (this.signedPhotoUrls()[key]) continue;
        void this.loadSignedUrl(key);
      }
    });
  }

  photoSrc(user: User): string | null {
    const key = user.profilePhotoKey ?? '';
    // Prefer signed GET whenever a key exists (works for private buckets).
    if (key) {
      const signed = this.signedPhotoUrls()[key];
      if (signed) return signed;
    }

    // Fall back to stored public URL if present.
    return user.profilePhotoUrl ?? null;
  }

  private async loadSignedUrl(key: string): Promise<void> {
    try {
      const url = await this.s3UploadService.getSignedReadUrl(key);
      this.signedPhotoUrls.update((m) => ({ ...m, [key]: url }));
    } catch {
      // If signing fails, avatar will fall back to initials.
    }
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

  initials(user: User): string {
    const first = user.firstName.trim().charAt(0) || '?';
    const last = user.lastName.trim().charAt(0) || '';
    return (first + last).toUpperCase();
  }

  trackByUser(index: number, user: User): string {
    return user.email;
  }
}