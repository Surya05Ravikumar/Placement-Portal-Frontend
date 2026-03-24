import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Modern Toast Notification Component
 * 
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {string} message - The message to display
 * @param {number} duration - Auto-hide duration in ms (0 = no auto-hide, default: 3000)
 * @param {function} onClose - Callback when toast closes
 * @param {string} position - 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
 */

const Toast = ({ type = 'success', message, duration = 3000, onClose, position = 'top-right' }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
        }, 300);
    };

    if (!isVisible) return null;

    const configs = {
        success: {
            icon: <CheckCircle className="w-6 h-6" />,
            iconBg: 'bg-green-100 dark:bg-green-500/15',
            iconColor: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-white dark:bg-slate-800'
        },
        error: {
            icon: <AlertCircle className="w-6 h-6" />,
            iconBg: 'bg-red-100 dark:bg-red-500/15',
            iconColor: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-white dark:bg-slate-800'
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6" />,
            iconBg: 'bg-yellow-100 dark:bg-yellow-500/15',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-white dark:bg-slate-800'
        },
        info: {
            icon: <Info className="w-6 h-6" />,
            iconBg: 'bg-blue-100 dark:bg-blue-500/15',
            iconColor: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-white dark:bg-slate-800'
        }
    };

    const config = configs[type];

    const positions = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
    };

    return (
        <div
            className={`fixed ${positions[position]} z-50 ${isExiting ? 'animate-slideOut' : 'animate-slideIn'
                }`}
        >
            <div
                className={`${config.bgColor} rounded-2xl  max-w-md min-w-[320px] overflow-hidden`}
            >
                <div className="p-4 flex items-start gap-3">
                    {/* Icon */}
                    <div className={`${config.iconBg} ${config.iconColor} p-2 rounded-lg flex-shrink-0`}>
                        {config.icon}
                    </div>

                    {/* Message */}
                    <div className="flex-1 pt-0.5">
                        <p className="text-gray-800 dark:text-slate-100 font-medium leading-relaxed">{message}</p>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300" />
                    </button>
                </div>

                {/* Progress Bar */}
                {duration > 0 && (
                    <div className="h-1 bg-gray-100 dark:bg-slate-700">
                        <div
                            className={`h-full ${type === 'success' ? 'bg-green-500 dark:bg-green-400' :
                                type === 'error' ? 'bg-red-500 dark:bg-red-400' :
                                    type === 'warning' ? 'bg-yellow-500 dark:bg-yellow-400' :
                                        'bg-blue-500 dark:bg-blue-400'
                                } animate-progress`}
                            style={{ animationDuration: `${duration}ms` }}
                        ></div>
                    </div>
                )}
            </div>
        </div >
    );
};

// Toast Container to manage multiple toasts
const ToastContainer = ({ toasts, removeToast, position = 'top-right' }) => {
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            <div className={`absolute ${position.includes('top') ? 'top-4' : 'bottom-4'
                } ${position.includes('right') ? 'right-4' :
                    position.includes('left') ? 'left-4' :
                        'left-1/2 -translate-x-1/2'
                } space-y-3 pointer-events-auto`}>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                        position={position}
                    />
                ))}
            </div>
        </div>
    );
};

// Hook to manage toasts
export const useToast = (options = {}) => {
    const { maxCount = 0 } = options;
    const [toasts, setToasts] = useState([]);

    const addToast = React.useCallback((toast) => {
        const id = Date.now();
        setToasts((prev) => {
            if (maxCount > 0 && prev.length >= maxCount) {
                return [{ ...toast, id }];
            }
            return [...prev, { ...toast, id }];
        });
    }, [maxCount]);

    const removeToast = React.useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = React.useCallback((message, duration = 3000) => {
        addToast({ type: 'success', message, duration });
    }, [addToast]);

    const error = React.useCallback((message, duration = 3000) => {
        addToast({ type: 'error', message, duration });
    }, [addToast]);

    const warning = React.useCallback((message, duration = 3000) => {
        addToast({ type: 'warning', message, duration });
    }, [addToast]);

    const info = React.useCallback((message, duration = 3000) => {
        addToast({ type: 'info', message, duration });
    }, [addToast]);

    return {
        toasts,
        removeToast,
        success,
        error,
        warning,
        info
    };
};

export { Toast, ToastContainer };
export default Toast;
