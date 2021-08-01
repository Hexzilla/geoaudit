import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NoteEntityService } from '../../entity-services/note-entity.service';

import { NoteFilter } from '../../models';
@Component({
  selector: 'geoaudit-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {

  filter: NoteFilter;

  notes$ = this.noteEntityService.entities$;

  // aFilter: filters;
  
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private noteEntityService: NoteEntityService
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

        this.noteEntityService.getAll();
      
        break;
    }

    this.notes$.subscribe(notes => {
      console.log('notes', notes)
    })

  }
}
