import React, { useState } from 'react';
import { FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import api from '../api/axios';

const NoteEditor = ({ videoId, currentTime, notes, onNoteAdded, onNoteDeleted }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState('');
    const [duration, setDuration] = useState(5);
    const [loading, setLoading] = useState(false);

    // Format seconds to MM:SS
    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            const response = await api.post(`/videos/${videoId}/notes`, {
                content,
                timestamp: Math.floor(currentTime),
                duration
            });

            if (response.data.success) {
                onNoteAdded(response.data.data);
                setContent('');
                setIsOpen(false);
            }
        } catch (error) {
            console.error('Error adding note:', error);
            alert('Failed to add note');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (noteId) => {
        if (!window.confirm('Delete this note?')) return;

        try {
            await api.delete(`/videos/notes/${noteId}`);
            onNoteDeleted(noteId);
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note');
        }
    };

    return (
        <div className="mt-6 bg-[#1E293B] rounded-xl border border-[#334155] p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Creator Notes</h3>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                    {isOpen ? <FaTimes /> : <FaPlus />}
                    {isOpen ? 'Close' : 'Add Note at ' + formatTime(currentTime)}
                </button>
            </div>

            {isOpen && (
                <form onSubmit={handleAddNote} className="mb-6 bg-[#0F172A] p-4 rounded-lg border border-[#334155]">
                    <div className="mb-3">
                        <label className="block text-gray-400 text-xs mb-1">Note Content (Max 100 chars)</label>
                        <input
                            type="text"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            maxLength={100}
                            placeholder="E.g. Pay attention to the background!"
                            className="w-full bg-[#1E293B] border border-[#334155] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                            autoFocus
                        />
                    </div>
                    <div className="flex items-end justify-between gap-4">
                        <div className="flex-1">
                            <label className="block text-gray-400 text-xs mb-1">Duration (seconds)</label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                min={1}
                                max={60}
                                className="w-full bg-[#1E293B] border border-[#334155] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!content.trim() || loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Adding...' : 'Save Note'}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {notes.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No notes added yet.</p>
                ) : (
                    notes.map(note => (
                        <div key={note._id} className="flex items-center justify-between bg-[#0F172A] p-3 rounded-lg border border-[#334155] group hover:border-gray-500 transition-colors">
                            <div className="flex-1 min-w-0 mr-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-yellow-500 font-mono text-xs font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded">
                                        {formatTime(note.timestamp)}
                                    </span>
                                    <span className="text-gray-500 text-xs">({note.duration}s)</span>
                                </div>
                                <p className="text-gray-300 text-sm truncate">{note.content}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(note._id)}
                                className="text-gray-500 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Note"
                            >
                                <FaTrash size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NoteEditor;
