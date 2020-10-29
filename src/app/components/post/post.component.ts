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
  @ViewChild('commentInput') commentInput: ElementRef;
  @ViewChild('progressBar') progressBar: ElementRef;
  @ViewChild('scrubBar') scrubBar: ElementRef;
  comment: string;
  isLiked = false;
  isVideo: boolean;
  videoHeight: number;
  videoProgress = 0;
  videoIsToggled = false;
  videoDuration: number;
  scrubPositionX = 0;
  pointerInScrub = false;
  isMouseDown = false;
  ranges = [
    { divider: 1e9, suffix: 'B' },
    { divider: 1e6, suffix: 'M' },
    { divider: 1e3, suffix: 'K' }];

  constructor(public postService: PostService) { }

  ngOnInit(): void {
    this.isVideo = this.post.gameType === 'videoPost' ? true : false;
    if (this.post.likes.includes(this.currentUser.id)) {
      this.isLiked = true;
    }
  }

  postComment(): void {
    this.postService.postComment(this.currentUser, this.comment, this.post).then(result => {
      this.post.comments.push(result);
      this.comment = '';
      this.commentInput.nativeElement.innerText = '';
    });
  }

  formatNumber(n) {
    if (n) {
      for (let i = 0; i < this.ranges.length; i++) {
        if (n >= this.ranges[i].divider) {
          return (n / this.ranges[i].divider).toString() + this.ranges[i].suffix;
        }
      }
      return n.toString();
    } else {
      return 'Unspecified';
    }
  }

  // likePost(): void {
  //   this.postService.likePost({
  //     likerId: this.currentUser.id,
  //     postId: this.post.postId,
  //     postOwnerId: this.post.ownerId,
  //     username: this.currentUser.username,
  //     timestamp: new Date().toISOString()
  //   }).then(() => {
  //     this.isLiked = true;
  //   });
  // }

  toggleVideo(): void {
    if (this.video.nativeElement.paused) {
      this.video.nativeElement.play();
      this.videoIsToggled = !this.videoIsToggled;
    } else {
      this.video.nativeElement.pause();
      this.videoIsToggled = !this.videoIsToggled;
    }
  }

  onVideoLoad(event: any): void {
    this.videoDuration = event.target.duration;
  }

  videoPlayingCallback(event: any): void {
    this.videoProgress = (event.target.currentTime / event.target.duration) * 100;
    if (event.target.currentTime === event.target.duration) {
      this.videoIsToggled = false;
    }
  }

  videoScrub(event: any): void {
    this.video.nativeElement.pause();
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - (rect.left);
    if (event.clientX !== this.scrubPositionX) {
      this.scrubPositionX = event.clientX;
    //   console.log(`X: ${x}\nClientX: ${event.clientX}\nRectLeft: ${rect.left}\nProgressWidth: ${this.progressBar.nativeElement.scrollWidth}
    // \nRectWidth: ${rect.width}`);
      this.videoProgress = (((x / this.scrubBar.nativeElement.scrollWidth) * this.videoDuration) / this.videoDuration) * 100;
      this.video.nativeElement.currentTime = (this.videoProgress / 100) * this.videoDuration;
    }
  }

  like(): void {
    if (this.isLiked) {
      this.postService.removeLike(this.post.postId, this.currentUser.id)
      .then(() => {
        this.isLiked = false;
        this.post.likes.pop();
      });
    } else {
      this.postService.likePost(this.post.postId, this.currentUser.id)
        .then(() => {
          this.isLiked = true;
          this.post.likes.push(this.currentUser.id);
        });
    }
  }

}
