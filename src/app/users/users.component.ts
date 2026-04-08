import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
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
}