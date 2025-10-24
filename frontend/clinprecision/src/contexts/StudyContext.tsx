import React, { createContext, useState, useEffect, useContext } from 'react';
import { Study } from '../types';

// Define the shape of the context value
interface StudyContextValue {
    selectedStudy: Study | null;
    setSelectedStudy: (study: Study | null) => void;
    clearSelectedStudy: () => void;
}

// Create context with undefined default (will be checked in hook)
const StudyContext = createContext<StudyContextValue | undefined>(undefined);

// Props interface for the provider
interface StudyProviderProps {
    children: React.ReactNode;
}

export const StudyProvider: React.FC<StudyProviderProps> = ({ children }) => {
    const [selectedStudy, setSelectedStudy] = useState<Study | null>(() => {
        // Initialize from localStorage if available
        const stored = localStorage.getItem('selectedStudy');
        try {
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Failed to parse stored study:', error);
            return null;
        }
    });

    useEffect(() => {
        // Persist to localStorage whenever selectedStudy changes
        if (selectedStudy) {
            try {
                localStorage.setItem('selectedStudy', JSON.stringify(selectedStudy));
            } catch (error) {
                console.error('Failed to store study:', error);
            }
        } else {
            localStorage.removeItem('selectedStudy');
        }
    }, [selectedStudy]);

    const value: StudyContextValue = {
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

// Custom hook with type safety
export const useStudy = (): StudyContextValue => {
    const context = useContext(StudyContext);
    if (context === undefined) {
        throw new Error('useStudy must be used within a StudyProvider');
    }
    return context;
};

export default StudyContext;
