import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post } from './post.model';

// Dependency Injection, make service available for entire app (root level)
@Injectable({ providedIn: 'root' })
export class PostsService {
  // Inject HttpClient
  constructor(private http: HttpClient) {}

  private posts: Post[] = [];
  // Subject is a special Observable, which can actively trigger event (next())
  private postsUpdated = new Subject<Post[]>(); // need to listen to this subject for emitted events

  // send HTTP request using injected HttpClient
  getPosts() {
    // HttpClient uses RxJs, http.get() returns an observable, need to subscribe
    this.http
      .get<{ message: string; posts: any }>('http://localhost:3000/api/posts')
      // transform post data to include "_id" from mongodb
      .pipe(
        map((postData) => {
          return postData.posts.map((post) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
            };
          });
        })
      )
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title, content };
    this.http
      .post<{ message: string, postId: string }>('http://localhost:3000/api/posts', post)
      .subscribe((res) => {
        // grab new post's mongo ID from HTTP response
        const id = res.postId;
        post.id = id;
        // push to local state when post request is successful
        this.posts.push(post);
        // Subjects can actively trigger event, not like passive Observables
        this.postsUpdated.next([...this.posts]); // Subject.next() will emit an event
      });
  }

  deletePost(postId: string) {
    this.http
      .delete('http://localhost:3000/api/posts/' + postId)
      .subscribe(() => {
        const updatedPosts = this.posts.filter((post) => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]); // emit event from subject so whole app will know the updated posts
      });
  }
}
