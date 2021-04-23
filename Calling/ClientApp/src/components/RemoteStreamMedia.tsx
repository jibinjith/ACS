// © Microsoft Corporation. All rights reserved.

import React, { useCallback, useEffect, useState } from 'react';
import { Label, Spinner, SpinnerSize } from '@fluentui/react';
import { RemoteVideoStream, VideoStreamRenderer, VideoStreamRendererView } from '@azure/communication-calling';
import { videoHint, mediaContainer } from './styles/StreamMedia.styles';
import { utils } from 'Utils/Utils';
import staticMediaSVG from '../assets/staticmedia.svg';
import { Image, ImageFit } from '@fluentui/react';

export interface RemoteStreamMediaProps {
  label: string;
  stream: RemoteVideoStream | undefined;
  isParticipantStreamSelected: boolean;
}

export default (props: RemoteStreamMediaProps): JSX.Element => {
  let rendererView: VideoStreamRendererView;

  const streamId = props.stream ? utils.getStreamId(props.label, props.stream) : `${props.label} - no stream`;

  const [activeStreamBeingRendered, setActiveStreamBeingRendered] = useState(false);
  const [showRenderLoading, setShowRenderLoading] = useState(false);

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

  const loadingStyle = {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const {label, stream, isParticipantStreamSelected} = props;

  const renderRemoteStream = useCallback(async () => {
    const container = document.getElementById(streamId);
    if (container && stream && stream.isAvailable && isParticipantStreamSelected) {

      // if we are already rendering a stream we don't want to start rendering the same stream
      if (activeStreamBeingRendered) {
        return;
      }

      // set the flag that a stream is being rendered, so we don't try to start rendering again while rendering
      setActiveStreamBeingRendered(true);
      setShowRenderLoading(true);

      // then create our renderer around our stream
      const renderer: VideoStreamRenderer = new VideoStreamRenderer(stream);
      
      try {
        rendererView = await renderer.createView({ scalingMode: 'Crop' });
        setShowRenderLoading(false);
        if (container && container.childElementCount === 0) {
          container.appendChild(rendererView.target);
        }
      }
      catch {
        // if an exception is thrown lets clean up our render and reset the state
        setActiveStreamBeingRendered(false);

        if (rendererView) {
          rendererView.dispose();
        }
      }
      
    } else {
      // when we are done with our render lets clean up the render and reset the state
      setActiveStreamBeingRendered(false);

      if (rendererView) {
        rendererView.dispose();
      }
    }
  }, [stream?.id, stream?.isAvailable, isParticipantStreamSelected]);

  useEffect(() => {
    if (!stream) {
      return;
    }

    stream.on('isAvailableChanged', renderRemoteStream);

    if (stream && stream.isAvailable && isParticipantStreamSelected) {
      renderRemoteStream();
    }

    return () => {
      // un-register the remote stream listener
      stream.off('isAvailableChanged', renderRemoteStream);
    }
  }, [stream, isParticipantStreamSelected, renderRemoteStream]);

  return (
    <div className={mediaContainer}>
      <div style={{display: activeStreamBeingRendered ? 'block' : 'none' }} className={mediaContainer} id={streamId}>
      { showRenderLoading && <Spinner style={loadingStyle} label={`Rendering stream...`} size={SpinnerSize.xSmall} />}
      </div>
        <Image {...imageProps}/>
        <Label className={videoHint}>{label}</Label>
    </div>
  );
};
