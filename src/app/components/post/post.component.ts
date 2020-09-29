import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { User } from 'src/app/types/user';
import { Post } from 'src/app/types/post';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.less']
})
export class PostComponent implements OnInit {

  @Input() authorProfile: User;
  @Input() post: Post;
  @Input() currentUser: User;
  @ViewChild('video') video: ElementRef;
  comment: string;
  isLiked = false;
  isVideo: boolean;
  videoHeight: number;

  constructor(public postService: PostService) { }

  ngOnInit(): void {
    this.isVideo = this.post.gameType === 'videoPost' ? true : false;
  }

  postComment(): void {
    console.log(this.comment);
    this.postService.postComment(this.currentUser, this.comment, this.post).then(result => {
      this.post.comments.push(result);
      this.comment = '';
    });
  }

  likePost(): void {
    this.postService.likePost({
      likerId: this.currentUser.id,
      postId: this.post.postId,
      postOwnerId: this.post.ownerId,
      username: this.currentUser.username,
      timestamp: new Date().toISOString()
    }).then(() => {
      this.isLiked = true;
    });
  }

  toggleVideo(): void {
    if (this.video.nativeElement.paused) {
      this.video.nativeElement.play();
    } else {
      this.video.nativeElement.pause();
    }
  }

  onVideoLoad(event: any): void {
    console.log(this.video.nativeElement.videoHeight);
    console.log(event);
  }

}
