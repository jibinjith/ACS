import { Reducer } from 'redux';
import { SET_MIC, SET_CAMERA, SET_SHARE_SCREEN, ControlTypes } from '../actions/controls';

/* This reducer helps us control the "call controls" state of the application. We want to 
    maintain this state across the experience so when you turn on your camera on one screen
    its still set to active on another screen */
export interface ControlsState {
  mic: boolean;
  camera: boolean;
  shareScreen: boolean;
}

const initialState: ControlsState = {
  mic: false,
  camera: false,
  shareScreen: false
};

export const controlsReducer: Reducer<ControlsState, ControlTypes> = (
  state = initialState,
  action: ControlTypes
): ControlsState => {
  switch (action.type) {
    case SET_MIC:
      return { ...state, mic: action.mic };
    case SET_CAMERA:
      return { ...state, camera: action.camera };
    case SET_SHARE_SCREEN:
      return { ...state, shareScreen: action.shareScreen };
    default:
      return state;
  }
};
