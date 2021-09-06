import { NgModule } from '@angular/core';


// Routing
import { SearchRoutingModule } from './search-routing.module';

import { ErrorInterceptor, JwtInterceptor } from '../../helpers';

// Declarations
import { SearchComponent } from './search.component';
import { SharedModule } from '../shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ListComponent } from './list/list.component';

@NgModule({
  declarations: [
    SearchComponent,
    ListComponent,
  ],
  imports: [
    SearchRoutingModule,
    SharedModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ]
})
export class SearchModule {}