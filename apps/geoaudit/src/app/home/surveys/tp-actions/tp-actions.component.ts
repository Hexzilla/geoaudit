import {
  Component,
  OnInit,
} from '@angular/core';
import qs from 'qs';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Survey, TpAction } from '../../../models';
import { MatDialog } from '@angular/material/dialog';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';
import { TpActionEntityService } from '../../../entity-services/tp-action-entity.service';
import { DeleteModalComponent } from '../../../modals/delete-modal/delete-modal.component';

@Component({
  selector: 'geoaudit-tp-actions',
  templateUrl: './tp-actions.component.html',
  styleUrls: ['./tp-actions.component.scss'],
})
export class TpActionsComponent implements OnInit {
  private surveyId;

  survey: Survey;

  tp_actions: Array<TpAction> = [];  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyEntityService: SurveyEntityService,
    private tpActionEntityService: TpActionEntityService,
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
    this.tpActionEntityService.getWithQuery(parameters).subscribe(
      (actions) => {
        this.tp_actions = actions;
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
        this.tpActionEntityService.delete(item.id).subscribe(
          () => {
            const index = this.tp_actions.indexOf(item);
            if (index >= 0) {
              this.tp_actions.splice(index, 1);
            }
          }
        );
      }
    });
  }

  navigate(item) {
    if (item.testpost) {
      this.router.navigate([`/home/testposts/${item.testpost.id}/tp_action/${item.id}`]);  
    }
  }

  addAction() {
    this.router.navigate([`/home/tp_action/create`]);
  }

  completed() {
    return this.survey?.testpost_action_list_completed;
  }

  updateMarkState(e) {
    if (e.complete) {
      const payload = {
        id: this.surveyId,
        testpost_action_list_completed: true
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
