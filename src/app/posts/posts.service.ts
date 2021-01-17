import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Post } from './post.model';

// Dependency Injection, make service available for entire app (root level)
@Injectable({ providedIn: 'root' })
export class PostsService {
  // Inject HttpClient
  constructor(private http: HttpClient) {}

  private posts: Post[] = [];
  // Subject is a special Observable, which can actively trigger event (next())
  private postsUpdated = new Subject<Post[]>(); // need to listen to this subject for emitted events

  getPosts() {
    // send HTTP request using injected HttpClient
    this.http
      .get<{ message: string; posts: Post[] }>(
        'http://localhost:3000/api/posts'
      )
      // HttpClient uses RxJs, http.get() returns an observable, need to subscribe
      .subscribe((postData) => {
        this.posts = postData.posts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title, content };
    this.posts.push(post);
    // Subjects can actively trigger event, not like passive Observables
    this.postsUpdated.next([...this.posts]); // Subject.next() will emit an event
  }
}
