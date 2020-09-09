import { Component, OnInit, Input } from '@angular/core';
import { Comment } from '../../types/comment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.less']
})
export class ChatComponent implements OnInit {

  @Input() comment: Comment;
  constructor() { }

  ngOnInit(): void {
  }

}
