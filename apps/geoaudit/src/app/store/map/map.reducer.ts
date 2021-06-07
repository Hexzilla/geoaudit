import { Action, createReducer, on } from "@ngrx/store";
import { ClickMarker } from "../../models/map.model";

import * as MapActions from './map.actions';

export interface State {
    clickMarker: ClickMarker,
    open: boolean,
    url: string
}

export const initialState: State = {
    clickMarker: null,
    open: true,
    url: null
}

const mapReducer = createReducer(
    initialState,
    on(MapActions.addClickMarker, (state, action) => {
        return {
            ...state,
            clickMarker: action.clickMarker,
            open: true,
            url: null
        }
    }),
    on(MapActions.clearClickMarker, (state, action) => {
        return {
            ...state,
            clickMarker: null
        }
    }),
    on(MapActions.toggleSidebar, (state, action) => {
        return {
            ...state,
            open: !state.open,
            url: action.url
        }
    }),
)

export function reducer(state: State | undefined, action: Action) {
    return mapReducer(state, action);
}