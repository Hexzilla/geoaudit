import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'geoaudit-sidebar-header',
  templateUrl: './sidebar-header.component.html',
  styleUrls: ['./sidebar-header.component.scss']
})
export class SidebarHeaderComponent implements OnInit {

  @Input() title: string;

  @Input() placeholder?: string;

  @Input() reference?: string;

  constructor() { }

  ngOnInit(): void {
  }

}
