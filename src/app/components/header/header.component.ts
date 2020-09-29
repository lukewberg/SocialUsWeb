import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {
  searchString: string;

  constructor(public authService: AuthService, public router: Router, public messageService: MessageService,
              public postService: PostService) { }

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

  search(): void {
    this.postService.search(this.searchString).then(result => {
      console.log(result);
    })
  }

}
