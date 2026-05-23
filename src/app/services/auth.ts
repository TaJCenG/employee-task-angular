import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { User } from '../shared/models/user.model';

@Injectable({
  providedIn: 'root'  // singleton throughout app
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check localStorage on service initialization (ngOnInit not available in services)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);
    }
  }

  login(email: string, password: string): Observable<User> {
    // json-server supports filtering: /users?email=xxx&password=yyy
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${email}&password=${password}`)
      .pipe(
        map(users => {
          if (users && users.length === 1) {
            const user = users[0];
            // Don't store password in localStorage
            const { password, ...safeUser } = user;
            localStorage.setItem('currentUser', JSON.stringify(safeUser));
            this.currentUserSubject.next(safeUser as User);
            this.isLoggedInSubject.next(true);
            return safeUser as User;
          } else {
            throw new Error('Invalid credentials');
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }
}