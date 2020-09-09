import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot, DocumentData } from '@angular/fire/firestore';
import { Post } from '../types/post';
import { Comment } from '../types/comment';
import { User } from '../types/user';
import { Like } from '../types/like';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  globalFeed: any[];

  constructor(public fireStore: AngularFirestore) { }

  /**
   * Get the posts to populate a users feed, based on a starting index.
   * @param index the starting point for the next 30 posts
   * @returns Promise<Post[]>
   */

  getGlobalFeed(user: any): Promise<QuerySnapshot<DocumentData>> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('posts', ref => ref.where('ownerId', 'in', [...Object.keys(user.data().following)])
      .orderBy('timestamp', 'desc')
      .limitToLast(50))
      .get()
      .subscribe(result => {
        this.globalFeed = result.docs;
        resolve(result);
      });
    });
  }

  getComments(postId: string, limit?: number): Promise<QuerySnapshot<DocumentData>> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('insta_comments', ref => ref.where('postId', '==', postId)
      .orderBy('timestamp', 'asc').limitToLast(limit ? limit : 50))
      .get()
      .subscribe(result => {
        resolve(result);
      }, error => {
        reject(error);
      });
    });
  }

  postComment(user: User, comment: string, post: Post): Promise<Comment> {
    return new Promise((resolve, reject) => {
      const commentObj = {
        anonymousDuration: 0,
        anonymousState: false,
        avatarUrl: user.photoUrl,
        comment,
        mediaUrl: post.mediaUrl,
        postId: post.postId,
        userId: user.id,
        timestamp: new Date().toISOString(),
        username: user.username
      };

      this.fireStore.collection('insta_comments').doc<Comment>(this.fireStore.createId())
      .set(commentObj)
      .then(result => {
        resolve(commentObj);
      }).catch(error => {
        reject(error);
      });
    });
  }

  likePost(like: Like): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('likes').doc(this.fireStore.createId())
        .set(like)
        .then(result => {
          resolve(result);
        }).catch(error => {
          reject(error);
        });
    });
  }

  createPost(post: Post): Promise<string> {
    return new Promise((resolve, reject) => {
      const postId = this.fireStore.createId();
      post.postId = postId;
      this.fireStore.collection('posts').doc(postId)
      .set(post)
      .then(result => {
        resolve(postId);
      })
      .catch(error => {
        reject(error);
      });
    });
  }
}