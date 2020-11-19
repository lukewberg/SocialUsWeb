import { EventEmitter, Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot, DocumentData, QueryDocumentSnapshot, DocumentReference } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Thread } from '../types/thread';
import { Message } from '../types/message';
import { firestore } from 'firebase';
import { User } from '../types/user';
import { NewMessage } from '../types/newMessage';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  friendPaneEnabled = true;
  threads: Thread[];
  newMessage = new EventEmitter<NewMessage>();

  constructor(public fireStore: AngularFirestore, public authService: AuthService) {
    this.authService.initializedEvent.subscribe(result => {
      if (result === 'initialized') {
        this.threads = [];
        this.getThreads().then(result => {
          this.threads = result;
        });
      }
    });
  }

  getThreads(): Promise<Thread[]> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('messages-test', ref =>
      ref.where('members', 'array-contains', this.authService.userFirestore.id))
      .get()
      .subscribe(result => {
        const threads = [];
        result.docs.forEach(doc => {
          this.getMessages(doc.ref).then(messages => {
            const thread = doc.data() as Thread;
            thread.messages = messages.length > 0 ? messages : [];
            thread.id = doc.id;
            this.authService.getUserDocument(undefined, doc.data().members.find(ref => ref !== this.authService.userFirestore.id))
            .then(user => {
              thread.profile = user.data() as User;
              threads.push(thread);
              this.messageListner(doc);
            });
          });
        });
        resolve(threads as Thread[]);
      }, error => {
        reject(error);
      });
    });
  }

  messageListner(doc: QueryDocumentSnapshot<DocumentData>): void {
    doc.ref.collection('messages').orderBy('timestamp', 'desc').onSnapshot(message => {
      if (message.docs.length > 0) {
        //const processedMessage = message.docs[0].data() as Message;
        const processedMessage = message.docChanges().find(ref => ref.type === 'added').doc.data() as Message;
        const thread = this.threads.find(ref => ref.id === doc.id);
        const threadIndex = this.threads.indexOf(thread);
        console.log(thread);
        this.threads[threadIndex].messages = [...thread.messages, processedMessage];
        this.newMessage.emit({message: processedMessage, threadIndex});
      }
    });
  }

  getMessages(thread: DocumentReference): Promise<Message[]> {
    return new Promise((resolve, reject) => {
      thread.collection('messages').orderBy('timestamp', 'asc').get().then(result => {
        const messages = [];
        result.docs.forEach(doc => {
          messages.push(doc.data());
        });
        messages.pop();
        resolve(messages as Message[]);
      }).catch(error => {
        reject(error);
      });
    });
  }

  createThread(id: string, chatName?: string): Promise<Thread> {
    const chatId = this.fireStore.createId();
    return new Promise((resolve, reject) => {
      const thread = this.fireStore.collection('messages-test').doc<Thread>(chatId);
      thread.set({
          groupChatName: chatName ? chatName : '',
          members: [
            id,
            this.authService.userFirestore.id
          ]
        }).then(result => {
          thread.get().subscribe(result => {
            const thread = result.data();
            thread.messages = [];
            thread.id = chatId;
            this.messageListner(result);
            resolve(thread as Thread);
            this.threads.push(thread as Thread);
          });
        }).catch(error => {
          reject(error);
        });
    });
  }

  sendMessage(id: string, message: string, mediaUrl?: string): Promise<any> {
    const self = this.authService.userFirestore as User;
    return new Promise((resolve, reject) => {
      this.fireStore.collection('messages-test').doc(id).collection('messages')
      .doc<Message>(this.fireStore.createId())
      .set({
        userId: self.id,
        message,
        timestamp: firestore.Timestamp.now(),
        mediaUrl: mediaUrl ? mediaUrl : '',
      }).then(result => {
        console.log(`Sent message: ${message}`);
        resolve(result);
      }).catch(error => {
        reject(error);
      });
    });
  }
}
