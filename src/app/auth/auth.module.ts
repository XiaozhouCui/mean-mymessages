import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AngularMaterialModule } from '../angular-material.module';
import { AuthRoutingModule } from './auth-routing.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [LoginComponent, SignupComponent],

  imports: [CommonModule, AngularMaterialModule, FormsModule, AuthRoutingModule],
})
export class AuthModule {}
