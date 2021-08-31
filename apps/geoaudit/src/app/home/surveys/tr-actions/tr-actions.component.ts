import {
  Component,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';

import * as fromApp from '../../../store';
import { Status, Statuses, Survey, User, Image, Job, TrAction } from '../../../models';
import { AlertService } from '../../../services';
import { MatDialog } from '@angular/material/dialog';
import { TestpostEntityService } from '../../../entity-services/testpost-entity.service';
import { TrActionEntityService } from '../../../entity-services/tr-action-entity.service';
import { DeleteModalComponent } from '../../../modals/delete-modal/delete-modal.component';

@Component({
  selector: 'geoaudit-tr-actions',
  templateUrl: './tr-actions.component.html',
  styleUrls: ['./tr-actions.component.scss'],
})
export class TrActionsComponent implements OnInit {
  tr_actions: Array<TrAction> = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.State>,
    private testpostEntityService: TestpostEntityService,
    private trActionEntityService: TrActionEntityService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.update();
  }

  update() {
    this.trActionEntityService.getAll().subscribe(
      (actions) => {
        this.tr_actions = actions;
        console.log("actions", actions)
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      (err) => {}
    );
  }

  delete(item): void {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      data: {
        length: 1,
      },
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trActionEntityService.delete(item).subscribe(
          (res) => {},
          (err) => {}
        )
      }
    });
  }

  navigate(item) {
    if (item.testpost) {
      const url = `/home/testpost/${item.testpost.id}/tr_action/${item.id}`
      console.log("navigate", item, url)
      this.router.navigate([url]);
    }
  }

  addAction() {
    const url = `/home/testpost/1/tr_action`
    this.router.navigate([url]);
  }

  submit() {
    console.log("submit")
  }

  getActionDate(action) {
    return moment(action.date).format('L LT')
  }
}
