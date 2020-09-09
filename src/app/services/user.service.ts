import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AngularFirestore, AngularFirestoreDocument, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import { User } from '../types/user';
import { firestore } from 'firebase';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userAuth: firebase.User;
  following = [];
  followers: any[];

  constructor(public authService: AuthService, public fireStore: AngularFirestore) {
    // this.authService.user.then(result => {
    //   this.userAuth = result.user;
    //   this.fireStore.collection<User>('insta_users').doc<User>(this.userAuth.uid).get().subscribe(result => {
    //     this.userFirestore = result.data();
    //     console.log(result.data());
    //   });
    // });
    this.authService.initializedEvent.subscribe(result => {

      if (result === 'initialized') {
        this.getFollowing().then(result => {
          result.forEach(user => {
            this.following.push(user.data());
          });
        });
      }
    });
  }

  /**
   * Returns the user document from firebase with the provided UID
   * @param id The UID of the user you wish to retrieve from the database.
   * @returns Observable<DocumentSnapshot<DocumentData>>
   */

  getUser(id: string): Observable<firestore.DocumentSnapshot<firestore.DocumentData>> {
    return this.fireStore.collection('insta_users').doc<User>(id).get();
  }

  getFollowing(): Promise<firestore.QueryDocumentSnapshot<firestore.DocumentData>[]> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('insta_users', ref => ref.where('id', 'in',
      [...Object.keys(this.authService.userFirestore.data().following)]))
      .get()
      .subscribe(result => {
        resolve(result.docs);
      }, error => {
        reject(error);
      });
    });
  }
}
