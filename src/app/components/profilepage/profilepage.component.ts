import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { UserService } from 'src/app/services/user.service';
import { Group } from 'src/app/types/group';
import { Post } from 'src/app/types/post';
import { User } from 'src/app/types/user';
import * as uuid from 'uuid';

@Component({
  selector: 'app-profilepage',
  templateUrl: './profilepage.component.html',
  styleUrls: ['./profilepage.component.less']
})
export class ProfilepageComponent implements OnInit, OnDestroy {
  profile: User;
  isFollowing: boolean;
  followerCount = 0;
  followingCount = 0;
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
  accountSubscription: Subscription;
  isSelf = false;
  isEditProfile = false;

  showProfileHeader = true;

  constructor(public authService: AuthService, private router: ActivatedRoute, public postService: PostService,
              public userService: UserService, public fireStorage: AngularFireStorage, public fireStore: AngularFirestore) { }

  ngOnInit(): void {
    if (this.authService.userFirestore) {
      this.getProfile();
    } else {
      this.accountSubscription = this.authService.initializedEvent.subscribe(event => {
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
            console.log(this.profile);
            this.isFollowing = this.authService.userFirestore.data().following.includes(this.profile.id);
            this.followerCount = this.profile.followers.length;
            this.followingCount = this.profile.following.length;
            this.isSelf = this.profile.id === this.authService.userFirestore.data().id;
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

  followUser(): void {
    this.userService.followUser(this.profile).then(() => {
      console.log('Followed User!');
    });
  }

  uploadProfileImages(event: any, type: 'background' | 'profile'): void {
    const file: File = event.target.files[0];
    const path = type === 'background' ? 'background_pictures/' : '';
    const fileName = `profile_${uuid.v4()}.${file.type.split('/')[1]}`;
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onloadend = result => {
      const task = this.fireStorage.ref(path).child(fileName).put(fileReader.result);
      task.then(storageSnapshot => {
        storageSnapshot.ref.getDownloadURL().then(url => {
          const payload = type === 'background' ? { backgroundPhotoUrl: url } : { photoUrl: url };
          this.userService.updateProfile(payload).then(() => {
            if (type === 'background') {
              this.profile.backgroundPhotoUrl = url;
            } else {
              this.profile.photoUrl = url;
            }
          });
        });
      });
    };

  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.observer.disconnect();
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
  }

}
