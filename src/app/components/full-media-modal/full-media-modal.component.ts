import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Post } from 'src/app/types/post';
import { User } from 'src/app/types/user';

@Component({
  selector: 'app-full-media-modal',
  templateUrl: './full-media-modal.component.html',
  styleUrls: ['./full-media-modal.component.less']
})
export class FullMediaModalComponent implements OnInit {
  @Input() post: Post;
  @Input() authorProfile: User;
  image: HTMLImageElement;
  @Output() onModalClosed = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
    this.image = new Image();
    this.image.src = this.post.mediaUrl;

    if (this.image.width > 1200 || this.image.height > 900) {
      if (this.image.width > 1200) {
        const ratio = this.image.width / this.image.height;
        const overshoot = this.image.width - 1200;
        const new_y = ((this.image.width - overshoot ) / this.image.width) * this.image.height

        this.image.width = this.image.width - overshoot;
        this.image.height = new_y;
      }
      if (this.image.height > 900) {
        const ratio = this.image.height / this.image.width;
        const overshoot = this.image.height - 900;
        const new_x = ((this.image.height - overshoot) / this.image.height) * this.image.width

        this.image.height = this.image.height - overshoot;
        this.image.width = new_x;
      }
    }
  }

  closeModal(): void {
    this.onModalClosed.emit();
  }

}
