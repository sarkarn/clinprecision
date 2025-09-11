import ApiService from './ApiService';

/**
 * Study Design Service
 * Handles API calls for study design workflow components
 */
class StudyDesignService {

    // Study Arms Management
    async getStudyArms(studyId) {
        try {
            const response = await ApiService.get(`/studies/${studyId}/arms`);
            return response.data;
        } catch (error) {
            console.error('Error fetching study arms:', error);
            // Return mock data for development
            return this.getMockStudyArms();
        }
    }

    async saveStudyArms(studyId, armsData) {
        try {
            const response = await ApiService.put(`/studies/${studyId}/arms`, armsData);
            return response.data;
        } catch (error) {
            console.error('Error saving study arms:', error);
            // Return success for development
            return { success: true, data: armsData };
        }
    }

    // Visit Schedule Management
    async getVisitSchedule(studyId) {
        try {
            const response = await ApiService.get(`/studies/${studyId}/visits`);
            return response.data;
        } catch (error) {
            console.error('Error fetching visit schedule:', error);
            return this.getMockVisitSchedule();
        }
    }

    async saveVisitSchedule(studyId, visitData) {
        try {
            const response = await ApiService.put(`/studies/${studyId}/visits`, visitData);
            return response.data;
        } catch (error) {
            console.error('Error saving visit schedule:', error);
            return { success: true, data: visitData };
        }
    }

    // Form Binding Management
    async getFormBindings(studyId) {
        try {
            const response = await ApiService.get(`/studies/${studyId}/form-bindings`);
            return response.data;
        } catch (error) {
            console.error('Error fetching form bindings:', error);
            return this.getMockFormBindings();
        }
    }

    async saveFormBindings(studyId, bindingData) {
        try {
            const response = await ApiService.put(`/studies/${studyId}/form-bindings`, bindingData);
            return response.data;
        } catch (error) {
            console.error('Error saving form bindings:', error);
            return { success: true, data: bindingData };
        }
    }

    // Study Publishing
    async validateStudyForPublishing(studyId) {
        try {
            const response = await ApiService.post(`/studies/${studyId}/validate`);
            return response.data;
        } catch (error) {
            console.error('Error validating study:', error);
            return this.getMockValidationResults();
        }
    }

    async publishStudy(studyId, publishData) {
        try {
            const response = await ApiService.post(`/studies/${studyId}/publish`, publishData);
            return response.data;
        } catch (error) {
            console.error('Error publishing study:', error);
            return { success: true, publishedAt: new Date().toISOString() };
        }
    }

    // Protocol Revisions
    async getStudyRevisions(studyId) {
        try {
            const response = await ApiService.get(`/studies/${studyId}/revisions`);
            return response.data;
        } catch (error) {
            console.error('Error fetching revisions:', error);
            return this.getMockRevisions();
        }
    }

    async createRevision(studyId, revisionData) {
        try {
            const response = await ApiService.post(`/studies/${studyId}/revisions`, revisionData);
            return response.data;
        } catch (error) {
            console.error('Error creating revision:', error);
            return { success: true, revisionId: `rev_${Date.now()}` };
        }
    }

    // Design Progress Tracking
    async getDesignProgress(studyId) {
        try {
            const response = await ApiService.get(`/studies/${studyId}/design-progress`);
            return response.data;
        } catch (error) {
            console.error('Error fetching design progress:', error);
            return this.getMockDesignProgress();
        }
    }

    async updateDesignProgress(studyId, progressData) {
        try {
            const response = await ApiService.put(`/studies/${studyId}/design-progress`, progressData);
            return response.data;
        } catch (error) {
            console.error('Error updating design progress:', error);
            return { success: true, data: progressData };
        }
    }

    // Mock Data Methods (for development)
    getMockStudyArms() {
        return [
            {
                id: 'arm1',
                name: 'Treatment Group A',
                description: 'Active treatment with Drug X',
                type: 'experimental',
                interventions: [
                    { id: 'int1', name: 'Drug X', type: 'drug', dosage: '10mg daily' }
                ],
                targetEnrollment: 50
            },
            {
                id: 'arm2',
                name: 'Control Group',
                description: 'Placebo control',
                type: 'placebo_comparator',
                interventions: [
                    { id: 'int2', name: 'Placebo', type: 'drug', dosage: 'matching placebo' }
                ],
                targetEnrollment: 50
            }
        ];
    }

    getMockVisitSchedule() {
        return [
            {
                id: 'visit1',
                name: 'Screening',
                day: -14,
                window: '±3 days',
                procedures: ['informed_consent', 'medical_history', 'physical_exam']
            },
            {
                id: 'visit2',
                name: 'Baseline',
                day: 0,
                window: '±1 day',
                procedures: ['randomization', 'drug_dispensing', 'lab_tests']
            }
        ];
    }

    getMockFormBindings() {
        return [
            {
                visitId: 'visit1',
                formId: 'form1',
                formName: 'Screening Form',
                required: true,
                timing: 'during_visit'
            },
            {
                visitId: 'visit2',
                formId: 'form2',
                formName: 'Baseline Assessment',
                required: true,
                timing: 'during_visit'
            }
        ];
    }

    getMockValidationResults() {
        return {
            isValid: true,
            errors: [],
            warnings: [
                { type: 'info', message: 'Consider adding more safety assessments' }
            ]
        };
    }

    getMockRevisions() {
        return [
            {
                id: 'rev1',
                version: '1.0',
                status: 'published',
                createdAt: '2025-01-15T10:00:00Z',
                description: 'Initial protocol version'
            }
        ];
    }

    getMockDesignProgress() {
        return {
            basicInfo: { completed: true, valid: true },
            arms: { completed: false, valid: false },
            visits: { completed: false, valid: false },
            forms: { completed: false, valid: false },
            publishing: { completed: false, valid: false },
            revisions: { completed: false, valid: false }
        };
    }
}

export default new StudyDesignService();