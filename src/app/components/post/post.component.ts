import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/types/user';
import { Post } from 'src/app/types/post';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.less']
})
export class PostComponent implements OnInit {

  @Input() authorProfile: User;
  @Input() post: Post;
  @Input() currentUser: User;
  comment: string;
  isLiked = false;

  constructor(public postService: PostService) { }

  ngOnInit(): void {}

  postComment(): void {
    console.log(this.comment);
    this.postService.postComment(this.currentUser, this.comment, this.post).then(result => {
      this.post.comments.push(result);
      this.comment = '';
    });
  }

  likePost(): void {
    this.postService.likePost({
      likerId: this.currentUser.id,
      postId: this.post.postId,
      postOwnerId: this.post.ownerId,
      username: this.currentUser.username,
      timestamp: new Date().toISOString()
    }).then(() => {
      this.isLiked = true;
    });
  }

}
