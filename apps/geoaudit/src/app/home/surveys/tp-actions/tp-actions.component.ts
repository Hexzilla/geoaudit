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
import qs from 'qs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';

import * as fromApp from '../../../store';
import { TpAction } from '../../../models';
import { AlertService } from '../../../services';
import { MatDialog } from '@angular/material/dialog';
import { TestpostEntityService } from '../../../entity-services/testpost-entity.service';
import { TpActionEntityService } from '../../../entity-services/tp-action-entity.service';
import { DeleteModalComponent } from '../../../modals/delete-modal/delete-modal.component';

@Component({
  selector: 'geoaudit-tp-actions',
  templateUrl: './tp-actions.component.html',
  styleUrls: ['./tp-actions.component.scss'],
})
export class TpActionsComponent implements OnInit {
  tp_actions: Array<TpAction> = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.State>,
    private testpostEntityService: TestpostEntityService,
    private tpActionEntityService: TpActionEntityService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.update();
  }

  update() {
    const serveyId = this.route.snapshot.params['id'];
    console.log("serveyId", serveyId);

    const parameters = qs.stringify({
      _where: {
        survey: serveyId
      }
    });
    this.tpActionEntityService.getWithQuery(parameters).subscribe(
      (actions) => {
        this.tp_actions = actions;
        console.log("actions", actions)
      },
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
        this.tpActionEntityService.delete(item).subscribe(
          (res) => {},
          (err) => {}
        )
      }
    });
  }

  navigate(item) {
    if (item.testpost) {
      const url = `/home/testposts/${item.testpost.id}/tp_action/${item.id}`
      console.log("navigate", item, url)
      this.router.navigate([url]);
    }
  }

  addAction() {
    const url = `/home/testpost/1/tp_action`
    this.router.navigate([url]);
  }

  submit() {
    console.log("submit")
  }

  getActionDate(action) {
    return moment(action.date).format('L LT')
  }
}
