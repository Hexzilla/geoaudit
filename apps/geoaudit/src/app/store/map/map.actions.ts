import { createAction, props } from '@ngrx/store';
import { ClickMarker } from '../../models/map.model';

export const ADD_CLICK_MARKER = '[Map] Add click marker';
export const CLEAR_CLICK_MARKER = '[Map] Clear click marker';

export const TOGGLE_SIDEBAR = '[Map] Toggle sidebar';

export const addClickMarker = createAction(
    ADD_CLICK_MARKER,
    props<{
        clickMarker: ClickMarker
    }>()
)

export const clearClickMarker = createAction(
    CLEAR_CLICK_MARKER
)

export const toggleSidebar = createAction(
    TOGGLE_SIDEBAR,
    props<{
        url: string
    }>()
)