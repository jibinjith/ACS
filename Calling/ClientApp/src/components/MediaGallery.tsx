import React, { useState } from 'react';
import { mediaGalleryGridStyle, mediaGalleryStyle } from './styles/MediaGallery.styles';
import { RemoteParticipant, LocalVideoStream, VideoDeviceInfo } from '@azure/communication-calling';
import { utils } from '../Utils/Utils';
import LocalStreamMedia from './LocalStreamMedia';
import RemoteStreamMedia from './RemoteStreamMedia';
import { SelectionState } from 'core/RemoteStreamSelector';

export interface MediaGalleryProps {
  userId: string;
  camera: boolean;
  displayName: string;
  remoteParticipants: RemoteParticipant[];
  dominantParticipants: SelectionState[];
  localVideoStream: LocalVideoStream | undefined;
  videoDeviceInfo: VideoDeviceInfo;
}

export default (props: MediaGalleryProps): JSX.Element => {
  const [gridCol, setGridCol] = useState(1);
  const [gridRow, setGridRow] = useState(1);

  const calculateNumberOfRows = React.useCallback(
    (participants, gridCol) => Math.ceil((participants.length + 1) / gridCol),
    []
  );
  const calculateNumberOfColumns = React.useCallback(
    (participants) => (participants && participants.length > 0 ? Math.ceil(Math.sqrt(participants.length + 1)) : 1),
    []
  );
  const getMediaGalleryTilesForParticipants = React.useCallback((participants: RemoteParticipant[], userId: string, displayName: string) => {
    const remoteParticipantsMediaGalleryItems = participants.map((participant) => (
      <div key={`${utils.getId(participant.identifier)}-tile`} className={mediaGalleryStyle}>
        <RemoteStreamMedia
          key={userId}
          stream={participant.videoStreams[0]}
          isParticipantStreamSelected = {props.dominantParticipants.filter(p => p.participantId === utils.getId(participant.identifier)).length > 0}
          label={participant.displayName ?? utils.getId(participant.identifier)}
        />
      </div>
    ));

    // create a LocalStreamMedia component for the local participant
    const localParticipantMediaGalleryItem = (camera: boolean, localVideoStream?: LocalVideoStream) => {
      return (
        <div key="localParticipantTile" className={mediaGalleryStyle}>
          <LocalStreamMedia label={displayName} camera={props.camera} videoDeviceInfo={props.videoDeviceInfo} stream={localVideoStream && camera ? localVideoStream : undefined} />
        </div>
      )
    }

    // add the LocalStreamMedia at the beginning of the list
    remoteParticipantsMediaGalleryItems.unshift(localParticipantMediaGalleryItem(props.camera, props.localVideoStream));

    return remoteParticipantsMediaGalleryItems;
  },[props.localVideoStream, props.camera, props.remoteParticipants, props.dominantParticipants]);

  const numberOfColumns = calculateNumberOfColumns(props.remoteParticipants);
  if (numberOfColumns !== gridCol) setGridCol(numberOfColumns);
  const numberOfRows = calculateNumberOfRows(props.remoteParticipants, gridCol);
  if (numberOfRows !== gridRow) setGridRow(numberOfRows);

  return (
    <div id="video-gallery"
      className={mediaGalleryGridStyle}
      style={{
        gridTemplateRows: `repeat(${gridRow}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${gridCol}, 1fr)`
      }}
    >
      {getMediaGalleryTilesForParticipants(props.remoteParticipants, props.userId, props.displayName)}
    </div>
  );
};
