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
import * as moment from 'moment';

import { Abriox } from '../../../models';
import { AlertService } from '../../../services';
import { MatDialog } from '@angular/material/dialog';
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
  abrioxes: Array<Abriox> = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private abrioxEntityService: AbrioxEntityService,
    private tpActionEntityService: TpActionEntityService,
    private trActionEntityService: TrActionEntityService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    const serveyId = this.route.snapshot.params['id'];

    const parameters = qs.stringify({
      _where: {
        survey: serveyId
      }
    });
    this.abrioxEntityService.getWithQuery(parameters).subscribe(
      (abrioxes) => {
        this.abrioxes = abrioxes.filter(it => it.name != null)
        this.getAbrioxesFromActions(serveyId)        
      },
      (err) => {}
    );
  }

  private getAbrioxesFromActions(serveyId) {
    const parameters = qs.stringify({
      _where: {
        survey: serveyId
      }
    });
    this.tpActionEntityService.getWithQuery(parameters).subscribe(
      (actions) => {
        //console.log("tp-actions", actions)
      },
      (err) => {}
    );
    this.trActionEntityService.getWithQuery(parameters).subscribe(
      (actions) => {
        //console.log("tp-actions", actions)
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
        //delete
      }
    });
  }

  navigate(item) {
    if (item.testpost) {
      const url = `/home/testpost/${item.testpost.id}/tr_action/${item.id}`
      this.router.navigate([url]);
    }
  }

  addAction() {
    const url = `/home/abrioxes_actions/create`
    this.router.navigate([url]);
  }

  submit() {
    console.log("submit")
  }

  getSubTitle(item) {
    //return ''//moment(action.date).format('L LT')
    return item.condition?.name
  }
}
