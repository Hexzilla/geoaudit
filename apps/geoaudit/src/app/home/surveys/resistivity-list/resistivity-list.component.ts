import {
  Component,
  OnInit,
} from '@angular/core';
import qs from 'qs';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Survey, Resistivity } from '../../../models';
import { MatDialog } from '@angular/material/dialog';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';
import { ResistivityEntityService } from '../../../entity-services/resistivity-entity.service';
import { DeleteModalComponent } from '../../../modals/delete-modal/delete-modal.component';

@Component({
  selector: 'geoaudit-resistivity-list',
  templateUrl: './resistivity-list.component.html',
  styleUrls: ['./resistivity-list.component.scss'],
})
export class ResistivityListComponent implements OnInit {
  private surveyId;

  survey: Survey;

  resistivities: Array<Resistivity> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyEntityService: SurveyEntityService,
    private resistivityEntityService: ResistivityEntityService,
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
    this.resistivityEntityService.getWithQuery(parameters).subscribe(
      (actions) => {
        this.resistivities = actions.filter(it => it.reference != null);
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
        this.resistivityEntityService.delete(item.id).subscribe(
          () => {
            const index = this.resistivities.indexOf(item);
            if (index >= 0) {
              this.resistivities.splice(index, 1);
            }
          }
        );
      }
    });
  }

  navigate(item) {
    this.router.navigate([`/home/resistivities/${item.id}`]);
  }

  addAction() {
    this.router.navigate([`/home/resistivities/create`]);
  }

  completed() {
    return this.survey?.resistivity_action_list_completed;
  }

  updateMarkState(e) {
    if (e.complete) {
      const payload = {
        id: this.surveyId,
        resistivity_action_list_completed: true
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

  getSubTitle(item) {
    return moment(item.date).format('L LT')
  }
}
