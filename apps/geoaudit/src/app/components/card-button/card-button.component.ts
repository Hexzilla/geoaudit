import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { faListOl } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'geoaudit-card-button',
  templateUrl: './card-button.component.html',
  styleUrls: ['./card-button.component.scss']
})
export class CardButtonComponent implements OnInit {

  faListOl = faListOl;

  @Input() title;

  @Input() text;

  @Input() icon;

  @Input() placeholder?;

  @Output() onClick: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  click(): void {
    this.onClick.emit();
  }
}
