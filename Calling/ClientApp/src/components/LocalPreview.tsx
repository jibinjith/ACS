// © Microsoft Corporation. All rights reserved.
import React, { useEffect, useState } from 'react';
import { Stack, Toggle, Image, ImageFit } from '@fluentui/react';
import { MicIcon, CallVideoIcon } from '@fluentui/react-icons-northstar';
import { Constants } from '../core/constants';
import {
  VideoStreamRendererView,
  VideoDeviceInfo,
  AudioDeviceInfo,
  LocalVideoStream,
  VideoStreamRenderer
} from '@azure/communication-calling';
import staticMediaSVG from '../assets/staticmedia.svg';
import {
  toggleStyle,
  imgStyles,
  toggleButtonsBarToken,
  localPreviewContainerStyle,
  toggleButtonsBarStyle,
  localPreviewStyle
} from './styles/LocalPreview.styles';

export interface LocalPreviewProps {
  setMic(mic: boolean): void;
  mic: boolean;
  setCamera(camera: boolean): void;
  camera: boolean;
  videoDeviceInfo: VideoDeviceInfo;
  audioDeviceInfo: AudioDeviceInfo;
  videoDeviceList: VideoDeviceInfo[];
  audioDeviceList: AudioDeviceInfo[];
}

let rendererView: VideoStreamRendererView;

export default (props: LocalPreviewProps): JSX.Element => {
  const imageProps = {
    src: staticMediaSVG.toString(),
    imageFit: ImageFit.cover,
    maximizeFrame: true
  };

  const handleLocalVideoOnOff = (_ev: React.MouseEvent<HTMLElement>, checked = false): void => {
    props.setCamera(checked);
  };

  const handleLocalMicOnOff = (_ev: React.MouseEvent<HTMLElement>, checked = false): void => {
    props.setMic(checked);
  };

  const [localVideoStream, setLocalVideoStream] = useState<LocalVideoStream | undefined>(undefined);
  const { videoDeviceInfo, camera } = props;

  useEffect(() => {
    if (videoDeviceInfo) {
      if (!localVideoStream) {
        setLocalVideoStream(new LocalVideoStream(videoDeviceInfo))
      } else if (localVideoStream.source.id !== videoDeviceInfo.id) {
        localVideoStream.switchSource(videoDeviceInfo);
      }
    }
  }, [localVideoStream, videoDeviceInfo]);

  useEffect(() => {
    (async () => {
      if (camera && videoDeviceInfo && localVideoStream) {

        const renderer: VideoStreamRenderer = new VideoStreamRenderer(localVideoStream);

        rendererView = await renderer.createView({ scalingMode: 'Crop' });

        const container = document.getElementById(Constants.CONFIGURATION_LOCAL_VIDEO_PREVIEW_ID);

        if (container && container.childElementCount === 0) {
          container.appendChild(rendererView.target);
        }
      }
    })();

    return () => {
      if (rendererView) {
        rendererView.dispose();
      }
    };
  }, [camera, videoDeviceInfo]);


  return (
    <Stack className={localPreviewContainerStyle}>
      <Stack
        horizontalAlign="center"
        verticalAlign="center"
        id={Constants.CONFIGURATION_LOCAL_VIDEO_PREVIEW_ID}
        className={localPreviewStyle}
      >
        {!camera && <Image styles={imgStyles} {...imageProps} aria-label="Local video preview image"/>}
      </Stack>
      <Stack
        horizontal
        horizontalAlign="center"
        verticalAlign="center"
        tokens={toggleButtonsBarToken}
        className={toggleButtonsBarStyle}
      >
        <CallVideoIcon size="medium" />
        <Toggle
          onKeyDownCapture={(e) => {}}
          checked={camera}
          styles={toggleStyle}
          disabled={!props.videoDeviceInfo || props.videoDeviceList.length === 0}
          onChange={handleLocalVideoOnOff}
          ariaLabel="Video Icon"
        />
        <MicIcon size="medium" />
        <Toggle
          checked={props.mic}
          styles={toggleStyle} 
          disabled={!props.audioDeviceInfo || props.audioDeviceList.length === 0}
          onChange={handleLocalMicOnOff} ariaLabel="Microphone Icon"/>
      </Stack>
    </Stack>
  );
};
