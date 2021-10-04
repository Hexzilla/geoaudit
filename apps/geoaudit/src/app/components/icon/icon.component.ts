import { Component, Input, OnInit } from '@angular/core';

type icons = 'radio_button_unchecked';

@Component({
  selector: 'geoaudit-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit {

  @Input() visible: boolean;

  @Input() color: string;

  @Input() icon: icons;

  constructor() { }

  ngOnInit(): void {
  }

}
