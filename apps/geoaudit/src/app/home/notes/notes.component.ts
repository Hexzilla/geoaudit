import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NoteFilter } from '../../models';
@Component({
  selector: 'geoaudit-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {

  filter: NoteFilter;

  // aFilter: filters;
  
  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.filter = this.route.snapshot.queryParamMap.get('filter') as NoteFilter;

    switch (this.filter) {
      case 'abriox':
        console.log('this one')
      break;

      case 'job':
        console.log('no this one');
      break;

      case 'resistivity':
        console.log('no this one');
      break;

      case 'site':
        console.log('no this one');
      break;

      case 'survey':
        console.log('no this one');
      break;

      case 'tp':
        console.log('no this one');
      break;

      case 'tr':
        console.log('no this one');
      break;

      default:
        // this.type = NoteTypes

        console.log('none')
      break;
    }

  }

}
