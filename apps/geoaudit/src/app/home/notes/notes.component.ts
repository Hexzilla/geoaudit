import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import qs from 'qs';
import { NoteEntityService } from '../../entity-services/note-entity.service';

import { NoteFilter } from '../../models';
import { AuthService } from '../../services';
@Component({
  selector: 'geoaudit-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit {
  
  filter: NoteFilter;

  notes$ = this.noteEntityService.entities$;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private noteEntityService: NoteEntityService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.filter = this.route.snapshot.queryParamMap.get('filter') as NoteFilter;

    if (this.filter) {
      this.query(this.filter);
    } else {
      this.noteEntityService.getAll();
    }
  }

  isRoot() {
    const { url } = this.router;
    return url === '/home/notes' || url === `/home/notes?filter=${this.filter}`;
  }

  query(attribute: string) {
    const parameters = qs.stringify({
      _where: {
        assignees: this.authService.authValue.user.id,
        [`${attribute}_null`]: false,
      },
      _sort: 'datetime:DESC',
    });

    this.noteEntityService.getWithQuery(parameters);
  }
}
