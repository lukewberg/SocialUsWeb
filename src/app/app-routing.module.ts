import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { AngularFireAuthGuard, loggedIn, redirectUnauthorizedTo, canActivate } from '@angular/fire/auth-guard';
import { AuthpageComponent } from './components/authpage/authpage.component';
import { ProfilepageComponent } from './components/profilepage/profilepage.component';
import { GrouppageComponent } from './components/grouppage/grouppage.component';
import { MessagepageComponent } from './components/messagepage/messagepage.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['authenticate']);

const routes: Routes = [
  { path: '', component: HomepageComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'profile', component: ProfilepageComponent },
  { path: 'group', component: GrouppageComponent },
  { path: 'authenticate', component: AuthpageComponent },
  { path: 'messages', component: MessagepageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
