import { NgModule } from '@angular/core';
import { CalendarModule as AngularCalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule } from 'angularx-flatpickr';

// Routing
import { EventsRoutingModule } from './events-routing.module';

// Declarations
import { EventsComponent } from './events.component';
import { EventComponent } from './event/event.component';

import { SharedModule } from '../shared.module';

@NgModule({
  declarations: [
    EventsComponent,
    EventComponent
  ],
  imports: [
    EventsRoutingModule,

    FlatpickrModule.forRoot(),
    AngularCalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),

    SharedModule
  ],
})
export class EventsModule {}