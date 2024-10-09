import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from '../routes/auth-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from '../components/auth/login/login.component';
import { ForgotPasswordComponent } from '../components/auth/forgot-password/forgot-password.component';
import { UpdatePasswordComponent } from '../components/auth/update-password/update-password.component';
import { RegisterComponent } from '../components/auth/register/register.component';
import { ChangePasswordComponent } from '../components/auth/change-password/change-password.component';
import { NewloginComponent } from '../components/auth/newlogin/newlogin.component';

@NgModule({
  declarations: [
  LoginComponent,
    ForgotPasswordComponent,
    UpdatePasswordComponent,
    ChangePasswordComponent,
    RegisterComponent,
    NewloginComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class AuthModule { }
