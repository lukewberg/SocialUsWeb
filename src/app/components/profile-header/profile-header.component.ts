import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/types/user';
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.less']
})
export class ProfileHeaderComponent implements OnInit {

  @Input() profile: User;
  @Input() isFollowing: boolean;

  constructor(private messageService: MessageService, private userService: UserService) { }

  ngOnInit(): void {
  }

  openChat(): void {
    this.messageService.chatRecipient = this.profile;
    this,this.messageService.friendPaneEnabled = true;
    const thread = this.messageService.threads.find(ref => ref.members.includes(this.profile.id));
    console.log(thread);
    if (!thread) {
      this.messageService.createThread(this.profile.id).then(result => {
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

  followUser(): void {
    this.userService.followUser(this.profile.id).then(() => {
      this.isFollowing = true;
    })
  }

}
