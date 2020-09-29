import * as firebase from 'firebase';
export interface Thread {
    members: Array<firebase.firestore.DocumentReference>;
}