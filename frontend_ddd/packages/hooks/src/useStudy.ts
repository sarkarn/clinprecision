import { useMemo } from 'react';
import { useStudy as useStudyContext } from '@shared/context/StudyContext';
import type { Study } from '@shared/types/study.types';

type StudyIdentifier = string | number | null;
type StudySelectionInput = StudyIdentifier | Study | null;

interface UseStudyResult {
	selectedStudy: StudyIdentifier;
	selectedStudyDetails: Study | null;
	setSelectedStudy: (selection: StudySelectionInput) => void;
	clearSelectedStudy: () => void;
}

/**
 * Thin wrapper around the StudyContext hook that normalizes study selection
 * so legacy screens can continue to work with just an ID while newer flows
 * can opt into full Study objects.
 */
export const useStudy = (): UseStudyResult => {
	const { selectedStudy, setSelectedStudy, clearSelectedStudy } = useStudyContext();

	const normalizedId = useMemo<StudyIdentifier>(() => {
		if (typeof selectedStudy === 'string' || typeof selectedStudy === 'number') {
			return selectedStudy;
		}

		if (selectedStudy && typeof selectedStudy === 'object') {
			const { id } = selectedStudy as Study;
			if (typeof id === 'number' || typeof id === 'string') {
				return id;
			}
		}

		return null;
	}, [selectedStudy]);

	const studyDetails = useMemo<Study | null>(() => {
		return selectedStudy && typeof selectedStudy === 'object' ? (selectedStudy as Study) : null;
	}, [selectedStudy]);

	const handleSetSelectedStudy = (selection: StudySelectionInput) => {
		setSelectedStudy(selection);
	};

	return {
		selectedStudy: normalizedId,
		selectedStudyDetails: studyDetails,
		setSelectedStudy: handleSetSelectedStudy,
		clearSelectedStudy,
	};
};

export default useStudy;
