import { ENTER, COMMA } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { fromEvent } from 'rxjs';
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
import { AbrioxEntityService } from '../../entity-services/abriox-entity.service';
import { Abriox, User } from '../../models';

type Selectors =
  | 'abriox'
  | 'job'
  | 'resistivity'
  | 'site'
  | 'survey'
  | 'tp'
  | 'tr';

@Component({
  selector: 'geoaudit-abriox-selector',
  templateUrl: './abriox-selector.component.html',
  styleUrls: ['./abriox-selector.component.scss'],
})
export class AbrioxSelectorComponent implements OnInit, AfterViewInit {
  @Input() selector: Selectors;

  @Input() label: string;

  @Input() placeholder: string;

  @Input() items: Array<any> = [];

  selectedItems: Array<any> = [];
  allItems: Array<any> = [];
  itemControl = new FormControl();
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredItems: Array<Abriox> = [];
  @ViewChild('itemInput') itemInput: ElementRef<HTMLInputElement>;
  selectable = true;
  removable = true;

  @Output() itemsChange: EventEmitter<Array<any>> = new EventEmitter();

  constructor(private abrioxEntityService: AbrioxEntityService) {}

  ngOnInit(): void {
    switch (this.selector) {
      case 'abriox':
        this.abrioxEntityService.getAll().subscribe(
          (abrioxes) => {
            console.log('abrioxes', abrioxes);
            this.allItems = abrioxes;
          },
          (err) => {}
        );
        break;

      case 'job':
        break;

      case 'resistivity':
        break;

      case 'site':
        break;

      case 'survey':
        break;

      case 'tp':
        break;

      case 'tr':
        break;
    }

    this.items.map((item) => {
      if (
        !this.selectedItems.find((selectedItem) => selectedItem.id === item.id)
      ) {
        this.selectedItems.push(item);
      }
    });
  }

  ngAfterViewInit() {
    // Users
    fromEvent(this.itemInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => {
          return event.target.value;
        }),
        filter((res) => res.length >= 0),
        distinctUntilChanged()
      )
      .subscribe((text: string) => {
        this.filteredItems = this.filter(text);
      });
  }

  // Users (Assignees)
  add(event: MatChipInputEvent) {
    const value = (event.value || '').trim();

    // Add our user
    if (value) {
      const filterAllItemsOnValue = this.filter(value);

      if (filterAllItemsOnValue.length >= 1) {
        this.selectedItems.push(filterAllItemsOnValue[0]);
      }
    }

    // Clear the input value
    this.itemInput.nativeElement.value = '';

    this.itemControl.setValue(null);

    this.itemsChange.emit(this.selectedItems);
  }

  remove(user: User): void {
    const exists = this.selectedItems.find((item) => item.id === user.id);
    if (exists) {
      this.selectedItems = this.selectedItems.filter(
        (item) => item.id !== exists.id
      );
    }

    this.itemsChange.emit(this.selectedItems);
  }

  onSelected(event: MatAutocompleteSelectedEvent) {
    this.selectedItems.push(event.option.value);
    this.itemInput.nativeElement.value = '';
    this.itemControl.setValue(null);

    this.itemsChange.emit(this.selectedItems);
  }

  filter(value: string): Array<any> {
    const filterValue = value.toLowerCase();

    return this.allItems.filter((item) => {
      return (
        item?.name?.toLowerCase().indexOf(filterValue) === 0 ||
        item?.serial_number?.toLowerCase().indexOf(filterValue) === 0 ||
        item?.id?.toString() === filterValue
      );
    });
  }
}
