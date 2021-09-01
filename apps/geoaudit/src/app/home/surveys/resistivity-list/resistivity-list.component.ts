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
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';

import * as fromApp from '../../../store';
import { Resistivity } from '../../../models';
import { AlertService } from '../../../services';
import { MatDialog } from '@angular/material/dialog';
import { TestpostEntityService } from '../../../entity-services/testpost-entity.service';
import { TrActionEntityService } from '../../../entity-services/tr-action-entity.service';
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
    private trActionEntityService: TrActionEntityService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.update();
  }

  update() {
    this.trActionEntityService.getAll().subscribe(
      (actions) => {
        this.resistivities = actions;
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
        this.trActionEntityService.delete(item).subscribe(
          (res) => {},
          (err) => {}
        )
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
    const url = `/home/testpost/1/tr_action`
    this.router.navigate([url]);
  }

  submit() {
    console.log("submit")
  }

  getActionDate(action) {
    return moment(action.date).format('L LT')
  }
}
