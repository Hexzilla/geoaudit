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

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    //console.log("StatusButton", this.completed, this.approved, this.isManager())
  }

  isManager() {
    //return false;
    return this.authService.authValue.user?.role?.name === Roles.MANAGER
  }

  complete() {
    this.completeEvent?.emit({ complete: true })
  }

  approve() {
    this.completeEvent?.emit({ approve: true })
  }

  refuse() {
    this.completeEvent?.emit({ refuse: true })
  }
}
