import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Importing components
import { LoginComponent } from '../components/auth/login/login.component';
import { ForgotPasswordComponent } from '../components/auth/forgot-password/forgot-password.component';
import { UpdatePasswordComponent } from '../components/auth/update-password/update-password.component';
import { RegisterComponent } from '../components/auth/register/register.component';
import { ChangePasswordComponent } from '../components/auth/change-password/change-password.component';
import { NewloginComponent } from '../components/auth/newlogin/newlogin.component';

// Auth Module routes config
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'forgotPassword', component: ForgotPasswordComponent },
  { path: 'updatePassword', component: UpdatePasswordComponent },
  { path: 'changePassword', component: ChangePasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'newlogin', component: NewloginComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
