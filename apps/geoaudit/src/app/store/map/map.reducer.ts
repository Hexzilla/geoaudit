import { Action, createReducer, on } from "@ngrx/store";
import { ClickMarker } from "../../models/map.model";

import * as MapActions from './map.actions';

export interface State {
    clickMarker: ClickMarker
}

export const initialState: State = {
    clickMarker: null,
}

const mapReducer = createReducer(
    initialState,
    on(MapActions.addClickMarker, (state, action) => {
        return {
            ...state,
            clickMarker: action.clickMarker
        }
    }),
    on(MapActions.clearClickMarker, (state, action) => {
        return {
            ...state,
            clickMarker: null
        }
    })
)

export function reducer(state: State | undefined, action: Action) {
    return mapReducer(state, action);
}