import { PostsService } from '../posts.service';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Post } from '../post.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit {
  enteredTitle = '';
  enteredContent = '';
  post: Post;
  isLoading = false;
  form: FormGroup;
  private mode = 'create';
  private postId: string;

  // Dependency Injection: add new instance of PostService class as a local property
  // Dependency Injection: add new instance of ActivatedRoute class as a local property
  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, {
        validators: [Validators.required],
      }),
    });
    // ActivatedRoute can listen to changes in URL routes
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // use observable paramMap to check wether this page is "/create" or "/edit/:postId"
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        // // this.post is used to populate form values: [ngModel]="post.title"
        // this.post = this.postsService.getPost(this.postId);
        // getPost() will return an observable
        this.postsService.getPost(this.postId).subscribe((postData) => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
          };
          // Reactive form set values
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  // // Event Binding: EventEmitter is generic type, data emitted will be "Post" type
  // @Output() postCreated = new EventEmitter<Post>();

  // newPost = 'NO CONTENT';

  // // one-way binding
  // onAddPost(postInput: HTMLTextAreaElement) {
  //   // console.dir(postInput); // postInput is the entire HTML textarea element node
  //   this.newPost = postInput.value;
  // }

  // // 2-way binding
  // onAddPost() {
  //   const post = { title: this.enteredTitle, content: this.enteredContent };
  //   // send the post data in an event to parent component (app.component.html) for event binding
  //   this.postCreated.emit(post); // "post" data will shown as $event in parent component
  // }

  // NgForm approach
  onSavePost() {
    if (this.form.invalid) return;

    this.isLoading = true; // show spinner before redirect to other pages
    if (this.mode === 'create') {
      // Dependency Injection: use addPost() method from service
      this.postsService.addPost(this.form.value.title, this.form.value.content);
    } else {
      // update post using service + DI
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content
      );
    }

    // // Event Binding
    // const post: Post = {
    //   title: form.value.title,
    //   content: form.value.content,
    // };
    // // send the post data in an event to parent component (app.component.html)
    // this.postCreated.emit(post); // "post" data will shown as $event in parent component

    // Once submitted, clear form inputs
    this.form.reset();
  }
}
