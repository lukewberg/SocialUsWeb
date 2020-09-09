import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-authpage',
  templateUrl: './authpage.component.html',
  styleUrls: ['./authpage.component.less']
})
export class AuthpageComponent implements OnInit {
  email: string;
  password: string;
  isAuthenticating = false;
  isCreateAccount = false;
  signUpForm: FormGroup;
  showError = false;
  errorMessage: string;

  constructor(public authService: AuthService, public router: Router, formBuilder: FormBuilder, public userService: UserService) {
    this.signUpForm = formBuilder.group({
      email: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      displayName: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
  }

  signIn(): void {
    this.isAuthenticating = true;
    this.authService.signIn(this.email, this.password).then(result => {
      console.log(result.user);
      this.isAuthenticating = false;
      this.router.navigateByUrl('');
    });
  }

  signInReturn(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.email && this.password) {
      this.signIn();
    }
  }

  createAccount(): void {
    this.authService.signUp(
      this.signUpForm.value.email,
      this.signUpForm.value.password,
      this.signUpForm.value.username,
      this.signUpForm.value.displayName
    ).then(result => {
      this.showError = false;
      this.router.navigateByUrl('');
    }).catch(error => {
      this.showError = true;
      this.errorMessage = error.message;
    });
  }

}
