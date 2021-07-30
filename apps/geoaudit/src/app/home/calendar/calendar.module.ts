import { NgModule } from '@angular/core';
import { CalendarModule as AngularCalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule } from 'angularx-flatpickr';

// Routing
import { CalendarRoutingModule } from './calendar-routing.module';

// Declarations
import { CalendarComponent } from './calendar.component';
import { EventComponent } from '../calendar/event/event.component';

import { SharedModule } from '../shared.module';

@NgModule({
  declarations: [
    CalendarComponent,
    EventComponent,
  ],
  imports: [
    CalendarRoutingModule,

    FlatpickrModule.forRoot(),
    AngularCalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),

    SharedModule
  ],
})
export class CalendarModule {}