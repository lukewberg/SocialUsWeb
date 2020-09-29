import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { AngularFireAuthGuard, loggedIn, redirectUnauthorizedTo, canActivate } from '@angular/fire/auth-guard';
import { AuthpageComponent } from './components/authpage/authpage.component';
import { ProfilepageComponent } from './components/profilepage/profilepage.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['authenticate']);

const routes: Routes = [
  { path: '', component: HomepageComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'profile', component: ProfilepageComponent },
  { path: 'authenticate', component: AuthpageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
