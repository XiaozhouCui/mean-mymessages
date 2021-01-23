import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { AuthData } from '../auth-data.model';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  isLoading = false;

  // Inject authService
  constructor(public authService: AuthService) {}

  onSignup(form: NgForm) {
    // console.log(form.value); // { email: "blahblah", password: "blahblah" }
    if (form.invalid) return;
    this.authService.createUser(form.value.email, form.value.password);
  }
}
