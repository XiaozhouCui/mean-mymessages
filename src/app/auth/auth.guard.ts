import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

// need @Injectable() when injecting services into services
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const isAuth = this.authService.getIsAuth(); // getter fn returns a boolean
    if (!isAuth) {
      // if not logged in, redirect user to login page
      this.router.navigate(['/auth/login'])
    }
    return isAuth;
  }
}
