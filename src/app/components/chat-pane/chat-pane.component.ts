import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MessageService } from 'src/app/services/message.service';
import { Thread } from 'src/app/types/thread';
import { User } from 'src/app/types/user';

@Component({
  selector: 'app-chat-pane',
  templateUrl: './chat-pane.component.html',
  styleUrls: ['./chat-pane.component.less']
})
export class ChatPaneComponent implements OnInit, AfterViewInit {

  @Input() thread: Thread;
  @Input() profile: User;
  @Output() chatClosed = new EventEmitter<boolean>();
  @Output() sendMessage = new EventEmitter<string>();
  message: string;
  @ViewChild('messageInput') messageInput: ElementRef;
  @ViewChild('messageContainer') messageContainer: ElementRef;

  constructor(public messageService: MessageService, public cd: ChangeDetectorRef) {
    this.messageService.newMessage.subscribe(message => {
      this.cd.detectChanges();
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
  }

  closeChat(): void {
    this.chatClosed.emit(true);
  }

  emitAndClear(): void {
    this.sendMessage.emit(this.message);
    this.message = '';
    this.messageInput.nativeElement.innerText = '';
    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
  }

  keyCheck(event: any): void {
    if (event.key === 'Enter' && this.message.length > 0) {
      this.emitAndClear();
    }
  }

}
