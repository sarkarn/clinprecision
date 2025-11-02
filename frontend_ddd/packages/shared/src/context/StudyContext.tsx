import React, { createContext, useState, useEffect, useContext } from 'react';
import type { Study } from '../types/study.types';

// Allow selected study to be represented as a Study object or simple identifier
export type StudySelection = Study | string | number | null;

// Define the shape of the context value
interface StudyContextValue {
    selectedStudy: StudySelection;
    setSelectedStudy: (selection: StudySelection) => void;
    clearSelectedStudy: () => void;
}

// Create context with undefined default (will be checked in hook)
const StudyContext = createContext<StudyContextValue | undefined>(undefined);

// Props interface for the provider
interface StudyProviderProps {
    children: React.ReactNode;
}

export const StudyProvider: React.FC<StudyProviderProps> = ({ children }) => {
    const [selectedStudy, setSelectedStudyState] = useState<StudySelection>(() => {
        // Initialize from localStorage if available (client-side only)
        if (typeof window === 'undefined') {
            return null; // SSR: return null
        }
        
        const stored = localStorage.getItem('selectedStudy');
        if (!stored) {
            return null;
        }

        try {
            return JSON.parse(stored) as StudySelection;
        } catch (error) {
            console.error('Failed to parse stored study selection:', error);
            return null;
        }
    });

    useEffect(() => {
        // Persist to localStorage whenever selectedStudy changes (client-side only)
        if (typeof window === 'undefined') {
            return; // Skip during SSR
        }
        
        if (selectedStudy === null) {
            localStorage.removeItem('selectedStudy');
            return;
        }

        try {
            localStorage.setItem('selectedStudy', JSON.stringify(selectedStudy));
        } catch (error) {
            console.error('Failed to store study selection:', error);
        }
    }, [selectedStudy]);

    const value: StudyContextValue = {
        selectedStudy,
        setSelectedStudy: (selection: StudySelection) => setSelectedStudyState(selection),
        clearSelectedStudy: () => setSelectedStudyState(null),
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
