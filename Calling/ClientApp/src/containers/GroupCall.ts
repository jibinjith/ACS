import { connect } from 'react-redux';
import GroupCall, { GroupCallProps } from '../components/GroupCall';
import { joinGroup, setMicrophone } from '../core/sideEffects';
import { setVideoDeviceInfo, setAudioDeviceInfo } from '../core/actions/devices';
import {
  AudioDeviceInfo,
  LocalVideoStream,
  VideoDeviceInfo,
} from '@azure/communication-calling';
import { State } from '../core/reducers';

const mapStateToProps = (state: State, props: GroupCallProps) => ({
  userId: state.sdk.userId,
  callAgent: state.calls.callAgent,
  deviceManager: state.devices.deviceManager,
  group: state.calls.group,
  screenWidth: props.screenWidth,
  call: state.calls.call,
  shareScreen: state.controls.shareScreen,
  mic: state.controls.mic,
  groupCallEndReason: state.calls.groupCallEndReason,
  isGroup: () => state.calls.call && state.calls.call.direction !== 'Incoming' && !!state.calls.group,
  joinGroup: async (localVideoStream?: LocalVideoStream) => {
    state.calls.callAgent &&
    
      await joinGroup(
        state.calls.callAgent,
        {
          groupId: state.calls.group
        },
        {
          videoOptions: { localVideoStreams:localVideoStream && state.controls.camera ? [localVideoStream] : undefined},
          audioOptions: { muted: !state.controls.mic }
        }
      );
  },
  remoteParticipants: state.calls.remoteParticipants,
  callState: state.calls.callState,
  screenShareStreams: state.streams.screenShareStreams,
  videoDeviceInfo: state.devices.videoDeviceInfo,
  audioDeviceInfo: state.devices.audioDeviceInfo,
  videoDeviceList: state.devices.videoDeviceList,
  audioDeviceList: state.devices.audioDeviceList,
  cameraPermission: state.devices.cameraPermission,
  microphonePermission: state.devices.microphonePermission,
  camera: state.controls.camera
});

const mapDispatchToProps = (dispatch: any) => ({
  mute: () => dispatch(setMicrophone(false)),
  setAudioDeviceInfo: (deviceInfo: AudioDeviceInfo) => {
    dispatch(setAudioDeviceInfo(deviceInfo));
  },
  setVideoDeviceInfo: (deviceInfo: VideoDeviceInfo) => {
    dispatch(setVideoDeviceInfo(deviceInfo));
  }
});

const connector: any = connect(mapStateToProps, mapDispatchToProps);
export default connector(GroupCall);
