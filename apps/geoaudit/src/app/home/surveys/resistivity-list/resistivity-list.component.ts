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
import { Resistivity } from '../../../models';
import { AlertService } from '../../../services';
import { MatDialog } from '@angular/material/dialog';
import { TestpostEntityService } from '../../../entity-services/testpost-entity.service';
import { ResistivityEntityService } from '../../../entity-services/resistivity-entity.service';
import { DeleteModalComponent } from '../../../modals/delete-modal/delete-modal.component';

@Component({
  selector: 'geoaudit-resistivity-list',
  templateUrl: './resistivity-list.component.html',
  styleUrls: ['./resistivity-list.component.scss'],
})
export class ResistivityListComponent implements OnInit {
  resistivities: Array<Resistivity> = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.State>,
    private testpostEntityService: TestpostEntityService,
    private resistivityEntityService: ResistivityEntityService,
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
    this.resistivityEntityService.getWithQuery(parameters).subscribe(
      (actions) => {
        this.resistivities = actions.filter(it => it.reference != null);
        console.log("resistivities", actions)
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
        this.resistivityEntityService.delete(item).subscribe(
          (res) => {},
          (err) => {}
        )
      }
    });
  }

  navigate(item) {
    console.log("navigate", item)
    const url = `/home/resistivities/${item.id}`
    this.router.navigate([url]);
  }

  addAction() {
    const url = `/home/resistivities/create`
    this.router.navigate([url]);
  }

  submit() {
    console.log("submit")
  }

  getSubTitle(item) {
    return moment(item.date).format('L LT')
  }
}
