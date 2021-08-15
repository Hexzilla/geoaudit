import { Component, EventEmitter, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { fromEvent } from 'rxjs';
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
import { AbrioxEntityService } from '../../entity-services/abriox-entity.service';
import { ConditionEntityService } from '../../entity-services/condition-entity.service';
import { JobEntityService } from '../../entity-services/job-entity.service';
import { ResistivityEntityService } from '../../entity-services/resistivity-entity.service';
import { SiteEntityService } from '../../entity-services/site-entity.service';
import { SurveyEntityService } from '../../entity-services/survey-entity.service';
import { TestpostEntityService } from '../../entity-services/testpost-entity.service';
import { TrEntityService } from '../../entity-services/tr-entity.service';
import { UserEntityService } from '../../entity-services/user-entity.service';

type Selectors =
  | 'abriox'
  | 'condition'
  | 'job'
  | 'resistivity'
  | 'site'
  | 'survey'
  | 'tp'
  | 'tr'
  | 'user';

@Component({
  selector: 'geoaudit-single-item-selector',
  templateUrl: './single-item-selector.component.html',
  styleUrls: ['./single-item-selector.component.scss']
})
export class SingleItemSelectorComponent implements OnInit {

  @Input() selector: Selectors;

  @Input() label: string;

  @Input() placeholder: string;

  @Input() item;

  @Input() attribute: string;

  itemControl = new FormControl();

  allItems: Array<any> = [];

  filteredItems: Array<any> = [];

  @ViewChild('itemInput') itemInput: ElementRef<HTMLInputElement>;

  @Output() itemChange: EventEmitter<any> = new EventEmitter();
  constructor(
    private abrioxEntityService: AbrioxEntityService,
    private conditionEntityService: ConditionEntityService,
    private userEntityService: UserEntityService,
    private jobEntityService: JobEntityService,
    private resistivityEntityService: ResistivityEntityService,
    private siteEntityService: SiteEntityService,
    private surveyEntityService: SurveyEntityService,
    private testpostEntityService: TestpostEntityService,
    private trEntityService: TrEntityService
  ) { }

  ngOnInit(): void {
    switch (this.selector) {
      case 'abriox':
        this.abrioxEntityService.getAll().subscribe(
          (abrioxes) => {
            this.allItems = abrioxes;
            this.setSelectedItem()
          },
          (err) => {}
        );
        break;

      case 'condition':
        this.conditionEntityService.getAll().subscribe(
          (conditions) => {
            this.allItems = conditions;
            this.setSelectedItem()
          },
          (err) => {}
        );
      break;

      case 'job':
        this.jobEntityService.getAll().subscribe(
          (jobs) => {
            this.allItems = jobs;
            this.setSelectedItem()
          }
        )
        break;

      case 'resistivity':
        this.resistivityEntityService.getAll().subscribe(
          (resistivities) => {
            this.allItems = resistivities;
            this.setSelectedItem()
          }
        )
        break;

      case 'site':
        this.siteEntityService.getAll().subscribe(
          (sites) => {
            this.allItems = sites;
            this.setSelectedItem()
          }
        )
        break;

      case 'survey':
        this.surveyEntityService.getAll().subscribe(
          (surveys) => {
            this.allItems = surveys;
            this.setSelectedItem()
          }
        )
        break;

      case 'tp':
        this.testpostEntityService.getAll().subscribe(
          (testposts) => {
            this.allItems = testposts;
            this.setSelectedItem()
          }
        )
        break;

      case 'tr':
        this.trEntityService.getAll().subscribe(
          (trs) => {
            this.allItems = trs;
            this.setSelectedItem()
          }
        )
        break;

      case 'user':
        this.userEntityService.getAll().subscribe(
          (users) => {
            this.allItems = users;
            this.setSelectedItem()
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
  
  setSelectedItem() {
    if (this.item) {
      const find = this.allItems.find(item => item.id === this.item);
      console.log('find', find, this.item)
      if (find) this.itemControl.setValue(find[this.attribute]);
    }
  }

  onSelected(event: MatAutocompleteSelectedEvent) {
    this.itemControl.setValue(event.option.value[this.attribute]);
    this.itemChange.emit(event.option.value);
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
