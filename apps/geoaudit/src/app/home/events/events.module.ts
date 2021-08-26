import { NgModule } from '@angular/core';
import { CalendarModule as AngularCalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

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

    AngularCalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),

    SharedModule
  ],
})
export class EventsModule {}