import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Thread } from 'src/app/types/thread';
import { User } from 'src/app/types/user';
import { MessageService } from '../../services/message.service';
import { NewMessage } from '../../types/newMessage';

@Component({
  selector: 'app-friends-pane',
  templateUrl: './friends-pane.component.html',
  styleUrls: ['./friends-pane.component.less']
})
export class FriendsPaneComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean;
  isNewThread = false;
  following: User[] = [];
  newMessageEmitter: Subscription;

  constructor(public userService: UserService, public messageService: MessageService, public authService: AuthService, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.authService.initializedEvent.subscribe(result => {
      if (result === 'initialized') {
        this.isAuthenticated = true;
        this.newMessageEmitter = this.messageService.newMessage.subscribe(result => {
          const newMessage = result as NewMessage;
          this.changeDetectorRef.detectChanges();
        });
      } else {
        this.isAuthenticated = false;
      }
    });
  }

  openChat(id: string, recipient: User): void {
    this.messageService.chatRecipient = recipient;
    const thread = this.messageService.threads.find(ref => ref.members.includes(id));
    console.log(thread);
    if (!thread) {
      this.messageService.createThread(id).then(result => {
        result.messages = [];
        console.log(result);
        this.messageService.currentThread = result;
        this.messageService.chatOpen = true;
      });
    } else {
      this.messageService.currentThread = thread;
      this.messageService.chatOpen = true;
    }
  }

  sendMessage(event: string): void {
    this.messageService.sendMessage(this.messageService.currentThread.id, event);
  }

  composeNewThread(): void {
    this.isNewThread = true;
    this.following = [];
    this.userService.getFollowing().then(result => {
      result.forEach(doc => {
        this.following.push(doc.data() as User);
      })
    });
  }

  cancelThreadComposition(): void {
    this.isNewThread = false;
  }

  ngOnDestroy(): void {
    this.newMessageEmitter.unsubscribe();
    this.changeDetectorRef.detach()
  }

}
