import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const VideoNoteOverlay = ({ notes, currentTime }) => {
    const [activeNotes, setActiveNotes] = useState([]);

    useEffect(() => {
        // Find notes that should be visible
        // Visible if currentTime is between timestamp and timestamp + duration
        const current = notes.filter(note =>
            currentTime >= note.timestamp &&
            currentTime <= (note.timestamp + note.duration)
        );
        setActiveNotes(current);
    }, [currentTime, notes]);

    return (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end pointer-events-none">
            <AnimatePresence>
                {activeNotes.map(note => (
                    <motion.div
                        key={note._id}
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="bg-black/70 backdrop-blur-sm text-white px-4 py-3 rounded-lg border-l-4 border-yellow-500 shadow-lg max-w-xs"
                    >
                        <p className="font-medium text-sm leading-snug">{note.content}</p>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default VideoNoteOverlay;
