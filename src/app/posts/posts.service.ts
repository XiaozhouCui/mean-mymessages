import { Injectable } from '@angular/core';
import { Post } from './post.model';

// Dependency Injection, make service available for entire app
@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];

  getPosts() {
    return [...this.posts];
  }

  addPost(title: string, content: string) {
    const post: Post = { title, content };
    this.posts.push(post);
  }
}
