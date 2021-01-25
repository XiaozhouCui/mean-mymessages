import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PostCreateComponent } from './post-create/post-create.component';
import { PostListComponent } from './post-list/post-list.component';
import { AngularMaterialModule } from './../angular-material.module';

@NgModule({
  declarations: [PostCreateComponent, PostListComponent],
  imports: [ReactiveFormsModule, AngularMaterialModule],
})
export class PostsModule {}
