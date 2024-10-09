import { Routes } from '@angular/router';
import { LoginComponent } from './common/login/login.component';
import { HomepageComponent } from './common/homepage/homepage.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'homepage', component: HomepageComponent },
];
