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
import { TrAction } from '../../../models';
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
    const serveyId = this.route.snapshot.params['id'];
    console.log("serveyId", serveyId);

    const parameters = qs.stringify({
      _where: {
        survey: serveyId
      }
    });
    this.trActionEntityService.getWithQuery(parameters).subscribe(
      (actions) => {
        this.tr_actions = actions;
        console.log("tr-actions", actions)
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
        this.trActionEntityService.delete(item).subscribe(
          (res) => {},
          (err) => {}
        )
      }
    });
  }

  navigate(item) {
    if (item.testpost) {
      const url = `/home/testposts/${item.testpost.id}/tr_action/${item.id}`
      console.log("navigate", item, url)
      this.router.navigate([url]);
    }
  }

  addAction() {
    const url = `/home/tr_actions/create`
    this.router.navigate([url]);
  }

  submit() {
    console.log("submit")
  }

  getSubTitle(action) {
    const date = action.date ? moment(action.date).format('L LT') : '';
    const condition = action.condition?.name || '';
    return `${date} - ${condition}`
  }
}
