import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * General Purpose Popup/Modal Component
 * 
 * @param {boolean} isOpen - Controls visibility of popup
 * @param {function} onClose - Callback when popup closes
 * @param {string} title - Popup title (optional)
 * @param {ReactNode} children - Content to display inside popup
 * @param {string} size - Popup size: 'sm', 'md', 'lg', 'xl', 'full' (default: 'md')
 * @param {boolean} showCloseButton - Show X button in header (default: true)
 * @param {boolean} closeOnBackdropClick - Close when clicking backdrop (default: true)
 * @param {boolean} closeOnEsc - Close when pressing Escape (default: true)
 * @param {ReactNode} footer - Custom footer content (optional)
 * @param {string} className - Additional CSS classes for content area
 */

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnBackdropClick = true,
    closeOnEsc = true,
    footer,
    className = ''
}) => {

    // Handle ESC key press
    useEffect(() => {
        if (!isOpen || !closeOnEsc) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, closeOnEsc]);

    // Prevent body scroll when popup is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Don't render if not open
    if (!isOpen) return null;

    // Size classes
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-7xl'
    };

    const handleBackdropClick = (e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={handleBackdropClick}
        >
            <div
                className={`relative bg-white dark:bg-[#020617] rounded-2xl ${sizeClasses[size]} w-full max-h-[90vh] flex flex-col animate-slideUp overflow-hidden shadow-2xl dark:shadow-black/50 border border-transparent dark:border-slate-800 transition-colors duration-300`}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                        {title && (
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors group"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-200" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className={`flex-1 overflow-y-auto p-6 ${className}`}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
