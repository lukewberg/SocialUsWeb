import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AngularFireStorage } from '@angular/fire/storage';
import * as uuid from 'uuid';

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
  profilePicture: string | ArrayBuffer;
  fileType: string;
  imagePreview = '/assets/img/user-icn-white.png';

  constructor(public authService: AuthService, public router: Router, formBuilder: FormBuilder, public userService: UserService,
              public fireStorage: AngularFireStorage) {
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
      const fileName = `profile_${uuid.v4()}.${this.fileType}`;
      const task = this.fireStorage.ref('').child(fileName).put(this.profilePicture);
      task.then(storageSnapshot => {
        storageSnapshot.ref.getDownloadURL().then(url => {
          const payload = { photoUrl: url };
          this.userService.updateProfile(payload).then(() => {
            this.showError = false;
            console.log('Profile created!');
            this.router.navigateByUrl('');
          });
        });
      });
    }).catch(error => {
      this.showError = true;
      this.errorMessage = error.message;
    });
  }

  loadProfilePicture(event: any): void {
    const file: File = event.target.files[0];
    this.fileType = file.type.split('/')[1];

    const imagePreview = new FileReader();
    imagePreview.readAsDataURL(file);
    imagePreview.onloadend = result => {
      this.imagePreview = imagePreview.result.toString();
    };

    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onloadend = result => {
      this.profilePicture = fileReader.result;
    };
  }

}
