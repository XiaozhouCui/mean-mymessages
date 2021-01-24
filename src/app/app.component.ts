import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';

import { Post } from './posts/post.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  // // implement Post interface
  // storedPosts: Post[] = [];

  // onPostAdded(post) {
  //   this.storedPosts.push(post);
  // }

  // inject AuthService
  constructor(private authService: AuthService) {}

  ngOnInit() {
    // auto login using local storage token
    this.authService.autoAuthUser();
  }
}
