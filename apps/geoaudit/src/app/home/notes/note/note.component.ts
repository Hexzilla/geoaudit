import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { NoteEntityService } from '../../../entity-services/note-entity.service';
import { Note } from '../../../models';

@Component({
  selector: 'geoaudit-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit {

  id: string;

  form: FormGroup;

  disabled = false;

  color: ThemePalette = 'primary';

  constructor(
    private route: ActivatedRoute,
    private noteEntityService: NoteEntityService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    this.initForm();

    if (this.id) {
      this.getNoteAndPatchForm(this.id);
    } else {
      console.log('create')
    }
  }

  getNoteAndPatchForm(id: string) {
    this.noteEntityService.getByKey(id).subscribe(
      (note) => {
        this.patchForm(note);
      },

      (err) => {}
    )
  }

  initForm() {
    this.form = this.formBuilder.group({
      datetime: moment().toISOString(),
      description: null,
      images: [],
      attachmnts: [],

      assignees: [],

      abrioxes: [],
      jobs: [],
      resistivities: [],
      sites: [],
      surveys: [],
      testposts: [],
      trs: [],

      id: null // Whilst we don't edit the id, we submit the form.
    })
  }

  patchForm(note: Note) {
    this.form.patchValue({
      datetime: note.datetime
    })
  }

}
