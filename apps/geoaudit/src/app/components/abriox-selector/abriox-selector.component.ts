import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { fromEvent } from 'rxjs';
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
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
  filteredAbrioxes: Array<Abriox> = [];
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

  ngAfterViewInit() {
    // Users
    fromEvent(this.abrioxInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => {
          return event.target.value;
        }),
        filter((res) => res.length >= 0),
        distinctUntilChanged()
      )
      .subscribe((text: string) => {
        this.filteredAbrioxes = this.filter(text);
      });
  }

  // Users (Assignees)
  add(event: MatChipInputEvent) {
    const value = (event.value || '').trim();

    // Add our user
    if (value) {
      const filterAllItemsOnValue = this.filter(value);

      if (filterAllItemsOnValue.length >= 1) {
        this.selected.push(filterAllItemsOnValue[0]);
      }
    }

    // Clear the input value
    this.abrioxInput.nativeElement.value = '';

    this.abrioxControl.setValue(null);

    this.abrioxesChange.emit(this.selected);
  }

  remove(user: User): void {
    const exists = this.selected.find((item) => item.id === user.id);
    if (exists) {
      this.selected = this.selected.filter((item) => item.id !== exists.id);
    }

    this.abrioxesChange.emit(this.selected);
  }

  onSelected(event: MatAutocompleteSelectedEvent) {
    this.selected.push(event.option.value);
    this.abrioxInput.nativeElement.value = '';
    this.abrioxControl.setValue(null);

    this.abrioxesChange.emit(this.selected);
  }

  filter(value: string): Array<Abriox> {
    const filterValue = value.toLowerCase();

    return this.allAbrioxes.filter((abriox) => {
      return (
        abriox?.name?.toLowerCase().indexOf(filterValue) === 0 ||
        abriox?.serial_number?.toLowerCase().indexOf(filterValue) === 0 ||
        abriox?.id?.toString() === filterValue
      );
    });
  }

}
