import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
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
export class AttachmentModalComponent implements OnInit, AfterViewInit {

  API_URL: string;

  displayedColumns: string[] = ['name', 'date', 'actions'];

  dataSource: MatTableDataSource<Image>;

  length = 0;
  pageSize = 3;

  @ViewChild(MatPaginator) paginator: MatPaginator;


  constructor(
    public dialogRef: MatDialogRef<AttachmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {

    this.API_URL = environment.API_URL;

    this.dataSource = new MatTableDataSource(this.data.documents);

    this.length = this.data.documents.length;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * On click of the table row,
   * construct a link and open it for the given document.
   * The user should have a pdf, and other document
   * viewer application installed or if not
   * integrated within the browser.
   * @param row 
   */
  onRowClick(row): void {
    var a = window.document.createElement("a");
    a.href = this.API_URL + row.url;

    console.log('a', a.href)
    a.download = row.name;
    a.target = '_blank'
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

}
