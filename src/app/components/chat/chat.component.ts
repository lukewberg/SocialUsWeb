import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { Message } from 'src/app/types/message';
import { Comment } from '../../types/comment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.less']
})
export class ChatComponent implements OnInit {

  @Input() comment: Comment;
  @Input() message: Message;
  accountSubscription: Subscription;
  isSelf: boolean;
  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    let self = this.authService.userFirestore;
    let contentAuthorId = this.comment ? this.comment.userId : this.message ? this.message.userId : undefined;
    if (!this.authService.userFirestore) {
      this.accountSubscription = this.authService.initializedEvent.subscribe(event => {
        if (event === 'initialized') {
          if (self.id === contentAuthorId) {
            this.isSelf = true;
          } else {
            this.isSelf = false;
          }
          console.log('Chat init');
        }
      });
    } else {
      if (self.id === contentAuthorId) {
        this.isSelf = true;
      } else {
        this.isSelf = false;
      }
    }
  }

}
