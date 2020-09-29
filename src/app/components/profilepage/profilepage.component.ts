import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { UserService } from 'src/app/services/user.service';
import { Group } from 'src/app/types/group';
import { Post } from 'src/app/types/post';
import { User } from 'src/app/types/user';

@Component({
  selector: 'app-profilepage',
  templateUrl: './profilepage.component.html',
  styleUrls: ['./profilepage.component.less']
})
export class ProfilepageComponent implements OnInit, OnDestroy {
  profile: User;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  posts = [];
  groups: Group[];
  routeSubscription: Subscription;
  options = {
    root: document.querySelector('#profilePage'),
    rootMargin: '0px',
    threshold: 0.35
  };
  observer: IntersectionObserver;
  friends: User[];

  showProfileHeader = true;

  constructor(public authService: AuthService, private router: ActivatedRoute, public postService: PostService,
              public userService: UserService) { }

  ngOnInit(): void {
    if (this.authService.userFirestore) {
      this.getProfile();
    } else {
      this.authService.initializedEvent.subscribe(event => {
        if (event === 'initialized') {
          this.getProfile();
        }
      });
    }
    const target = document.getElementById('profileContainer');
    this.observer = new IntersectionObserver(() => {
      this.showProfileHeader = !this.showProfileHeader;
    }, this.options);
    this.observer.observe(target);

  }

  getProfile(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.routeSubscription = this.router.queryParamMap.subscribe(routeParams => {
        const uid = routeParams.get('uid');
        this.authService.getUserDocument(undefined, routeParams.get('uid'))
          .then(result => {
            this.profile = result.data() as User;
            this.isFollowing = [...Object.keys(this.authService.userFirestore.data().following)].includes(this.profile.id);
            this.followerCount = [...Object.keys(this.authService.userFirestore.data().followers)].length;
            this.followingCount = [...Object.keys(this.authService.userFirestore.data().following)].length;
            this.getProfilePosts(uid);
            this.getProfileGroups();
            this.getProfileFriends();
            resolve(uid);
          }).catch(error => {
            reject(error);
          });
      });
    });
  }

  getProfilePosts(uid: string): void {
    this.posts = [];
    this.postService.getProfilePosts(uid).then(result => {
      result.forEach(doc => {
        const post = doc.data() as Post;
        post.comments = [];
        this.postService.getComments(post.postId).then(comments => {
          comments.docs.forEach(comment => {
            post.comments.push(comment.data());
          });
        });
        this.posts.push(post);
      });
    });
  }

  getProfileGroups(): void {
    this.groups = [];
    this.userService.getUserGroups(this.profile.groups).then(groups => {
      this.groups = groups;
      console.log(groups);
    }).catch(error => {});
  }

  getProfileFriends(): void {
    this.userService.getFriends(this.profile).then(result => {
      this.friends = result;
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.observer.disconnect();
  }

}
