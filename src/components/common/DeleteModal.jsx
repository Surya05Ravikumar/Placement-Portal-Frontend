import React from 'react';
import { AlertCircle } from 'lucide-react';

const DeleteModal = ({ isOpen, onClose, onConfirm, itemName, warningText }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 text-center border border-transparent dark:border-slate-800">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Confirm Deletion</h2>
                <p className="text-gray-600 dark:text-slate-400 mb-6 font-medium">
                    Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">"{itemName}"</span>?
                    {warningText && ` ${warningText}`}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all active:scale-95"
                    >
                        Yes, Delete It
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
