import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    // Default to 'overall'
    const [selectedBatch, setSelectedBatch] = useState(() => {
        return localStorage.getItem('adminSelectedBatch') || 'overall';
    });

    // Option mapping from label to actual year in DB
    const batchOptions = [
        { label: 'Overall', value: 'overall' },
        { label: '2023-27', value: '2027' },
        { label: '2022-26', value: '2026' },
        { label: '2021-25', value: '2025' },
        { label: '2020-24', value: '2024' }
    ];

    useEffect(() => {
        localStorage.setItem('adminSelectedBatch', selectedBatch);
    }, [selectedBatch]);

    const value = {
        selectedBatch,
        setSelectedBatch,
        batchOptions
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
