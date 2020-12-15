import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Thread } from 'src/app/types/thread';
import { User } from 'src/app/types/user';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-friends-pane',
  templateUrl: './friends-pane.component.html',
  styleUrls: ['./friends-pane.component.less']
})
export class FriendsPaneComponent implements OnInit {
  currentChat: Thread;
  chatOpen = false;
  chatRecipient: User;
  isAuthenticated: boolean;

  constructor(public userService: UserService, public messageService: MessageService, public authService: AuthService) {}

  ngOnInit(): void {
    this.authService.initializedEvent.subscribe(result => {
      if (result === 'initialized') {
        this.isAuthenticated = true;
      } else {
        this.isAuthenticated = false;
      }
    });
  }

  openChat(id: string, recipient: User): void {
    this.chatRecipient = recipient;
    const thread = this.messageService.threads.find(ref => ref.members.includes(id));
    console.log(thread);
    if (!thread) {
      this.messageService.createThread(id).then(result => {
        result.messages = [];
        console.log(result);
        this.currentChat = result;
        this.chatOpen = true;
      });
    } else {
      this.currentChat = thread;
      this.chatOpen = true;
    }
  }

  sendMessage(event: string): void {
    this.messageService.sendMessage(this.currentChat.id, event);
  }

}
