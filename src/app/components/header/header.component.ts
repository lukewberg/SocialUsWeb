import { ElementRef, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { PostService } from 'src/app/services/post.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {
  @ViewChild('searchInput') searchInput: ElementRef;
  searchString: string;
  dropdownToggled = false;
  searchResults = [];
  isFocused = false;

  constructor(public authService: AuthService, public router: Router, public messageService: MessageService,
              public postService: PostService, public userService: UserService) { }

  ngOnInit(): void {
    // this.authService.initializedEvent.subscribe(result => {
    //   if (result === 'initialized') {
        
    //   }
    // });
  }

  signOut(): void {
    this.authService.signOut();
    this.router.navigateByUrl('authenticate');
  }

  search(search: string): void {
    if (search !== '' && search.replace(/\s/g, '').length) {
      console.log(search.split(' '));
      this.searchString = search;
      this.postService.search(search).then(result => {
        console.log(result);
        this.searchResults = result;
      });
    } else {
      this.searchResults = [];
      this.searchInput.nativeElement.placeholder = 'Search for users and hashtags...'
    }
  }

  followUser(id: string, index: number): void {
    this.userService.followUser(id).then(() => {
      this.searchResults[0].hits[index].isFollowing = true;
    });
  }

  unfollowUser(id: string, index: number): void {
    this.userService.unfollowUser(id).then(() => {
      this.searchResults[0].hits[index].isFollowing = false;
    });
  }

}
