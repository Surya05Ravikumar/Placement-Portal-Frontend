import React from 'react';

const HighlightText = ({ text, highlight }) => {
    if (!highlight || !text) return <span>{text}</span>;

    // Escape special characters in highlight string to prevent regex errors
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeText = String(text);
    const parts = safeText.split(new RegExp(`(${escapedHighlight})`, 'gi'));

    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <span key={i} className="bg-yellow-200 dark:bg-yellow-500/30 text-gray-900 dark:text-yellow-200 rounded-sm px-0.5">{part}</span>
                ) : (
                    part
                )
            )}
        </span>
    );
};

export default HighlightText;
