import { Component, OnInit } from '@angular/core';
import { MessageService } from 'src/app/services/message.service';
import { Thread } from 'src/app/types/thread';

@Component({
  selector: 'app-messagepage',
  templateUrl: './messagepage.component.html',
  styleUrls: ['./messagepage.component.less']
})
export class MessagepageComponent implements OnInit {
  threads: Thread[];

  constructor(public messageService: MessageService) { }

  ngOnInit(): void {
    this.messageService.getThreads().then(result => {
      this.threads = result;
    });
  }

}
