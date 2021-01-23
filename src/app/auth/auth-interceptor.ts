import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

// Inject a service into another service
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Inject auth service into interceptor service
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.authService.getToken();
    // create a copy of the original request and add an auth header
    const authRequest = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${authToken}`)
    })
    return next.handle(authRequest);
  }
}
