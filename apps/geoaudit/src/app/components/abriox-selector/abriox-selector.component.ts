import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbrioxEntityService } from '../../entity-services/abriox-entity.service';
import { Abriox, User } from '../../models';

@Component({
  selector: 'geoaudit-abriox-selector',
  templateUrl: './abriox-selector.component.html',
  styleUrls: ['./abriox-selector.component.scss']
})
export class AbrioxSelectorComponent implements OnInit {

  @Input() abrioxes: Array<Abriox> = [];

  selected: Array<Abriox> = [];
  allAbrioxes: Array<Abriox> = [];
  abrioxControl = new FormControl();
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredUsers: Array<User> = [];
  @ViewChild('abrioxInput') abrioxInput: ElementRef<HTMLInputElement>;
  selectable = true;
  removable = true;

  @Output() abrioxesChange: EventEmitter<Array<Abriox>> = new EventEmitter();
  
  constructor(
    private abrioxEntityService: AbrioxEntityService
  ) { }

  ngOnInit(): void {
    this.abrioxEntityService.getAll().subscribe(
      (abrioxes) => (this.allAbrioxes = abrioxes),
      (err) => {}
    );

    this.abrioxes.map((abriox) => {
      if (!this.selected.find((item) => item.id === abriox.id)) {
        this.selected.push(abriox);
      }
    });
  }

}
