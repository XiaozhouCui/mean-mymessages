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
    // subscribe to the injected observable (.getAuthStatusListener()) to get logged-in status
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  // unsubscribe on destroy
  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }
}
