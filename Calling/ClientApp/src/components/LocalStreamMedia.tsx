// © Microsoft Corporation. All rights reserved.

import React, { useEffect, useState } from 'react';
import { Image, ImageFit, Label } from '@fluentui/react';
import { LocalVideoStream, VideoDeviceInfo, VideoStreamRenderer, VideoStreamRendererView } from '@azure/communication-calling';
import { videoHint, mediaContainer, localVideoContainerStyle } from './styles/StreamMedia.styles';
import { Constants } from '../core/constants';
import staticMediaSVG from '../assets/staticmedia.svg';

export interface LocalStreamMediaProps {
  label: string;
  stream?: LocalVideoStream;
  videoDeviceInfo?: VideoDeviceInfo;
  camera: boolean;
}

export default (props: LocalStreamMediaProps): JSX.Element => {
  let rendererView: VideoStreamRendererView;

  const { camera, stream, label, videoDeviceInfo } = props;

  const [activeStreamBeingRendered, setActiveStreamBeingRendered] = useState(false);
  const [localVideoStream, setLocalVideoStream] = useState<LocalVideoStream | undefined>(stream);

  const imageProps = {
    src: staticMediaSVG.toString(),
    imageFit: ImageFit.contain,
    styles: {
      root: {
        width: '100%',
        height: '100%',
        display: activeStreamBeingRendered ? 'none' : 'block'
      }
    }
  };

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

        try {
          rendererView = await renderer.createView({ scalingMode: 'Crop', isMirrored: true  });

          const container = document.getElementById(Constants.LOCAL_VIDEO_PREVIEW_ID);

          if (container && container.childElementCount === 0) {
            container.appendChild(rendererView.target);
            setActiveStreamBeingRendered(true);
          }
        }
        catch {
          // if we throw an exception when we stop polling the camera, lets remove the render
          if (rendererView) {
            rendererView.dispose();
            setActiveStreamBeingRendered(false);
          }
        }
      } else {
        if (rendererView) {
          rendererView.dispose();
          setActiveStreamBeingRendered(false);
        }
      }
    })();

    return () => {
      if (rendererView) {
        rendererView.dispose();
        setActiveStreamBeingRendered(false);
      }
    };
  }, [stream, videoDeviceInfo, camera]);

  return (
    <div className={mediaContainer}>
      <div
        style={{ display: activeStreamBeingRendered ? 'block' : 'none' }}
        className={localVideoContainerStyle}
        id={Constants.LOCAL_VIDEO_PREVIEW_ID}
      />
      <Image {...imageProps}/>
      <Label className={videoHint}>{label}</Label>
    </div>
  );
};
