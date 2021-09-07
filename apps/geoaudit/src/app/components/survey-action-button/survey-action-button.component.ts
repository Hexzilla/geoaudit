import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'geoaudit-survey-action-button',
  templateUrl: './survey-action-button.component.html',
  styleUrls: ['./survey-action-button.component.scss']
})
export class SurveyActionButtonComponent implements OnInit {

  @Input() label;
  @Input() item_list_completed: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
