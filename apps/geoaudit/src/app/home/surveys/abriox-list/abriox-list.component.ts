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
    this.abrioxEntityService.getWithQuery(parameters).subscribe(
      (abrioxes) => {
        console.log("abrioxes", abrioxes)
        this.abrioxes = abrioxes.filter(it => it.name != null)
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
      console.log("navigate", item, url)
      this.router.navigate([url]);
    }
  }

  addAction() {
    const url = `/home/resistivity`
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
