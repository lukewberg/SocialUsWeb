import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { User } from 'src/app/types/user';
import { Post } from 'src/app/types/post';
import { TicTacToePost } from 'src/app/types/ticTacToePost';
import { PostService } from 'src/app/services/post.service';
import { UserService } from 'src/app/services/user.service';
import * as moment from 'moment';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.less']
})
export class PostComponent implements OnInit {

  @Input() authorProfile: User;
  @Input() post: Post & TicTacToePost;
  @Input() currentUser: User;
  @Output() onHashtagClicked = new EventEmitter<string>();
  @Output() onImageClicked = new EventEmitter<{post: Post, postAuthor: User}>();
  @ViewChild('video') video: ElementRef;
  @ViewChild('commentInput') commentInput: ElementRef;
  @ViewChild('progressBar') progressBar: ElementRef;
  @ViewChild('scrubBar') scrubBar: ElementRef;
  opponentProfile: User;
  comment: string;
  isLiked = false;
  isVideo: boolean;
  isGame: boolean;
  isTicTacToe: boolean;
  gameSymbol = '';
  videoHeight: number;
  videoProgress = 0;
  videoIsToggled = false;
  videoDuration: number;
  scrubPositionX = 0;
  pointerInScrub = false;
  isMouseDown = false;
  moment = moment;
  ranges = [
    { divider: 1e9, suffix: 'B' },
    { divider: 1e6, suffix: 'M' },
    { divider: 1e3, suffix: 'K' }
  ];
  flyoutOpen = false;
  deleteOpen = false;
  isDeleted = false;

  constructor(public postService: PostService, public userService: UserService) { }

  ngOnInit(): void {
    this.isVideo = this.post.gameType === 'videoPost';
    this.isGame = this.post.gameType !== 'imagePost' && this.post.gameType !== 'videoPost';
    this.isTicTacToe = this.post.gameType === 'tictactoe';
    if (this.isGame) {
      this.userService.getUser(
        this.post.playerOneId === this.authorProfile.id ? this.post.playerTwoId : this.post.playerOneId
      ).then(result => {
        this.opponentProfile = result.data() as User;
      });
    } else if (this.isGame && this.isTicTacToe) {
      if (this.post.playerOneId === this.currentUser.id && this.post.turn % 2 === 0) {
        this.gameSymbol = 'X';
      } else if (this.post.playerTwoId === this.currentUser.id && this.post.turn % 2 !== 0) {
        this.gameSymbol = 'O';
      }
    }
    if (this.post.likes) {
      this.isLiked = this.post.likes.includes(this.currentUser.id);
    }
  }

  parseUsernameMentions(description: string): string {
    let mentionText = description.replace(/[@]+[A-Za-z0-9-_]+/g, (u): string => {
      return `<span class="profile-handle">${u}</span>`;
    });
    let hashtagText = mentionText.replace(/(^|\B)#(?![0-9_]+\b)([a-zA-Z0-9_]{1,30})(\b|\r)/g, (u): string => {
      return `<span class="hashtag">${u}</span>`
    })
    return hashtagText;
  }

  postComment(): void {
    this.postService.postComment(this.currentUser, this.comment, this.post).then(result => {
      this.post.comments.push(result);
      this.comment = '';
      this.commentInput.nativeElement.innerText = '';
    });
  }

  formatNumber(n: number): string {
    if (n) {
      for (let i = 0; i < this.ranges.length; i++) {
        if (n >= this.ranges[i].divider) {
          return Math.floor(n / this.ranges[i].divider).toString() + this.ranges[i].suffix;
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

  openDeleteModal(): void {
    this.flyoutOpen = false;
    this.deleteOpen = true;
  }

  deletePost(): void {
    this.postService.deletePost(this.post.postId, this.post.mediaUrl).then(() => {
      this.isDeleted = true;
    })
  }

  imageClicked(): void {
    this.onImageClicked.emit({
      post: this.post,
      postAuthor: this.authorProfile
    })
  }

}
