import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'apps/geoaudit/src/environments/environment';

import { FileTypes } from '../../components/file-upload/file-upload.component';
import { Image } from '../../models/image.model';
export interface DialogData {
  fileType: FileTypes,
  images: Array<Image>,
  documents: Array<any>
}

@Component({
  selector: 'geoaudit-attachment-modal',
  templateUrl: './attachment-modal.component.html',
  styleUrls: ['./attachment-modal.component.scss']
})
export class AttachmentModalComponent implements OnInit {

  API_URL: string;

  displayedColumns: string[] = ['name', 'thumbnail'];

  dataSource: MatTableDataSource<Image>;



  constructor(
    public dialogRef: MatDialogRef<AttachmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {

    this.API_URL = environment.API_URL;

    console.log(this.data)

    this.dataSource = new MatTableDataSource(this.data.images);
  }

}
