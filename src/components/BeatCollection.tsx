import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BeatTable from './BeatTable';
import { useBeats } from '../hooks/useBeats';
import { Beat } from '../bindings';

const BeatCollectionComponent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    beats, 
    currentCollection, 
    loading, 
    error, 
    fetchSetData, 
    columnVisibility, 
    setColumnVisibility 
  } = useBeats();

  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      console.log('Fetching data for collection:', id);
      fetchSetData(parseInt(id));
    }
  }, [id, fetchSetData]);

  useEffect(() => {
    console.log('Beats updated:', beats);
  }, [beats]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!currentCollection) return <div>No collection found</div>;

  const handleBeatsChange = (newBeats: Beat[]) => {
    // Implement this function to update beats in your state management
    console.log('Beats changed:', newBeats);
  };

  const handleAddBeatToCollection = (beatId: number, collectionId: number) => {
    // Implement this function to add a beat to a collection
    console.log('Adding beat to collection:', beatId, collectionId);
  };

  const handleDragEnd = (event: any) => {
    // Implement this function to handle drag end events
    console.log('Drag ended:', event);
  };

  return (
    <div>
      <h2>{currentCollection.set_name}</h2>
      <p>Venue: {currentCollection.venue || 'N/A'}</p>
      <p>Date Played: {currentCollection.date_played || 'N/A'}</p>
      <BeatTable
        beats={beats}
        onBeatSelect={(beat: Beat) => setSelectedBeat(beat)}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        selectedBeat={selectedBeat}
        setSelectedBeat={setSelectedBeat}
        fetchSetData={fetchSetData}
        onBeatsChange={handleBeatsChange}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        onAddBeatToCollection={handleAddBeatToCollection}
        onDragEnd={handleDragEnd}
      />
    </div>
  );
};

export default BeatCollectionComponent;