import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  length: number;
}

@Component({
  selector: 'geoaudit-abriox-select-modal',
  templateUrl: './abriox-select-modal.component.html',
  styleUrls: ['./abriox-select-modal.component.scss']
})
export class AbrioxSelectModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AbrioxSelectModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    //
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }

}
