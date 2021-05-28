import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'geoaudit-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit {

  images: Array<any> = [];

  constructor() { }

  ngOnInit(): void {
  }

  onImageUpload(event): void {
    console.log('on image upload', event)

    this.images.push(event)

    // May be multiple so just preserving the previous object on the array of images

    // this.form.patchValue({
    //   image: event
    // });

    console.log('images', this.images)
  }

}
