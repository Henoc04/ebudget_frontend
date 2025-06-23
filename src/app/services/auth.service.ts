import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly isBrowser: boolean;

  private readonly mockUsers: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    },
    {
      id: 2,
      username: 'manager',
      email: 'manager@example.com',
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER'
    },
    {
      id: 3,
      username: 'user',
      email: 'user@example.com',
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER'
    }
  ];

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    const user = this.mockUsers.find(u => u.username === loginRequest.username);

    if (user && loginRequest.password === 'password') {
      const token = `mock-jwt-token-${user.id}-${Date.now()}`;
      const response: LoginResponse = {
        user: { ...user, token },
        token
      };

      if (this.isBrowser) {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }

      this.currentUserSubject.next(response.user);
      return of(response).pipe(delay(1000));
    }

    return throwError(() => new Error('Invalid username or password'));
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: 'ADMIN' | 'MANAGER' | 'USER'): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;

    if (role === 'ADMIN') return user.role === 'ADMIN';
    if (role === 'MANAGER') return user.role === 'ADMIN' || user.role === 'MANAGER';
    return true;
  }
}
