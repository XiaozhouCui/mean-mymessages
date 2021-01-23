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
  private authStatusListener = new Subject<boolean>(); // push login status to other components

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  // getter will only return an observable, not a subject
  getAuthStatusListener() {
    // asObservable: so that other components CANNOT emit new values, only this service (Subject) can emit
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http
      .post('http://localhost:3000/api/user/signup', authData)
      .subscribe((response) => {
        console.log(response);
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http
      .post<{ token: string }>('http://localhost:3000/api/user/login', authData)
      .subscribe((response) => {
        // console.log(response); // {token: "ufjkwqnepoirvcoiu"}
        this.token = response.token; // store token to be added in auth header
        if (response.token) {
          this.authStatusListener.next(true); // emit logged-in status to other components (e.g. header)
          this.isAuthenticated = true;
          // redirect upon login, using injected Router
          this.router.navigate(['/']);
        }
      });
  }

  logout() {
    this.token = null; // clear token
    this.isAuthenticated = false; // toggle status
    this.authStatusListener.next(false); // push false value to other components
    this.router.navigate(['/']); // redirect to home page after log out
  }
}
