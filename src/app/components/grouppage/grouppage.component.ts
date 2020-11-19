import { Component, OnInit } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { UserService } from 'src/app/services/user.service';
import { Group } from 'src/app/types/group';
import { Post } from 'src/app/types/post';
import { User } from 'src/app/types/user';

@Component({
  selector: 'app-grouppage',
  templateUrl: './grouppage.component.html',
  styleUrls: ['./grouppage.component.less']
})
export class GrouppageComponent implements OnInit {
  group: Group;
  groupRef: DocumentReference;
  routeSubscription: Subscription;
  accountSubscription: Subscription;
  user: User;
  groupMembers = [];
  gid: string;
  isMember = false;
  posts = [];

  constructor(public userService: UserService, private router: ActivatedRoute, public authService: AuthService,
              public postService: PostService) { }

  ngOnInit(): void {
    if (!this.authService.userFirestore) {
      this.accountSubscription = this.authService.initializedEvent.subscribe(event => {
        if (event === 'initialized') {
          this.user = this.authService.userFirestore as User;
          this.init();
        }
      });
    } else {
      this.init();
    }
  }

  init(): void {
    this.routeSubscription = this.router.queryParamMap.subscribe(routeParams => {
      const gid = routeParams.get('gid');
      this.gid = gid;
      this.userService.getGroup(gid).then(result => {
        this.group = result.data() as Group;
        this.groupRef = result.ref;
        Object.keys(this.group.members).forEach(member => {
          this.userService.getUser(member).then(result => {
            this.groupMembers.push(result.data());
          });
        });
        console.log(this.group);
        this.isMember = this.groupMembers.includes(this.user.id);
      }).finally(() => {
        this.getPosts();
      });
    });
  }

  getPosts(): void {
    this.postService.getGroupPosts(this.gid).then(result => {
      if (result.length > 0) {
        if (this.isMember) {
          result.forEach(post => {
            this.posts.push(post.data() as Post);
          });
          console.log(this.posts);
        } else {
          this.posts.push(result[0].data() as Post);
          console.log(this.posts);
        }
      }
    });
  }

  getPostUser(post: Post): User {
    return this.groupMembers.find(user => user.id === post.ownerId);
  }

}
