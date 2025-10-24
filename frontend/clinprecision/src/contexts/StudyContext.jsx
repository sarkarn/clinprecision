import React, { createContext, useState, useEffect } from 'react';

const StudyContext = createContext(undefined);

export const StudyProvider = ({ children }) => {
    const [selectedStudy, setSelectedStudy] = useState(() => {
        // Initialize from localStorage if available
        const stored = localStorage.getItem('selectedStudy');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        // Persist to localStorage whenever selectedStudy changes
        if (selectedStudy) {
            localStorage.setItem('selectedStudy', JSON.stringify(selectedStudy));
        } else {
            localStorage.removeItem('selectedStudy');
        }
    }, [selectedStudy]);

    const value = {
        selectedStudy,
        setSelectedStudy,
        clearSelectedStudy: () => setSelectedStudy(null),
    };

    return (
        <StudyContext.Provider value={value}>
            {children}
        </StudyContext.Provider>
    );
};

export default StudyContext;
