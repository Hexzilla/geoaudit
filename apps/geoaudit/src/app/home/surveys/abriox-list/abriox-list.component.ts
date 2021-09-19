import {
  Component,
  OnInit,
} from '@angular/core';
import qs from 'qs';
import { ActivatedRoute, Router } from '@angular/router';
import { Survey, Abriox } from '../../../models';
import { MatDialog } from '@angular/material/dialog';
import { SurveyEntityService } from '../../../entity-services/survey-entity.service';
import { AbrioxEntityService } from '../../../entity-services/abriox-entity.service';
import { TpActionEntityService } from '../../../entity-services/tp-action-entity.service';
import { TrActionEntityService } from '../../../entity-services/tr-action-entity.service';
import { DeleteModalComponent } from '../../../modals/delete-modal/delete-modal.component';

@Component({
  selector: 'geoaudit-abriox-list',
  templateUrl: './abriox-list.component.html',
  styleUrls: ['./abriox-list.component.scss'],
})
export class AbrioxListComponent implements OnInit {
  private surveyId;

  survey: Survey;

  total_abrioxes: Array<Abriox> = [];

  abrioxes: Array<Abriox> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyEntityService: SurveyEntityService,
    private abrioxEntityService: AbrioxEntityService,
    private tpActionEntityService: TpActionEntityService,
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

    this.abrioxEntityService.getAll().subscribe(
      (abrioxes) => {
        this.total_abrioxes = abrioxes.filter(it => it.name != null)
        this.getAbrioxesFromActions(this.surveyId)        
      },
    );
  }

  private getAbrioxesFromActions(surveyId) {
    const parameters = qs.stringify({
      _where: {
        survey: surveyId
      }
    });
    this.tpActionEntityService.getWithQuery(parameters).subscribe(
      (tp_actions) => {
        tp_actions.map(action => {
          if (action.testpost?.abriox) {
            const abrioxId = Number(action.testpost['abriox'])
            const abriox = this.total_abrioxes.find(a => a.id == abrioxId);
            abriox && this.abrioxes.push(abriox);
          }
        })
      },
    );
    this.trActionEntityService.getWithQuery(parameters).subscribe(
      (tr_actions) => {
        tr_actions.map(action => {
          if (action.testpost?.abriox) {
            const abrioxId = Number(action.testpost['abriox'])
            const abriox = this.total_abrioxes.find(a => a.id == abrioxId);
            abriox && this.abrioxes.push(abriox);
          }
        })
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
        this.abrioxEntityService.delete(item.id).subscribe(
          () => {
            const index = this.abrioxes.indexOf(item);
            if (index >= 0) {
              this.abrioxes.splice(index, 1);
            }
          }
        );
      }
    });
  }

  navigate(item) {
    this.router.navigate([`/home/abriox_action/${item.id}`]);
  }

  addAction() {
    this.router.navigate([`/home/abriox_action/create`]);
  }

  completed() {
    return this.survey?.abriox_action_list_completed;
  }

  updateMarkState(e) {
    if (e.complete) {
      const payload = {
        id: this.surveyId,
        abriox_action_list_completed: true
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
    //return ''//moment(action.date).format('L LT')
    return item.condition?.name
  }
}
