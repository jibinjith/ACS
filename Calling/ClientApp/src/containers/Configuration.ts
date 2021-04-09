import { connect } from 'react-redux';
import ConfigurationScreen, { ConfigurationScreenProps } from '../components/Configuration';
import { setGroup } from '../core/actions/calls';
import { setVideoDeviceInfo, setAudioDeviceInfo } from '../core/actions/devices';
import { initCallAgent, initCallClient, updateDevices } from '../core/sideEffects';
import { setCamera, setMic } from '../core/actions/controls';
import { State } from '../core/reducers';
import { AudioDeviceInfo, VideoDeviceInfo } from '@azure/communication-calling';

const mapStateToProps = (state: State, props: ConfigurationScreenProps) => ({
  deviceManager: state.devices.deviceManager,
  callAgent: state.calls.callAgent,
  group: state.calls.group,
  mic: state.controls.mic,
  camera: state.controls.camera,
  screenWidth: props.screenWidth,
  audioDeviceInfo: state.devices.audioDeviceInfo,
  videoDeviceInfo: state.devices.videoDeviceInfo,
  videoDeviceList: state.devices.videoDeviceList,
  audioDeviceList: state.devices.audioDeviceList,
  cameraPermission: state.devices.cameraPermission,
  microphonePermission: state.devices.microphonePermission
});

const mapDispatchToProps = (dispatch: any, props: ConfigurationScreenProps) => ({
  setMic: (mic: boolean) => dispatch(setMic(mic)),
  setCamera: (camera: boolean) => dispatch(setCamera(camera)),
  setAudioDeviceInfo: (deviceInfo: AudioDeviceInfo) => dispatch(setAudioDeviceInfo(deviceInfo)),
  setVideoDeviceInfo: (deviceInfo: VideoDeviceInfo) => dispatch(setVideoDeviceInfo(deviceInfo)),
  setupCallClient: (unsupportedStateHandler: () => void) =>
    dispatch(initCallClient( unsupportedStateHandler)),
  setupCallAgent: (displayName: string) =>
    dispatch(initCallAgent(displayName, props.callEndedHandler)),
  setGroup: (groupId: string) => dispatch(setGroup(groupId)),
  updateDevices: () => dispatch(updateDevices()),
});

const connector: any = connect(mapStateToProps, mapDispatchToProps);
export default connector(ConfigurationScreen);
