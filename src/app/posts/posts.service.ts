import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Post } from './post.model';

// Dependency Injection, make service available for entire app (root level)
@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>(); // need to listen to this subject for emitted events

  getPosts() {
    return [...this.posts];
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = { title, content };
    this.posts.push(post);
    this.postsUpdated.next([...this.posts]); // Subject.next() will emit an event
  }
}
