import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot, DocumentData } from '@angular/fire/firestore';
import { Post } from '../types/post';
import { Comment } from '../types/comment';
import { User } from '../types/user';
import { Like } from '../types/like';
import { firestore } from 'firebase';
import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch/lite';
import { AuthService } from './auth.service';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  globalFeed: firestore.QueryDocumentSnapshot<firestore.DocumentData>[];
  hashtagFeed: firestore.QueryDocumentSnapshot<firestore.DocumentData>[];
  algoliaClient: SearchClient;
  algoliaIndex: SearchIndex;
  algoliaRequestOptions: any;

  constructor(public fireStore: AngularFirestore, public authService: AuthService, private storage: AngularFireStorage) {
    this.algoliaClient = algoliasearch('9DVS1LUIJR', 'fdb4bfd4329a2bd509392073cc64a865');
    this.algoliaIndex = this.algoliaClient.initIndex('posts');

    this.authService.initializedEvent.subscribe(result => {
      if (result === 'initialized') {
        this.algoliaRequestOptions = {
          headers: { 'X-Algolia-UserToken': this.authService.userFirestore.id }
        };
      }
    });
  }

  /**
   * Get the posts to populate a users feed, based on a starting index.
   * @returns Promise<Post[]>
   */

  getGlobalFeed(user: any): Promise<QuerySnapshot<DocumentData>> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('posts', ref => ref.where('ownerId', 'in', user.following)
      .orderBy('timestamp', 'desc')
      .limitToLast(30))
      .get()
      .subscribe(result => {
        this.globalFeed = result.docs;
        resolve(result);
      }, error => {
        reject(error);
      });
    });
  }

  getPaginatedGlobalFeed(user: any): Promise<QuerySnapshot<DocumentData>> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('posts')
      .ref.where('ownerId', 'in', user.following)
      .orderBy('timestamp', 'desc')
      .limit(30)
      .startAfter(this.globalFeed[this.globalFeed.length - 1])
      .get()
      .then(result => {
        console.log(result.docs);
        result.docs.forEach(doc => {
          this.globalFeed.push(doc);
        });
        resolve(result);
      })
      .catch(error => {
        reject(error);
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
        timestamp: firestore.Timestamp.now(),
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

  likePost(pid: string, uid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('posts').doc(pid).update({
        likes: firestore.FieldValue.arrayUnion(uid)
      })
        .then(result => {
          resolve(result);
        }).catch(error => {
          reject(error);
        });
    });
  }

  removeLike(pid: string, uid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('posts').doc(pid).update({
        likes: firestore.FieldValue.arrayRemove(uid)
      })
      .then(result => {
        resolve(result);
      }).catch(error => {
        reject(error);
      });
    });
  }

  createPost(post: Post, collection: string = 'posts'): Promise<string> {
    return new Promise((resolve, reject) => {
      const postId = this.fireStore.createId();
      post.postId = postId;
      this.fireStore.collection(collection).doc(postId)
      .set(post)
      .then(result => {
        resolve(postId);
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  getProfilePosts(profileId: string, limit?: number): Promise<firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>[]> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('posts', ref => ref.where('ownerId', '==', profileId).
      orderBy('timestamp', 'desc').limitToLast(limit ? limit : 50))
        .get()
        .subscribe(result => {
          resolve(result.docs);
        }, error => {
          reject(error);
        });
    });
  }

  search(searchString: string): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      this.algoliaClient.search([
        {
          indexName: 'users',
          query: searchString,
          params: {
            hitsPerPage: 7
          }
        },
        {
          indexName: 'groups',
          query: searchString,
          params: {
            hitsPerPage: 7
          }
        }
      ], this.algoliaRequestOptions).then(result => {
        resolve(result.results);
      })
        .catch(error => {
          reject(error);
        });
    });
  }

  getGroupPosts(gid: string): Promise<firestore.QuerySnapshot<firestore.DocumentData>> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('groups').doc(gid).collection('group_posts', ref => ref.orderBy('timestamp', 'asc').limitToLast(30))
      .get()
      .subscribe(result => {
        resolve(result);
      }, error => {
        reject(error);
      });
    });
  }

  getTrendingHashtags(): Promise<firestore.QuerySnapshot<firestore.DocumentData>> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('hashtags', ref => ref.orderBy('rank', 'desc').limit(10))
      .get()
      .subscribe(result => {
        resolve(result);
      }, error => {
        reject(error);
      });
    });
  }

  getHashtagPosts(hashtag: string): Promise<firestore.QuerySnapshot<firestore.DocumentData>> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('posts', ref => ref.where('hashtags', 'array-contains-any', [hashtag])
      .orderBy('timestamp', 'desc')
      .limit(30))
      .get()
      .subscribe(result => {
        this.hashtagFeed = result.docs;
        resolve(result);
      }, error => {
        reject(error);
      });
    });
  }

  getPaginatedHashtagPosts(hashtag: string): Promise<QuerySnapshot<DocumentData>> {
    return new Promise((resolve, reject) => {
      this.fireStore.collection('posts')
        .ref.where('hashtags', 'array-contains-any', [hashtag])
        .orderBy('timestamp', 'desc')
        .limit(30)
        .startAfter(this.hashtagFeed[this.hashtagFeed.length - 1])
        .get()
        .then(result => {
          console.log(result.docs);
          result.docs.forEach(doc => {
            this.hashtagFeed.push(doc);
          });
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  deletePost(postId: string, imageURL: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.storage.storage.refFromURL(imageURL).delete();
      await this.fireStore.collection('posts').doc(postId).delete();
      await this.fireStore.collection('insta_comments', ref => ref.where('postId', '==', postId))
      .get()
      .subscribe(result => {
        result.docs.forEach(doc => {
          doc.ref.delete();
        })
      })
      resolve();
    });
  }
}
