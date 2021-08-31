import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';

import * as fromApp from '../../../store';
import { Status, Statuses, Survey, User, Image, Job, TpAction } from '../../../models';
import { AlertService } from '../../../services';
import { StatusEntityService } from '../../../entity-services/status-entity.service';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';
import {
  debounceTime,
  tap,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';

import * as MapActions from '../../../store/map/map.actions';
import { FileTypes } from '../../../components/file-upload/file-upload.component';
import { IAlbum, Lightbox } from 'ngx-lightbox';
import { MatDialog } from '@angular/material/dialog';
import { TestpostEntityService } from '../../../entity-services/testpost-entity.service';
import { TpActionEntityService } from '../../../entity-services/tp-action-entity.service';

@Component({
  selector: 'geoaudit-tp-actions',
  templateUrl: './tp-actions.component.html',
  styleUrls: ['./tp-actions.component.scss'],
})
export class TpActionsComponent implements OnInit {
  tp_actions: Array<TpAction> = [{
    id: "1",
    date: "2021-05-21",
    testpost: {
      id: 12,
      name: "Schoole"
    },
    tp_information: null,
    current_drain: null,
    pipe_depth: null,
    reinstatement: null,
    survey: null,
    fault_detail: null,
    status: null,
    condition: {
      id: 1,
      name: "strict",
      description: "strict condition",
    },
    images: null,
    documents: null,
    comment: null,
    approved: null,
    approved_by: null,
  },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.State>,
    private statusEntityService: StatusEntityService,
    private surveyEntityService: SurveyEntityService,
    private testpostEntityService: TestpostEntityService,
    private tpActionEntityService: TpActionEntityService,
    private alertService: AlertService,
    private _lightbox: Lightbox,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    console.log("onInit");
    this.tpActionEntityService.getAll().subscribe(
      (actions) => {
        this.tp_actions = actions;
        console.log("actions", actions)
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      (err) => {}
    );
  }

  delete(): void {
    console.log("delete");
  }

  getActionDate(action) {
    return moment(action.date).format('L LT')
  }
}
