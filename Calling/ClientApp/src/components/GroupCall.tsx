// © Microsoft Corporation. All rights reserved.
import React, { useState, useEffect } from 'react';
import { Label, Overlay, Stack } from '@fluentui/react';
import Header from '../containers/Header';
import MediaGallery from '../containers/MediaGallery';
import MediaFullScreen from './MediaFullScreen';
import CommandPanel, { CommandPanelTypes } from './CommandPanel';
import { Constants } from '../core/constants';
import {
  headerStyles,
  containerStyles,
  paneStyles,
  hiddenContainerClassName,
  activeContainerClassName,
  loadingStyle,
  overlayStyles
} from './styles/GroupCall.styles';
import {
  Call,
  AudioDeviceInfo,
  VideoDeviceInfo,
  RemoteParticipant,
  CallAgent,
  DeviceManager,
  LocalVideoStream
} from '@azure/communication-calling';
import { ParticipantStream } from 'core/reducers/index.js';

export interface GroupCallProps {
  userId: string;
  groupId: string;
  call: Call;
  callAgent: CallAgent;
  deviceManager: DeviceManager;
  mic: boolean;
  remoteParticipants: RemoteParticipant[];
  callState: string;
  screenShareStreams: ParticipantStream[];
  audioDeviceInfo: AudioDeviceInfo;
  videoDeviceInfo: VideoDeviceInfo;
  audioDeviceList: AudioDeviceInfo[];
  videoDeviceList: VideoDeviceInfo[];
  screenWidth: number;
  shareScreen: boolean;
  setAudioDeviceInfo(deviceInfo: AudioDeviceInfo): void;
  setVideoDeviceInfo(deviceInfo: VideoDeviceInfo): void;
  mute(): void;
  isGroup(): void;
  joinGroup(localVideoStream?: LocalVideoStream): void;
  endCallHandler(): void;
  camera:boolean;
}

export default (props: GroupCallProps): JSX.Element => {
  const [selectedPane, setSelectedPane] = useState(CommandPanelTypes.None);
  // when you are using sending video up you need to use a local video stream
  // the local video stream reference needs to be the same across a call, so we are storing the
  // reference with the main "calling" screen.
  const [localVideoStream, setLocalVideoStream] = useState<LocalVideoStream | undefined>(undefined);
  const activeScreenShare = props.screenShareStreams && props.screenShareStreams.length === 1;

  const { callAgent, call, joinGroup, videoDeviceInfo } = props;

  useEffect(() => {
    if (callAgent && !call) {
      let localVideoStream = videoDeviceInfo ? new LocalVideoStream(videoDeviceInfo) : undefined;
      joinGroup(localVideoStream);
      setLocalVideoStream(localVideoStream);
    }
  }, [callAgent, call, joinGroup]);

  return (
    <Stack horizontalAlign="center" verticalAlign="center" styles={containerStyles}>
      <Stack.Item styles={headerStyles}>
        <Header
          selectedPane={selectedPane}
          setSelectedPane={setSelectedPane}
          endCallHandler={() => { 
            props.endCallHandler(); 
          }}
          screenWidth={props.screenWidth}
          localVideoStream={localVideoStream}
          setLocalVideoStream={setLocalVideoStream}
        />
      </Stack.Item>
      <Stack.Item styles={containerStyles}>
        {!props.shareScreen ? (
          props.callState === Constants.CONNECTED && (
            <Stack horizontal styles={containerStyles}>
              <Stack.Item grow styles={activeScreenShare ? activeContainerClassName : hiddenContainerClassName}>
                {activeScreenShare && <MediaFullScreen activeScreenShareStream={props.screenShareStreams[0]} />}
              </Stack.Item>
              <Stack.Item grow styles={!activeScreenShare ? activeContainerClassName : hiddenContainerClassName}>
                <MediaGallery localVideoStream={localVideoStream} />
              </Stack.Item>
              {selectedPane !== CommandPanelTypes.None && (
                  window.innerWidth > Constants.MINI_HEADER_WINDOW_WIDTH ?
                <Stack.Item disableShrink styles={paneStyles}>
                  <CommandPanel {...props} selectedPane={selectedPane} setSelectedPane={setSelectedPane} />
                </Stack.Item>
                :
                <Overlay styles={overlayStyles}>
                    <CommandPanel {...props} selectedPane={selectedPane} setSelectedPane={setSelectedPane} />
                </Overlay>
              )}
            </Stack>
          )
        ) : (
          <div className={loadingStyle}>
            <Label>Your screen is being shared</Label>
          </div>
        )}
      </Stack.Item>
    </Stack>
  );
};
