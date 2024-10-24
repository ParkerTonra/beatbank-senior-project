import { useState } from "react";
import { Beat } from "../bindings";
import { EditThisBeat } from "../bindings";

interface EditBeatCardProps {
    beat: Beat;
    onClose: () => void;
    onSave: (updatedBeat: EditThisBeat) => void;
}

interface BeatFormState {
    id: number;
    title: string;
    bpm: string;
    musical_key: string;
    duration?: number;
    artist: string;
    comments: string;
    album: string;
    year: string;
    track_number: string;
    composer: string;
    lyricist: string;
    cover_art?: string;
    file_path: string;
    genre: string;
}


interface FormErrors {
    year?: string;
    bpm?: string;
    track_number?: string;
}

const EditBeatCard: React.FC<EditBeatCardProps> = ({ beat, onClose, onSave }) => {
    const [editedBeat, setEditedBeat] = useState<BeatFormState>({
        id: beat.id,
        title: beat.title || "",
        bpm: beat.bpm?.toString() || "",
        musical_key: beat.musical_key || "",
        artist: beat.artist || "",
        file_path: beat.file_path || "",
        genre: beat.genre || "",
        comments: beat.comments || "",
        album: beat.album || "",
        year: beat.year?.toString() || "",
        track_number: beat.track_number?.toString() || "",
        composer: beat.composer || "",
        lyricist: beat.lyricist || "",
        cover_art: beat.cover_art || "",
        duration: beat.duration,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case 'year':
                if (value && !/^\d{4}$/.test(value)) {
                    return 'Year must be a 4-digit number';
                }
                const yearNum = parseInt(value);
                if (value && (yearNum < 0 || yearNum > 9999)) {
                    return 'Please enter a valid date';
                }
                break;
            case 'bpm':
                if (value && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 999)) {
                    return 'BPM must be a number between 0 and 999';
                }
                break;
            case 'track_number':
                if (value && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 999)) {
                    return 'Track number must be between 0 and 999';
                }
                break;
        }
        return undefined;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, files } = e.target;

        // Handle file inputs separately
        if (type === 'file' && files) {
            setEditedBeat(prev => ({
                ...prev,
                [name]: files[0]
            }));
            return;
        }

        // Validate the field
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        setEditedBeat(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = () => {
        setShowAdvanced(!showAdvanced);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields before submission
        const newErrors: FormErrors = {};
        Object.entries(editedBeat).forEach(([key, value]) => {
            if (['year', 'bpm', 'track_number'].includes(key)) {
                const error = validateField(key, value.toString());
                if (error) {
                    newErrors[key as keyof FormErrors] = error;
                }
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Convert form state to EditThisBeat type
        const submissionData: EditThisBeat = {
            id: editedBeat.id,
            title: editedBeat.title,
            bpm: editedBeat.bpm ? Number(editedBeat.bpm) : undefined,
            musical_key: editedBeat.musical_key || undefined,
            artist: editedBeat.artist || undefined,
            comments: editedBeat.comments || undefined,
            album: editedBeat.album || undefined,
            year: editedBeat.year ? Number(editedBeat.year) : undefined,
            track_number: editedBeat.track_number ? Number(editedBeat.track_number) : undefined,
            composer: editedBeat.composer || undefined,
            lyricist: editedBeat.lyricist || undefined,
            cover_art: editedBeat.cover_art || undefined,
            file_path: editedBeat.file_path || undefined,
            genre: editedBeat.genre || undefined,
            duration: editedBeat.duration,
        };

        onSave(submissionData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-screen overflow-hidden">
                <h1 className="text-2xl font-bold mb-4">Edit Beat</h1>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                    {/* Basic Fields */}
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
                            type="text"
                            name="bpm"
                            id="bpm"
                            value={editedBeat.bpm}
                            onChange={handleChange}
                            pattern="[0-9]*\.?[0-9]*"
                            className={`mt-1 block w-full p-2 bg-gray-700 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.bpm ? 'border-red-500' : 'border-gray-600'
                                }`}
                        />
                        {errors.bpm && <p className="text-red-500 text-sm mt-1">{errors.bpm}</p>}
                    </div>

                    <div>
                        <label htmlFor="key" className="block text-sm font-medium text-gray-300">
                            Key
                        </label>
                        <input
                            type="text"
                            name="musical_key"
                            id="key"
                            value={editedBeat.musical_key}
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


                    {/* Advanced Metadata Toggle */}
                    <div className="flex items-center mt-4">
                        <input
                            type="checkbox"
                            id="advancedMetadata"
                            checked={showAdvanced}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="advancedMetadata" className="ml-2 block text-sm font-medium text-gray-300">
                            Show Advanced Metadata
                        </label>
                    </div>

                    {/* Advanced Fields */}
                    {showAdvanced && (
                        <>
                            <div>
                                <label htmlFor="genre" className="block text-sm font-medium text-gray-300">
                                    Genre
                                </label>
                                <input
                                    type="text"
                                    name="genre"
                                    id="genre"
                                    value={editedBeat.genre}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="comments" className="block text-sm font-medium text-gray-300">
                                    Comments
                                </label>
                                <input
                                    type="text"
                                    name="comments"
                                    id="comments"
                                    value={editedBeat.comments}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="album" className="block text-sm font-medium text-gray-300">
                                        Album
                                    </label>
                                    <input
                                        type="text"
                                        name="album"
                                        id="album"
                                        value={editedBeat.album}
                                        onChange={handleChange}
                                        className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="bpm" className="block text-sm font-medium text-gray-300">
                                        BPM
                                    </label>
                                    <input
                                        type="text"
                                        name="bpm"
                                        id="bpm"
                                        value={editedBeat.bpm}
                                        onChange={handleChange}
                                        pattern="[0-9]*\.?[0-9]*"
                                        className={`mt-1 block w-full p-2 bg-gray-700 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.bpm ? 'border-red-500' : 'border-gray-600'
                                            }`}
                                    />
                                    {errors.bpm && <p className="text-red-500 text-sm mt-1">{errors.bpm}</p>}
                                </div>

                                <div>
                                    <label htmlFor="track_number" className="block text-sm font-medium text-gray-300">
                                        Track Number
                                    </label>
                                    <input
                                        type="text"
                                        name="track_number"
                                        id="track_number"
                                        value={editedBeat.track_number}
                                        onChange={handleChange}
                                        pattern="[0-9]*"
                                        className={`mt-1 block w-full p-2 bg-gray-700 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.track_number ? 'border-red-500' : 'border-gray-600'
                                            }`}
                                    />
                                    {errors.track_number && <p className="text-red-500 text-sm mt-1">{errors.track_number}</p>}
                                </div>

                                <div>
                                    <label htmlFor="composer" className="block text-sm font-medium text-gray-300">
                                        Composer
                                    </label>
                                    <input
                                        type="text"
                                        name="composer"
                                        id="composer"
                                        value={editedBeat.composer}
                                        onChange={handleChange}
                                        className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lyricist" className="block text-sm font-medium text-gray-300">
                                        Lyricist
                                    </label>
                                    <input
                                        type="text"
                                        name="lyricist"
                                        id="lyricist"
                                        value={editedBeat.lyricist}
                                        onChange={handleChange}
                                        className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="cover_art" className="block text-sm font-medium text-gray-300">
                                        Cover Art
                                    </label>
                                    <input
                                        type="file"
                                        name="cover_art"
                                        id="cover_art"
                                        onChange={handleChange}
                                        accept="image/*"
                                        className="mt-1 block w-full text-sm text-gray-300
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-600 file:text-white
                                        hover:file:bg-blue-700"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Action Buttons */}
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
