import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot, DocumentData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  friendPaneEnabled = true;
  constructor(public fireStore: AngularFirestore) { }

  
}
