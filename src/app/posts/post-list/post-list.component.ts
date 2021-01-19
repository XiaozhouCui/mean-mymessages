import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  // Dependency Injection: create a new property "postsService" of class PostsService
  constructor(public postsService: PostsService) {}

  // // Event Binding: bind the posts from outside [posts]
  // @Input() posts: Post[] = [];

  posts: Post[] = [];
  isLoading = false;
  private postsSub: Subscription;

  // Dependency Injection: connect to the service upon init
  ngOnInit() {
    this.isLoading = true;
    // getPosts() method is available from service
    this.postsService.getPosts(); // this will trigger HTTP request in service
    // Render posts: update this.posts using rxjs
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((posts: Post[]) => {
        this.isLoading = false;
        this.posts = posts;
      });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }

  onDelete(postId: string) {
    this.postsService.deletePost(postId);
  }
}
