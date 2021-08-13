import { ENTER, COMMA } from '@angular/cdk/keycodes';
import {
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
import { JobEntityService } from '../../entity-services/job-entity.service';
import { ResistivityEntityService } from '../../entity-services/resistivity-entity.service';
import { SiteEntityService } from '../../entity-services/site-entity.service';
import { SurveyEntityService } from '../../entity-services/survey-entity.service';
import { TestpostEntityService } from '../../entity-services/testpost-entity.service';
import { TrEntityService } from '../../entity-services/tr-entity.service';
import { UserEntityService } from '../../entity-services/user-entity.service';
import { Abriox, User } from '../../models';

type Selectors =
  | 'abriox'
  | 'job'
  | 'resistivity'
  | 'site'
  | 'survey'
  | 'tp'
  | 'tr'
  | 'user';

@Component({
  selector: 'geoaudit-item-selector',
  templateUrl: './item-selector.component.html',
  styleUrls: ['./item-selector.component.scss'],
})
export class ItemSelectorComponent implements OnInit {
  @Input() selector: Selectors;

  @Input() label: string;

  @Input() placeholder: string;

  @Input() items?: Array<any> = [];

  @Input() item?;

  @Input() attribute: string;

  @Input() multiple? = true;

  selectedItems: Array<any> = [];
  allItems: Array<any> = [];
  itemControl = new FormControl();
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredItems: Array<Abriox> = [];
  @ViewChild('itemInput') itemInput: ElementRef<HTMLInputElement>;
  selectable = true;
  removable = true;

  @Output() itemsChange: EventEmitter<Array<any>> = new EventEmitter();

  constructor(
    private abrioxEntityService: AbrioxEntityService,
    private userEntityService: UserEntityService,
    private jobEntityService: JobEntityService,
    private resistivityEntityService: ResistivityEntityService,
    private siteEntityService: SiteEntityService,
    private surveyEntityService: SurveyEntityService,
    private testpostEntityService: TestpostEntityService,
    private trEntityService: TrEntityService
  ) {}

  ngOnInit(): void {
    switch (this.selector) {
      case 'abriox':
        this.abrioxEntityService.getAll().subscribe(
          (abrioxes) => {
            this.allItems = abrioxes;
            this.mapItmsAndPushAsSelected()
          },
          (err) => {}
        );
        break;

      case 'job':
        this.jobEntityService.getAll().subscribe(
          (jobs) => {
            this.allItems = jobs;
            this.mapItmsAndPushAsSelected()
          }
        )
        break;

      case 'resistivity':
        this.resistivityEntityService.getAll().subscribe(
          (resistivities) => {
            this.allItems = resistivities;
            this.mapItmsAndPushAsSelected()
          }
        )
        break;

      case 'site':
        this.siteEntityService.getAll().subscribe(
          (sites) => {
            this.allItems = sites;
            this.mapItmsAndPushAsSelected()
          }
        )
        break;

      case 'survey':
        this.surveyEntityService.getAll().subscribe(
          (surveys) => {
            this.allItems = surveys;
            this.mapItmsAndPushAsSelected()
          }
        )
        break;

      case 'tp':
        this.testpostEntityService.getAll().subscribe(
          (testposts) => {
            this.allItems = testposts;
            this.mapItmsAndPushAsSelected()
          }
        )
        break;

      case 'tr':
        this.trEntityService.getAll().subscribe(
          (trs) => {
            this.allItems = trs;
            this.mapItmsAndPushAsSelected()
          }
        )
        break;

      case 'user':
        this.userEntityService.getAll().subscribe(
          (users) => {
            this.allItems = users;
            this.mapItmsAndPushAsSelected()
          },
          (err) => {}
        );
        break;
    }
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

  mapItmsAndPushAsSelected() {

    if (this.multiple) {
      this.items.map((item) => {
        if (
          !this.selectedItems.find((selectedItem) => selectedItem.id === item.id)
        ) {
          this.selectedItems.push(item);
        }
      });
    } else {
      if (this.item) this.selectedItems.push(this.item);
    }
  }

  // Users (Assignees)
  add(event: MatChipInputEvent) {
    const value = (event.value || '').trim();

    // Add our user
    if (value) {
      const filterAllItemsOnValue = this.filter(value);

      if (filterAllItemsOnValue.length >= 1) {
        if (!this.multiple) this.selectedItems.pop(); 
        this.selectedItems.push(filterAllItemsOnValue[0]);
      }
    }

    // Clear the input value
    this.itemInput.nativeElement.value = '';

    this.itemControl.setValue(null);

    this.itemsChange.emit(this.selectedItems);
  }

  remove(event: any): void {
    const exists = this.selectedItems.find((item) => item.id === event.id);
    if (exists) {
      this.selectedItems = this.selectedItems.filter(
        (item) => item.id !== exists.id
      );
    }

    this.itemsChange.emit(this.selectedItems);
  }

  onSelected(event: MatAutocompleteSelectedEvent) {
    if (!this.multiple) this.selectedItems.pop(); 
    this.selectedItems.push(event.option.value);
    this.itemInput.nativeElement.value = '';
    this.itemControl.setValue(null);

    this.itemsChange.emit(this.selectedItems);
  }

  filter(value: string): Array<any> {
    const filterValue = value.toLowerCase();

    return this.allItems.filter((item) => {
      return (
        // User
        item?.username?.toLowerCase().indexOf(filterValue) === 0 ||
        item?.email?.toLowerCase().indexOf(filterValue) === 0 ||
        // Abriox
        item?.name?.toLowerCase().indexOf(filterValue) === 0 ||
        item?.serial_number?.toLowerCase().indexOf(filterValue) === 0 ||
        item?.id?.toString() === filterValue
      );
    });
  }
}
