import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PostService } from '../../services/post.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { Post } from 'src/app/types/post';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-postmaker',
  templateUrl: './postmaker.component.html',
  styleUrls: ['./postmaker.component.less']
})
export class PostmakerComponent implements OnInit {
  uploadPercent: number;
  imageUrl: string;
  imagePreview: string;
  uploadFinished = false;
  fileName = '';
  postContent: string;
  @Output() newPost = new EventEmitter<Post>();

  constructor(public postService: PostService, public fireStorage: AngularFireStorage, public authService: AuthService) { }

  ngOnInit(): void {
  }

  uploadImage(event: any): void {
    const imagePreview = new FileReader();
    imagePreview.readAsDataURL(event.target.files[0]);
    imagePreview.onloadend = result => {
      this.imagePreview = imagePreview.result.toString();
    };

    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(event.target.files[0]);
    fileReader.onloadend = result => {
      const task = this.fireStorage.ref('').child(event.target.files[0].name).put(fileReader.result);
      this.fileName = event.target.files[0].name;
      task.percentageChanges().subscribe(result => {
        this.uploadPercent = result;
      });
      task.then(result => {
        result.ref.getDownloadURL().then(url => {
          this.uploadFinished = true;
          this.imageUrl = url;
        });
        console.log(result);
      });
    };
  }

  createPost() {
    const user = this.authService.userFirestore.data();
    const postObj: Post = {
      description: this.postContent,
      followerList: [],
      gameType: 'imagePost',
      hashtags: [],
      likes: [],
      location: '',
      mediaUrl: this.imageUrl,
      ownerId: user.id,
      postId: '',
      timestamp: new Date().toISOString(),
      username: user.username,
    };
    this.postService.createPost(postObj).then(result => {
      postObj.postId = result;
      this.newPost.emit(postObj);
      this.cleanFields();
    });
  }

  cleanFields(): void {
    this.uploadPercent = undefined;
    this.imageUrl = undefined;
    this.imagePreview = undefined;
    this.uploadFinished = false;
    this.fileName = '';
    this.postContent = undefined;
  }

}
