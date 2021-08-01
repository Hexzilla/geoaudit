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
  id: string;

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
    this.id = this.route.snapshot.paramMap.get('id');

    const { url } = this.router;

    if (this.filter) {
      this.query(this.filter);
    } else if (url.includes('jobs')) {
      console.log('jobs here');

      if (url.includes(`jobs/job/${this.id}/notes`)) {
        console.log('query notes for job id');
      } else {
        console.log('query notes for all jobs');
      }
    } else {
      this.noteEntityService.getAll();
    }
  }

  isRoot() {
    const { url } = this.router;
    return url === '/home/notes' || url.includes('jobs');
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
