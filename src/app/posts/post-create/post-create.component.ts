import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { PostsService } from '../posts.service';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  post: Post;
  isLoading = false;
  form: FormGroup; // reactive form instance
  imagePreview: string;
  private mode = 'create';
  private postId: string;
  private authStatusSub: Subscription;

  // Dependency Injection to add local properties: postService and route
  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        // if the login status changes, remove the spinner
        this.isLoading = false;
      });
    // reactive form
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, {
        validators: [Validators.required],
      }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType], // only accept .jpg .png .gif...
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
            imagePath: postData.imagePath,
            creator: postData.creator,
          };
          // Reactive form set values
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath,
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

  // Reactive Form approach

  onImagePicked(event: Event) {
    // type conversion to HTML Intput Element
    const file = (event.target as HTMLInputElement).files[0];
    // patch FormGroup with a file object
    this.form.patchValue({ image: file });
    // recalculate FormGroup value
    this.form.get('image').updateValueAndValidity();
    // convert image to data url, for <img/> preview
    const reader = new FileReader();
    reader.onload = () => {
      // reading file is async process
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) return;

    this.isLoading = true; // show spinner before redirect to other pages
    if (this.mode === 'create') {
      // Dependency Injection: use addPost() method from service
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else {
      // update post using service + DI
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
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

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
