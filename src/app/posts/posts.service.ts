import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';

// Dependency Injection, make service available for entire app (root level)
@Injectable({ providedIn: 'root' })
export class PostsService {
  // Inject HttpClient and Angular Router
  constructor(private http: HttpClient, private router: Router) {}

  private posts: Post[] = [];
  // Subject is a special Observable, which can actively trigger event (next())
  private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>(); // need to listen to this subject for emitted events

  // send HTTP request using injected HttpClient
  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    // HttpClient uses RxJS, http.get() returns an observable, need to subscribe
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        'http://localhost:3000/api/posts' + queryParams
      )
      // transform post data to include "_id" from mongodb
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator,
              };
            }),
            maxPosts: postData.maxPosts,
          };
        })
      )
      .subscribe((transformedPostData) => {
        // console.log(transformedPostData); // {posts: Array(0), maxPosts: 0}
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts,
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  // get a single post by ID to populate edit form values
  getPost(id: string) {
    // return an observable, to be subscribed later
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
    }>('http://localhost:3000/api/posts/' + id);
  }

  addPost(title: string, content: string, image: File) {
    // const post: Post = { id: null, title, content }; // json can't handle files
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string; post: Post }>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe((res) => {
        // // foloowing code removed because posts were fetched with ngOnInit in post-list component
        // // api will return imagePath
        // const post: Post = {
        //   id: res.post.id,
        //   title,
        //   content,
        //   imagePath: res.post.imagePath,
        // };
        // // // grab new post's mongo ID from HTTP response
        // // const id = res.postId;
        // // post.id = id;
        // // push to local state when post request is successful
        // this.posts.push(post);
        // // Subjects can actively trigger event, not like passive Observables
        // this.postsUpdated.next([...this.posts]); // Subject.next() will emit an event

        // Redirect user back to posts list page with Angular Router
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    // const post: Post = { id, title, content, imagePath: null }; // json can't handle file
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = { id, title, content, imagePath: image, creator: null };
    }
    this.http
      .put('http://localhost:3000/api/posts/' + id, postData)
      .subscribe((response) => {
        // // foloowing code removed because posts were fetched with ngOnInit in post-list component
        // const updatedPosts = [...this.posts];
        // const oldPostIndex = updatedPosts.findIndex((p) => p.id === id);
        // const post: Post = { id, title, content, imagePath: '' };
        // updatedPosts[oldPostIndex] = post;
        // this.posts = updatedPosts;
        // // emit event to send out updated posts array
        // this.postsUpdated.next([...this.posts]);

        // Redirect user back to posts list page with Angular Router
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    return this.http.delete('http://localhost:3000/api/posts/' + postId);
    // // foloowing code removed because the observable is subscribed in post-list.component onDelete()
    // .subscribe(() => {
    //   const updatedPosts = this.posts.filter((post) => post.id !== postId);
    //   this.posts = updatedPosts;
    //   this.postsUpdated.next([...this.posts]); // emit event from subject so whole app will know the updated posts
    // });
  }
}
