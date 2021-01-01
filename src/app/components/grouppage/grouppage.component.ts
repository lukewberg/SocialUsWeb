import { Component, OnInit } from '@angular/core';
import { DocumentReference, QuerySnapshot } from '@angular/fire/firestore';
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
  groupAdmins = [];
  gid: string;
  isMember = false;
  posts = [];
  isInvitePending = false;
  isRequestPending = false;

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
      this.user = this.authService.userFirestore as User;
      this.init();
    }
  }

  init(): void {
    this.groupAdmins = [];
    this.groupMembers = [];
    this.routeSubscription = this.router.queryParamMap.subscribe(routeParams => {
      const gid = routeParams.get('gid');
      this.gid = gid;
      this.userService.getGroup(gid).then(result => {
        this.group = result.data() as Group;
        this.groupRef = result.ref;
        this.group.members.forEach(member => {
          console.log(member.userId);
          this.userService.getUser(member.userId).then(result => {
            this.groupMembers.push(result.data());
            if (member.userId === this.user.id && member.membershipState !== 'MembershipState.pendingJoinRequest' && member.membershipState !== 'MembershipState.pendingInvite') {
              this.isMember = true;
              console.log('You are a member!')
            } else if (member.userId === this.user.id && member.membershipState === 'MembershipState.pendingJoinRequest') {
              this.isMember = false;
              this.isRequestPending = true;
            } else if (member.userId === this.user.id && member.membershipState === 'MembershipState.pendingInvite') {
              this.isMember = false;
              this.isInvitePending = true;
            }
          }).finally(() => {
            if (this.isMember) {
              console.log('User is member, getting posts!')
              this.getPosts();
            }
          });
        });
        this.group.admins.forEach(admin => {
          console.log(admin);
          this.userService.getUser(admin).then(result => {
            this.groupAdmins.push(result.data())
          })
        })
      })
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
        this.posts.push(post);
      });
    });
  }

  getPosts(): void {
    this.postService.getGroupPosts(this.gid).then(result => {
      if (result.docs.length > 0) {
        if (this.isMember) {
          this.getComments(result);
        } else {
          this.posts.push(result[0].data() as Post);
        }
      }
    });
  }

  getPostUser(post: Post): User {
    return this.groupMembers.find(user => user.id === post.ownerId);
  }

  joinGroup(): void {
    console.log('Joining group!');
    this.userService.joinGroup(this.gid).then(() => {
      this.init();
    });
  }

  requestMembership(): void {
    console.log('Requesting membership!');
    this.userService.requestGroupMembership(this.groupRef.id).then(result => {
      this.isRequestPending = true;
    })
  }

  onNewPost(post: Post): void {
    this.posts.unshift(post);
  }

}