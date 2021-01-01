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

  friendPaneEnabled = false;
  chatPaneEnabled = false;
  currentThread: Thread;
  threads: Thread[];
  newMessage = new EventEmitter<NewMessage>();
  chatOpen = false;
  chatRecipient: User;

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

  updateOrder(thread: Thread): void {
    // find index
    var index = this.threads.findIndex(o => o.id === thread.id);
    // if already at start, nothing to do
    if (index === 0) return;
    // remove old occurrency, if existing
    if (index > 0) {
      this.threads.splice(index, 1);
    }
    // add thread to the start
    this.threads.unshift(thread);
    // keep array at the correct size
    this.threads.length = Math.min(this.threads.length, 4);
  }

  getThreads(): Promise<Thread[]> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('messages', ref =>
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
              this.messageListener(doc);
            });
          });
        });
        resolve(threads as Thread[]);
      }, error => {
        reject(error);
      });
    });
  }

  messageListener(doc: QueryDocumentSnapshot < DocumentData > ): void {
    doc.ref.collection('messages').orderBy('timestamp', 'desc').onSnapshot(message => {
      if (message.docChanges().length > 0) {
        //const processedMessage = message.docs[0].data() as Message;
        const processedMessage = message.docChanges().find(ref => ref.type === 'added').doc.data() as Message;
        const thread = this.threads.find(ref => ref.id === doc.id);
        this.updateOrder(thread);
        const threadIndex = this.threads.indexOf(thread);
        this.threads[threadIndex].messages = [...thread.messages, processedMessage];
        // if (!this.chatPaneEnabled || this.chatPaneEnabled && this.currentThread.id !== thread.id) {
        //   console.log('UNREAD MESSAGE')
        //   thread.messages[thread.messages.length - 1].read = false;
        // }
        this.newMessage.emit({
          message: processedMessage,
          threadIndex
        });
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
      const thread = this.fireStore.collection('messages').doc<Thread>(chatId);
      thread.set({
          groupChatName: chatName ? chatName : '',
          members: [
            id,
            this.authService.userFirestore.id
          ],
          count: 0
        }).then(result => {
          thread.get().subscribe(result => {
            const thread = result.data();
            thread.messages = [];
            thread.id = chatId;
            this.messageListener(result);
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
      this.fireStore.collection('messages').doc(id).collection('messages')
      .doc<Message>(this.fireStore.createId())
      .set({
        authorId: self.id,
        message,
        timestamp: firestore.Timestamp.now(),
        mediaUrl: mediaUrl ? mediaUrl : '',
      }).then(async result => {
        await this.fireStore.collection('messages').doc(id).update({
          count: firestore.FieldValue.increment(1)
        });
        // var thread = this.threads[this.threads.findIndex(o => o.id === id)]
        // this.updateOrder(thread);
        resolve(result);
      }).catch(error => {
        reject(error);
      });
    });
  }
}
