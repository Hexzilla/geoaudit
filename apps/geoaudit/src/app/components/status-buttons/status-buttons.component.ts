import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from '../../services';
import { Roles } from '../../models';

@Component({
  selector: 'geoaudit-status-buttons',
  templateUrl: './status-buttons.component.html',
  styleUrls: ['./status-buttons.component.scss']
})
export class StatusButtonsComponent implements OnInit {

  @Input() completed: boolean;
  @Input() approved: boolean;
  @Output() completeEvent?: EventEmitter<unknown> = new EventEmitter();

  constructor(private authService: AuthService) { 
  }

  ngOnInit(): void {}

  isManager() {
    return this.authService.authValue.user.role.name === Roles.MANAGER
  }

  complete() {
    this.completeEvent?.emit({ complete: true })
  }
}
