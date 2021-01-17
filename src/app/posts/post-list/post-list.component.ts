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
  private postsSub: Subscription;

  // Dependency Injection: connect to the service upon init
  ngOnInit() {
    // getPosts() method is available from service
    this.posts = this.postsService.getPosts(); // this will only get an empty array, need to add listener
    // update this.posts using rxjs
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((posts: Post[]) => {
        this.posts = posts;
      });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }
}
