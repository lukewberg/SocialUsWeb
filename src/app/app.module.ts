import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { PostComponent } from './components/post/post.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { AuthpageComponent } from './components/authpage/authpage.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { ChatComponent } from './components/chat/chat.component';
import { PostmakerComponent } from './components/postmaker/postmaker.component';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { FriendsPaneComponent } from './components/friends-pane/friends-pane.component';
import { ProfilepageComponent } from './components/profilepage/profilepage.component';
import { ProfileHeaderComponent } from './components/profile-header/profile-header.component';
import { GrouppageComponent } from './components/grouppage/grouppage.component';
import { ChatPaneComponent } from './components/chat-pane/chat-pane.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MessagepageComponent } from './components/messagepage/messagepage.component';
import { TictactoeGameComponent } from './components/tictactoe-game/tictactoe-game.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PostComponent,
    HomepageComponent,
    AuthpageComponent,
    ChatComponent,
    PostmakerComponent,
    FriendsPaneComponent,
    ProfilepageComponent,
    ProfileHeaderComponent,
    GrouppageComponent,
    ChatPaneComponent,
    MessagepageComponent,
    TictactoeGameComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase, 'SocialUs-QA'),
    AngularFireModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireAnalyticsModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireFunctionsModule,
    AngularFireStorageModule,
    InfiniteScrollModule
  ],
  providers: [AngularFirestoreModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
