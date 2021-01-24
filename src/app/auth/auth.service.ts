import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthData } from './auth-data.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  private isAuthenticated = false;
  private token: string; // store jwt from api
  private tokenTimer: any; // returned value of setTimeout()
  private userId: string;
  private authStatusListener = new Subject<boolean>(); // push login status to other components

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  // getter will only return an observable, not a subject
  getAuthStatusListener() {
    // asObservable: so that other components CANNOT emit new values, only this service (Subject) can emit
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post('http://localhost:3000/api/user/signup', authData).subscribe(
      () => {
        this.router.navigate(['/']);
      },
      (error) => {
        this.authStatusListener.next(false);
      }
    );
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http
      .post<{ token: string; expiresIn: number; userId: string }>(
        'http://localhost:3000/api/user/login',
        authData
      )
      .subscribe(
        (response) => {
          // console.log(response); // {token: "ufjkwqnepoirvcoiu"}
          const token = response.token;
          this.token = token; // store token to be added in auth header
          if (token) {
            const expiresInDuration = response.expiresIn;
            // console.log(expiresInDuration); // 43200 (12 hours)
            this.setAuthTimer(expiresInDuration); // auto logout after 12 hours
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.authStatusListener.next(true); // push logged-in status to other components (e.g. header)
            const expirationDate = new Date(
              Date.now() + expiresInDuration * 1000
            );
            // save to local storage
            this.saveAuthData(token, expirationDate, this.userId);
            // redirect upon login, using injected Router
            this.router.navigate(['/']);
          }
        },
        (error) => {
          this.authStatusListener.next(false);
        }
      );
  }

  autoAuthUser() {
    // get token and expiration from local storage
    const authInformation = this.getAuthData();
    if (!authInformation) return;
    // check if token has expired
    const expiresIn = authInformation.expirationDate.getTime() - Date.now(); // milliseconds
    // if not expired, log user in and push logged-in status to other components
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000); // auto logout after 12 hours
      this.authStatusListener.next(true); // subject can emit "true"
    }
  }

  logout() {
    this.token = null; // clear token
    this.isAuthenticated = false; // toggle status
    this.authStatusListener.next(false); // push false value to other components
    this.userId = null; // clear userId
    clearTimeout(this.tokenTimer); // clear the 12h timer for auto-logout
    this.clearAuthData(); // clear local storage
    this.router.navigate(['/']); // redirect to home page after log out
  }

  private setAuthTimer(duration: number) {
    console.log(`Token expires in: ${duration} seconds`);
    this.tokenTimer = setTimeout(() => {
      // automatically logout after [duration] seconds
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString()); // "2021-01-24T00:52:29.082Z"
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) return;
    return {
      token,
      // convert ISO string to Date object
      expirationDate: new Date(expirationDate),
      userId,
    };
  }
}
