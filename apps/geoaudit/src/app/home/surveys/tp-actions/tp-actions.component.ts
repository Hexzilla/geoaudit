import {
  Input,
  Output,
  Component,
  OnInit,
  EventEmitter,
} from '@angular/core';
import qs from 'qs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';

import * as fromApp from '../../../store';
import { TpAction } from '../../../models';
import { AlertService } from '../../../services';
import { MatDialog } from '@angular/material/dialog';
import { TpActionEntityService } from '../../../entity-services/tp-action-entity.service';
import { DeleteModalComponent } from '../../../modals/delete-modal/delete-modal.component';

@Component({
  selector: 'geoaudit-tp-actions',
  templateUrl: './tp-actions.component.html',
  styleUrls: ['./tp-actions.component.scss'],
})
export class TpActionsComponent implements OnInit {
  @Input() item_list_completed: boolean;
  @Output() change_list_state: EventEmitter<any> = new EventEmitter();

  tp_actions: Array<TpAction> = [];  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.State>,
    private tpActionEntityService: TpActionEntityService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
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
        console.log("tp-actions", actions)
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

  completed() {
    return this.item_list_completed
  }

  updateMarkState(e) {
    this.change_list_state.emit(e);
  }

  addAction() {
    const url = `/home/tp_actions/create`
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
