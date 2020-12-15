import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/types/user';
import { Post } from 'src/app/types/post';
import { QuerySnapshot } from '@angular/fire/firestore';
import { hashtag } from '../../types/hashtag';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.less']
})
export class HomepageComponent implements OnInit, OnDestroy {

  postFeed = [];
  hashtagFeed = [];
  hashtags: hashtag[] = [];
  authServiceInitialized: Subscription;
  ranges = [
    { divider: 1e9, suffix: 'B' },
    { divider: 1e6, suffix: 'M' },
    { divider: 1e3, suffix: 'K' }];
  isHashtagView = false;
  selectedHashtag: hashtag;

  constructor(public postService: PostService, public authService: AuthService, public userService: UserService) { }

  ngOnInit(): void {
    if (this.authService.userFirestore && this.authService.userFirestore.following.length > 0) {
      this.getGlobalFeed();
      this.getTrendingHashtags();
    } else {
      this.authServiceInitialized = this.authService.initializedEvent.subscribe(result => {
        if (result === 'initialized' && this.authService.userFirestore.following.length > 0) {
          this.getGlobalFeed();
          this.getTrendingHashtags();
        }
      });
    }
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

  loadHashtagPosts(hashtag: string, index: number): void {
    this.isHashtagView = true;
    this.selectedHashtag = this.hashtags[index];
    this.hashtagFeed = [];
    this.postService.getHashtagPosts(hashtag).then(result => {
      this.getComments(result);
    });
  }

  loadMoreHashtagPosts(): void {
    console.log('LOADING MORE HASHTAG POSTS');
    this.postService.getPaginatedHashtagPosts(this.selectedHashtag.id).then(result => {
      this.getComments(result);
    });
  }

  getGlobalFeed(): void {
    this.postService.getGlobalFeed(this.authService.userFirestore).then(result => {
      this.getComments(result);
    });
  }

  getTrendingHashtags(): void {
    this.postService.getTrendingHashtags().then(result => {
      result.forEach(doc => {
        let hashtag: hashtag = {
          count: doc.data().count,
          id: doc.id,
          rank: doc.data().rank,
          posts: doc.data().posts
        };
        console.log(hashtag);
        this.hashtags.push(hashtag);
      });
    });
  }

  getComments(feed: QuerySnapshot<firebase.firestore.DocumentData>): void {
    feed.docs.forEach(document => {
      this.postService.getComments(document.id).then(async comments => {
        const post = document.data();
        post.comments = [];
        comments.docs.forEach(comment => {
          post.comments.push(comment.data());
        });
        if (this.isHashtagView) {
          this.hashtagFeed.push(post);
        } else {
          this.postFeed.push(post);
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (this.authServiceInitialized) {
      this.authServiceInitialized.unsubscribe();
    }
  }

  getPostUser(post: any): User {
    return this.userService.following.find(user => user.id === post.ownerId);
  }

  onNewPost(post: Post): void {
    this.postFeed.unshift(post);
  }

  loadMorePosts(): void {
    console.log('LOADING MORE POSTS');
    this.postService.getPaginatedGlobalFeed(this.authService.userFirestore).then(result => {
      this.getComments(result);
    });
  }
}
