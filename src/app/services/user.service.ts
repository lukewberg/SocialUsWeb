import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AngularFirestore, AngularFirestoreDocument, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import { User } from '../types/user';
import { Group } from '../types/group';
import { firestore } from 'firebase';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userAuth: firebase.User;
  following = [];
  followers: User[];
  friends: User[];

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
        console.log('Getting following...');
        this.getFollowing().then(result => {
          result.forEach(user => {
            this.following.push(user.data());
          });
        }).catch(error => {
          console.log('Looks like there are no followers');
        });
        this.getFriends(this.authService.userFirestore as User).then(result => {
          this.friends = result;
        });
      }
    });
  }

  /**
   * Returns the user document from firebase with the provided UID
   * @param id The UID of the user you wish to retrieve from the database.
   * @returns Observable<DocumentSnapshot<DocumentData>>
   */

  getUser(id: string): Promise<firestore.DocumentSnapshot<firestore.DocumentData>> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('users').doc<User>(id)
      .get()
      .subscribe(result => {
        resolve(result);
      }, error => {
        reject(error);
      });
    });
  }

  getFollowing(): Promise<firestore.QueryDocumentSnapshot<firestore.DocumentData>[]> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('users', ref => ref.where('id', 'in',
      this.authService.userFirestore.following))
      .get()
      .subscribe(result => {
        resolve(result.docs);
      }, error => {
        reject(error);
      });
    });
  }

  getFriends(profile: User): Promise<User[]> {
    return new Promise((resolve, reject) => {
      let friends = [];
      for (const friend of Object.keys(profile.friendState)) {
        this.fireStore.collection('users').doc(friend)
          .get()
          .subscribe(result => {
            friends.push(result.data());
          }, error => {
            reject(error);
          });
      }
      resolve(friends as User[]);
    });
  }

  followUser(id: string): Promise<void> {
    this.authService.userFirestore.following.push(id);
    return new Promise((resolve, reject) => {
      this.fireStore.collection('users').doc(id).update({
        followers: firestore.FieldValue.arrayUnion(this.authService.userFirestore.id)
      });
      console.log(this.authService.userFirestore.id);
      this.fireStore.collection('users').doc(this.authService.userFirestore.id).update({
        following: firestore.FieldValue.arrayUnion(id)
      }).then(() => {
        resolve();
      }, error => {
        reject(error);
      });
    });
  }

  unfollowUser(id: string): Promise<void> {
    this.authService.userFirestore.following.splice(this.authService.userFirestore.following.indexOf(id), 1);
    return new Promise((resolve, reject) => {
      this.fireStore.collection('users').doc(id).update({
        followers: firestore.FieldValue.arrayRemove(this.authService.userFirestore.id)
      });
      this.fireStore.collection('users').doc(this.authService.userFirestore.id).update({
        following: firestore.FieldValue.arrayRemove(id)
      }).then(() => {
        resolve();
      });
    });
  }

  getUserGroups(groups: string[]): Promise<Group[]> {
    return new Promise((resolve, reject) => {
      let results = [];
      if (groups.length > 0) {
        console.log(groups);
        for (let groupId of groups) {
          this.fireStore.collection('groups').doc(groupId)
            .get()
            .subscribe(result => {
              results.push(result.data() as Group);
            }, error => {
              reject(error);
            });
        }
        resolve(results);
      } else {
        reject();
      }
    });
  }

  getGroup(gid: string): Promise<firestore.DocumentSnapshot<firestore.DocumentData>> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('groups').doc(gid)
      .get()
      .subscribe(result => {
        resolve(result);
      }, error => {
        reject(error);
      });
    });
  }

  updateProfile(payload: object): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('users').doc(this.authService.userFirestore.id).update(payload)
        .then(result => {
          resolve(result);
        }).catch(error => {
          reject(error);
        });
    });
  }

  joinGroup(gid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('groups').doc(gid).update({
        members: firestore.FieldValue.arrayUnion({userId: this.authService.userFirestore.id, membershipState: 'MembershipState.member'})
      }).then(result => {
        resolve(result);
      }).catch(error => {
        reject(error);
      });
      this.fireStore.collection('users').doc(this.authService.userFirestore.id).update({
        groups: firestore.FieldValue.arrayUnion(gid)
      });
    });
  }

  requestGroupMembership(gid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('groups').doc(gid).update({
        members: firestore.FieldValue.arrayUnion({
          userId: this.authService.userFirestore.id,
          membershipState: 'MembershipState.pendingJoinRequest'
        })
      }).then(result => {
        resolve(result);
      }, error => {
        reject(error);
      })
    });
  }
}
