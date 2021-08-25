import { Component, Input, Output, OnInit, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import qs from 'qs';
import { NoteEntityService } from '../../entity-services/note-entity.service';

import { NoteFilter } from '../../models';
import { AuthService } from '../../services';
@Component({
  selector: 'geoaudit-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit, OnChanges {

  @Input() viewMode;
  @Output() viewModeChange = new EventEmitter();

  id: string;

  filter: NoteFilter;

  notes$ = this.noteEntityService.entities$;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private noteEntityService: NoteEntityService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.filter = this.route.snapshot.queryParamMap.get('filter') as NoteFilter;
    this.id = this.route.snapshot.paramMap.get('id');
    const { url } = this.router;
    
    if (this.filter) {
      this.query(this.filter);
    } else if (
      url.includes('abrioxes') ||
      url.includes('jobs') ||
      url.includes('resistivities') ||
      url.includes('sites') ||
      url.includes('surveys') ||
      url.includes('testposts') ||
      url.includes('trs')
    ) {
      const includes = url.split('/');

      // if (url.includes(`${includes[2]}/${this.id}/notes`)) {
      if (url.includes(`${includes[2]}/${this.id}`)) {
        this.query(includes[2], Number(this.id));
      } else {
        this.query(includes[2]);
      }
    } else {
      this.noteEntityService.getAll();
    }
  }

  ngOnChanges(changes: SimpleChanges): void{
    
  }

  isRoot() {
    const { url } = this.router;
    return (
      url === '/home/notes' ||
      url === `/home/notes?filter=${this.filter}` ||
      url.includes('abrioxes') ||
      url.includes('jobs') ||
      url.includes('resistivities') ||
      url.includes('sites') ||
      url.includes('surveys') ||
      url.includes('testposts') ||
      url.includes('trs')
    );
  }

  query(attribute: string, id?: number) {
    let where = {
      assignees: this.authService.authValue.user.id,
      [`${attribute}_null`]: false,
    };

    if (id) {
      where = {
        ...where,
        [`${attribute}`]: id,
      };
    }

    const parameters = qs.stringify({
      _where: where,
      _sort: 'datetime:DESC',
    });

    this.noteEntityService.getWithQuery(parameters);
  }

  isCoreNotesComponent() {
    const { url } = this.router;

    return url.includes('notes');
  }

  /**
   * Adding a note, we may add a note without any associate to an
   * abriox or a job for example but we may also be looking 
   * at the list of notes whilst under jobs/2 or jobs/2/notes for examples.
   * 
   * We should take into account what our url is such that we can 
   * pass the correct parameters such that we can automatically
   * populate the fields for jobs for example.
   */
  add() {
    this.viewMode = 1;
    this.viewModeChange.emit(1);
  }

  isListViewMode() {
    return this.viewMode === 0;
  }
}
