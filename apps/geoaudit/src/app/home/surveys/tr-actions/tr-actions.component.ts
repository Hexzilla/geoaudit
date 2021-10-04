import {
  Component,
  OnInit,
} from '@angular/core';
import qs from 'qs';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Survey, TrAction } from '../../../models';
import { MatDialog } from '@angular/material/dialog';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';
import { TrActionEntityService } from '../../../entity-services/tr-action-entity.service';
import { DeleteModalComponent } from '../../../modals/delete-modal/delete-modal.component';

@Component({
  selector: 'geoaudit-tr-actions',
  templateUrl: './tr-actions.component.html',
  styleUrls: ['./tr-actions.component.scss'],
})
export class TrActionsComponent implements OnInit {
  private surveyId;

  survey: Survey;

  tr_actions: Array<TrAction> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyEntityService: SurveyEntityService,
    private trActionEntityService: TrActionEntityService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.surveyId = this.route.snapshot.params['id'];
    
    this.surveyEntityService.getByKey(this.surveyId).subscribe(
      (survey) => {
        this.survey = survey;
      },
    );

    const parameters = qs.stringify({
      _where: {
        survey: this.surveyId
      }
    });
    this.trActionEntityService.getWithQuery(parameters).subscribe(
      (actions) => {
        this.tr_actions = actions;
      },
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
        this.trActionEntityService.delete(item.id).subscribe(
          () => {
            const index = this.tr_actions.indexOf(item);
            if (index >= 0) {
              this.tr_actions.splice(index, 1);
            }
          }
        );
      }
    });
  }

  navigate(item) {
    if (item.tr) {
      this.router.navigate([`/home/trs/${item.tr.id}/tr_action/${item.id}`]);  
    }
  }

  addAction() {
    this.router.navigate([`/home/tr_action/create`]);
  }

  completed() {
    return this.survey?.tr_action_list_completed;
  }

  updateMarkState(e) {
    if (e.complete) {
      const payload = {
        id: this.surveyId,
        tr_action_list_completed: true
      };
      this.surveyEntityService.update(payload).subscribe(
        () => {
          this.router.navigate([`/home/surveys/${this.surveyId}`]);
        });
    }
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
