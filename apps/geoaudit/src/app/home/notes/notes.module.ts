import { NgModule } from '@angular/core';
import { NotesComponent } from './notes.component';
import { NoteComponent } from './note/note.component';
import { SharedModule } from '../shared.module';
import { NotesRoutingModule } from './notes-routing.module';

@NgModule({
  declarations: [
    NotesComponent,
    NoteComponent
  ],
  imports: [
    NotesRoutingModule,

    SharedModule
  ],
  exports: [
    NotesComponent
  ]
})
export class NotesModule { }
