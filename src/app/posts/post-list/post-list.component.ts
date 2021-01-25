import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  // inject PostsService and AuthService
  constructor(
    public postsService: PostsService,
    private authService: AuthService
  ) {}

  // // Event Binding: bind the posts from outside [posts]
  // @Input() posts: Post[] = [];

  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated: boolean = false; // logged-in status to be used in template
  userId: string; // used for user authorisation in template
  private postsSub: Subscription;
  private authStatusSub: Subscription;

  // Dependency Injection: connect to the service upon init
  ngOnInit() {
    this.isLoading = true;
    // getPosts() method is available from service
    this.postsService.getPosts(this.postsPerPage, this.currentPage); // this will trigger HTTP request in service
    this.userId = this.authService.getUserId();
    // Render posts: update this.posts using rxjs
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[]; postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
      });
    // Get login status when first rendered
    this.userIsAuthenticated = this.authService.getIsAuth();
    // .getAuthStatusListener() will return an observable, subscribe to get login status "true" or "false"
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      // listen to events for login, logout and switching users
      .subscribe((isAuthenticated) => {
        // store the login status in local public veriable
        this.userIsAuthenticated = isAuthenticated;
        // update user ID in template for *ngIf
        this.userId = this.authService.getUserId();
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

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(
      () => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy() {
    // Subscriptions need to unsubscribe
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
