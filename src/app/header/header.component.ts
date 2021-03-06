import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false; // store the logged-in status
  private authListenerSubs: Subscription;

  constructor(private authService: AuthService) {}

  // Injected authService can push logged-in status to header component
  ngOnInit(): void {
    // check if auto logged-in
    this.userIsAuthenticated = this.authService.getIsAuth();
    // subscribe to the injected observable (.getAuthStatusListener()) to get logged-in status
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  onLogout() {
    // call injected logout method
    this.authService.logout();
  }

  // unsubscribe on destroy
  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }
}
