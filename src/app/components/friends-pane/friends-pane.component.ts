import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-friends-pane',
  templateUrl: './friends-pane.component.html',
  styleUrls: ['./friends-pane.component.less']
})
export class FriendsPaneComponent implements OnInit {

  constructor(public userService: UserService, public messageService: MessageService) { }

  ngOnInit(): void {
  }

}
