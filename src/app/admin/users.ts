import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth';

interface User {
  id: number;
  email: string;
  role: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = true;
  error = false;
  private subscription = new Subscription();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('UsersComponent - ngOnInit: fetching users');
    // Check role again (though guard already does it)
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role !== 'admin') {
      this.error = true;
      this.loading = false;
      return;
    }
    this.loadUsers();
  }

  ngOnDestroy(): void {
    console.log('UsersComponent - ngOnDestroy: cleaning up');
    this.subscription.unsubscribe();
  }

  private loadUsers(): void {
    this.loading = true;
    this.subscription.add(
      this.http.get<User[]>('http://localhost:3000/users').subscribe({
        next: (users) => {
          // Remove passwords from response (json-server returns all fields)
          this.users = users.map(({ id, email, role }) => ({ id, email, role }));
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = true;
          this.loading = false;
        }
      })
    );
  }
}