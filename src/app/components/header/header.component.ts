import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    // this.authService.initializedEvent.subscribe(result => {
    //   if (result === 'initialized') {
        
    //   }
    // });
  }

  signOut() {
    this.authService.signOut();
  }

}
