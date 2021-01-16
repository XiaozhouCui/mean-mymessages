import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent {
  enteredTitle = '';
  enteredContent = '';
  @Output() postCreated = new EventEmitter();

  // newPost = 'NO CONTENT';

  // // one-way binding
  // onAddPost(postInput: HTMLTextAreaElement) {
  //   // console.dir(postInput); // postInput is the entire HTML textarea element node
  //   this.newPost = postInput.value;
  // }

  // 2-way binding
  onAddPost() {
    const post = { title: this.enteredTitle, content: this.enteredContent };
    // send the post data in an event to parent component (app.component.html) for event binding
    this.postCreated.emit(post); // "post" data will shown as $event in parent component
  }
}
