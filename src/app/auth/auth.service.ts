import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthData } from './auth-data.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  private token: string; // store jwt from api
  private authStatusListener = new Subject<boolean>(); // push login status to other components

  getToken() {
    return this.token;
  }

  // getter will only return an observable, not a subject
  getAuthStatusListener() {
    // asObservable: so that other components CANNOT emit new values, only this service (Subject) can emit
    return this.authStatusListener.asObservable()
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
        this.authStatusListener.next(true); // emit logged-in status to other components (e.g. header)
      });
  }
}
