import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
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
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  private postsSub: Subscription;

  // Dependency Injection: connect to the service upon init
  ngOnInit() {
    this.isLoading = true;
    // getPosts() method is available from service
    this.postsService.getPosts(this.postsPerPage, this.currentPage); // this will trigger HTTP request in service
    // Render posts: update this.posts using rxjs
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[]; postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
      });
  }

  // <mat-paginator (page)="fn($event)" /> event object contains pagination data
  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    // console.log(pageData); // {previousPageIndex: 1, pageIndex: 0, pageSize: 2, length: 10}
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    });
  }
}
