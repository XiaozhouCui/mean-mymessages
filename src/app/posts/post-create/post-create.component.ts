import { PostsService } from '../posts.service';
import { Component, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Post } from '../post.model';
@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent {
  // Dependency Injection: add new instance of PostService class as a local property
  constructor(public postsService: PostsService) {}

  enteredTitle = '';
  enteredContent = '';

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
  onAddPost(form: NgForm) {
    if (form.invalid) return;

    // // Event Binding
    // const post: Post = {
    //   title: form.value.title,
    //   content: form.value.content,
    // };
    // // send the post data in an event to parent component (app.component.html)
    // this.postCreated.emit(post); // "post" data will shown as $event in parent component

    // Dependency Injection: use addPost() method from service
    this.postsService.addPost(form.value.title, form.value.content);
    // Once submitted, clear form inputs
    form.resetForm();
  }
}
