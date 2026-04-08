import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationComponent } from './registration/registration.component';
import { UsersComponent } from './users/users.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RegistrationComponent, UsersComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-app';
  activeTab: 'registration' | 'users' = 'registration';

  setActiveTab(tab: 'registration' | 'users'): void {
    this.activeTab = tab;
  }
}
