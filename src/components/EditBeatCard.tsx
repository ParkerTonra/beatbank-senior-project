import { useState } from "react";
import { Beat } from "../bindings";

interface EditBeatCardProps {
    beat: Beat;
    onClose: () => void;
    onSave: (updatedBeat: Beat) => void;
}



const EditBeatCard: React.FC<EditBeatCardProps> = ({ beat, onClose, onSave }) => {
    const [editedBeat, setEditedBeat] = useState<Beat>({
        ...beat,
        title: beat.title || "",
        bpm: beat.bpm || 0,
        key: beat.key || "",
        artist: beat.artist || "",
        file_path: beat.file_path || "",
    });

    const formatBpm = (value: string): number => {
        const numValue = parseFloat(value);
        return isNaN(numValue) ? 0 : Number(numValue.toFixed(2));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'bpm') {
            setEditedBeat((prev) => ({ ...prev, [name]: formatBpm(value) }));
        } else {
            setEditedBeat((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedBeat);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Edit Beat</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                            Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            value={editedBeat.title}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="bpm" className="block text-sm font-medium text-gray-300">
                            BPM
                        </label>
                        <input
                            type="number"
                            name="bpm"
                            id="bpm"
                            value={editedBeat.bpm}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="key" className="block text-sm font-medium text-gray-300">
                            Key
                        </label>
                        <input
                            type="text"
                            name="key"
                            id="key"
                            value={editedBeat.key}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="artist" className="block text-sm font-medium text-gray-300">
                            Artist
                        </label>
                        <input
                            type="text"
                            name="artist"
                            id="artist"
                            value={editedBeat.artist}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="file_path" className="block text-sm font-medium text-gray-300">
                            File Path
                        </label>
                        <input
                            type="text"
                            name="file_path"
                            id="file_path"
                            value={editedBeat.file_path}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBeatCard;
