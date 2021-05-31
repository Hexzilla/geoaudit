import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'geoaudit-attachment-card',
  templateUrl: './attachment-card.component.html',
  styleUrls: ['./attachment-card.component.scss']
})
export class AttachmentCardComponent implements OnInit {

  @Input() title;

  @Input() icon;

  constructor() { }

  ngOnInit(): void {
  }

  click(): void {

  }
}
