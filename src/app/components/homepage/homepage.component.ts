import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/types/user';
import { Post } from 'src/app/types/post';
import { QuerySnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.less']
})
export class HomepageComponent implements OnInit, OnDestroy {

  postFeed = [];
  authServiceInitialized: Subscription;

  constructor(public postService: PostService, public authService: AuthService, public userService: UserService) { }

  ngOnInit(): void {
    if (this.authService.userFirestore && this.authService.userFirestore.following.length > 0) {
      this.getGlobalFeed();
    } else {
      this.authServiceInitialized = this.authService.initializedEvent.subscribe(result => {
        if (result === 'initialized') {
          this.getGlobalFeed();
        }
      });
    }
  }

  getGlobalFeed(): void {
    this.postService.getGlobalFeed(this.authService.userFirestore).then(result => {
      this.getComments(result);
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
        this.postFeed.push(post);
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
