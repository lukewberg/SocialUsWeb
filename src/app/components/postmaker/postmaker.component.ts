import { Component, OnInit, Output, EventEmitter, ElementRef, ViewChild, Input } from '@angular/core';
import { PostService } from '../../services/post.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { Post } from 'src/app/types/post';
import { AuthService } from 'src/app/services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UploadTaskSnapshot } from '@angular/fire/storage/interfaces';
import { firestore } from 'firebase';

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
  isVideo = false;
  videoPreview: SafeUrl;
  docRef: UploadTaskSnapshot;
  @Output() newPost = new EventEmitter<Post>();
  @Input() collection: string;
  @ViewChild('postInput') postInput: ElementRef;

  constructor(public postService: PostService,
              public fireStorage: AngularFireStorage,
              public authService: AuthService,
              private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  uploadImage(event: any): void {
    const file: File = event.target.files[0];
    console.log(file);

    if (file.type.split('/')[0] === 'image') {
      const imagePreview = new FileReader();
      imagePreview.readAsDataURL(file);
      imagePreview.onloadend = result => {
        this.imagePreview = imagePreview.result.toString();
      };
    } else {
      this.videoPreview =  this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
      this.isVideo = true;
    }

    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onloadend = result => {
      const task = this.fireStorage.ref('').child(file.name).put(fileReader.result);
      this.fileName = file.name;
      task.percentageChanges().subscribe(result => {
        this.uploadPercent = result;
      });
      task.then(storageSnapshot => {
        storageSnapshot.ref.getDownloadURL().then(url => {
          this.uploadFinished = true;
          this.imageUrl = url;
        });
        this.docRef = storageSnapshot;
      });
    };

  }

  deleteFile(): void {
    if (this.docRef) {
      this.docRef.ref.delete().then(result => {
        this.cleanFields();
      });
    }
  }

  createPost(): void {
    const user = this.authService.userFirestore;
    const postObj: Post = {
      description: this.postContent,
      followerList: [],
      gameType: this.isVideo ? 'videoPost' : 'imagePost',
      hashtags: [],
      likes: [],
      location: '',
      mediaUrl: this.imageUrl ? this.imageUrl : '',
      ownerId: user.id,
      postId: '',
      timestamp: firestore.Timestamp.now(),
      username: user.username,
    };
    this.postService.createPost(postObj, this.collection).then(result => {
      postObj.postId = result;
      this.newPost.emit(postObj);
      this.cleanFields();
      this.postContent = undefined;
    });
  }

  cleanFields(): void {
    this.uploadPercent = undefined;
    this.imageUrl = undefined;
    this.imagePreview = undefined;
    this.uploadFinished = false;
    this.fileName = '';
    this.videoPreview = undefined;
    this.isVideo = false;
    this.docRef = undefined;
    this.postInput.nativeElement.innerText = '';
  }

}
