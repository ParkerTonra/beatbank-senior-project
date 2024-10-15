import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BeatTable from './BeatTable';
import { useBeats } from '../hooks/useBeats';

const BeatCollectionComponent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { beats, currentCollection, loading, error, fetchSetData } = useBeats();

  useEffect(() => {
    if (id) {
      fetchSetData(parseInt(id));
    }
  }, [id, fetchSetData]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!currentCollection) return <div>No collection found</div>;

  return (
    <div>
      <h2>{currentCollection.set_name}</h2>
      <p>Venue: {currentCollection.venue || 'N/A'}</p>
      <p>Date Played: {currentCollection.date_played || 'N/A'}</p>
      <BeatTable
        beats={beats}
        onBeatSelect={() => {}}
        isEditing={false}
        setIsEditing={() => {}}
        selectedBeat={null}
        setSelectedBeat={() => {}}
        fetchData={() => {}}
        onBeatsChange={() => {}}
        onAddBeatToCollection={() => {}}
        onDragEnd={() => {}}
      />
    </div>
  );
};

export default BeatCollectionComponent;