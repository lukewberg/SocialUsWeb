import { Injectable, EventEmitter } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { PostService } from './post.service';
import { UserService } from './user.service';
import * as firebase from 'firebase';
import { User } from '../types/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: firebase.User;
  userFirestore: User;
  initializedEvent = new EventEmitter<string>(true);

  constructor(public auth: AngularFireAuth,
              public fireStore: AngularFirestore) {
                auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                auth.onAuthStateChanged(user => {
                  if (user) {
                    this.user = user;
                    this.getUserDocument(user).then(result => {
                      this.userFirestore = result.data() as User;
                      this.initializedEvent.emit('initialized');
                    });
                  }
                });
              }

  /**
   * Create a new user in the "insta_users" database, and associate it with a user from the user database.
   * @param email email address of the user to be created.
   * @param password password for the user to be created.
   * @param username username of the user to be created
   * @param displayName public-facing name of the user to be created.
   */

  signUp(email: string, password: string, username: string, displayName: string): Promise<void> {
    return this.auth.createUserWithEmailAndPassword(email, password).then(user => {
      this.user = user.user;
      return this.fireStore.collection('users').doc(user.user.uid).set({
        bio: '',
        displayName,
        email,
        followers: [],
        following: [user.user.uid],
        friendState: [],
        groups: [],
        id: user.user.uid,
        userToken: [],
        username
      });
    });
  }

  signOut(): void {
    this.auth.signOut().then(result => {
      this.user = undefined;
    });
  }

   /**
    * Signs in an already registered user and returns a promise with the user auth object.
    * @param email user email address.
    * @param password user password.
    * @returns Promise<firebase.auth.UserCredential>
    */

  signIn(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return new Promise((resolve, reject) => {
      this.auth.signInWithEmailAndPassword(email, password).then(result => {
        this.user = result.user;
        this.getUserDocument();
        resolve(result);
      }).catch(error => {
        reject(error);
      });
    });
  }

  getUserDocument(user?: firebase.User, uid?: string): Promise<firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('users').doc(user ? user.uid : uid ? uid : this.user.uid).get().subscribe(result => {
        resolve(result);
      }, error => {
        reject(error);
      });
    });
  }
}
