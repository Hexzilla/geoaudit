import { NgModule } from '@angular/core';

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

    SharedModule
  ],
})
export class CalendarModule {}