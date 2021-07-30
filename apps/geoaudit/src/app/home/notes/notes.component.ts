import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NoteTypes } from '../../models';
@Component({
  selector: 'geoaudit-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const type = this.route.snapshot.queryParamMap.get('type').toUpperCase();

    switch (type) {
      case NoteTypes.ABRIOX:
        console.log('this one')
      break;

      case NoteTypes.JOB:
        console.log('no this one');
      break;

      case NoteTypes.RESISTIVITY:
        console.log('no this one');
      break;

      case NoteTypes.SITE:
        console.log('no this one');
      break;

      case NoteTypes.SURVEY:
        console.log('no this one');
      break;

      case NoteTypes.TP:
        console.log('no this one');
      break;

      case NoteTypes.TR:
        console.log('no this one');
      break;
    }

  }

}
