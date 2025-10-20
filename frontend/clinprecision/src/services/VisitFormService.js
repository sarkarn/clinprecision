import ApiService from './ApiService';

/**
 * Visit Form Service
 * Manages visit-form associations through VisitFormController endpoints
 */
class VisitFormService {
    
    // ========== Visit-Form Association Management ==========

    /**
     * Get all forms associated with a visit
     * GET /api/visits/{visitId}/forms
     */
    static async getFormsByVisitId(visitId) {
        try {
            const response = await ApiService.get(`/api/visits/${visitId}/forms`);
            return response.data;
        } catch (error) {
            console.error('Error fetching forms for visit:', error);
            throw error;
        }
    }

    /**
     * Get required forms for a visit
     * GET /api/visits/{visitId}/forms/required
     */
    static async getRequiredFormsByVisitId(visitId) {
        try {
            const response = await ApiService.get(`/api/visits/${visitId}/forms/required`);
            return response.data;
        } catch (error) {
            console.error('Error fetching required forms for visit:', error);
            throw error;
        }
    }

    /**
     * Get optional forms for a visit
     * GET /api/visits/{visitId}/forms/optional
     */
    static async getOptionalFormsByVisitId(visitId) {
        try {
            const response = await ApiService.get(`/api/visits/${visitId}/forms/optional`);
            return response.data;
        } catch (error) {
            console.error('Error fetching optional forms for visit:', error);
            throw error;
        }
    }

    /**
     * Get all visits that use a specific form
     * GET /api/forms/{formId}/visits
     */
    static async getVisitsByFormId(formId) {
        try {
            const response = await ApiService.get(`/api/forms/${formId}/visits`);
            return response.data;
        } catch (error) {
            console.error('Error fetching visits for form:', error);
            throw error;
        }
    }

    // ========== Study-level Matrix Operations ==========

    /**
     * Get visit-form matrix for a study (all associations)
     * GET /api/studies/{studyId}/visit-forms
     */
    static async getVisitFormMatrixByStudyId(studyId) {
        try {
            const response = await ApiService.get(`/api/studies/${studyId}/visit-forms`);
            return response.data;
        } catch (error) {
            console.error('Error fetching visit-form matrix for study:', error);
            throw error;
        }
    }

    /**
     * Get form bindings for a study (alias for visit-form matrix)
     * GET /api/studies/{studyId}/form-bindings
     */
    static async getFormBindingsByStudyId(studyId) {
        try {
            const response = await ApiService.get(`/api/studies/${studyId}/form-bindings`);
            return response.data;
        } catch (error) {
            console.error('Error fetching form bindings for study:', error);
            throw error;
        }
    }

    /**
     * Get conditional forms for a study
     * GET /api/studies/{studyId}/visit-forms/conditional
     */
    static async getConditionalFormsByStudyId(studyId) {
        try {
            const response = await ApiService.get(`/api/studies/${studyId}/visit-forms/conditional`);
            return response.data;
        } catch (error) {
            console.error('Error fetching conditional forms for study:', error);
            throw error;
        }
    }

    // ========== Individual Association Management ==========

    /**
     * Create a new visit-form association
     * POST /api/visit-forms
     */
    static async createVisitFormAssociation(visitFormData) {
        try {
            const response = await ApiService.post('/api/visit-forms', visitFormData);
            return response.data;
        } catch (error) {
            console.error('Error creating visit-form association:', error);
            throw error;
        }
    }

    /**
     * Update an existing visit-form association
     * PUT /api/visit-forms/{associationId}
     */
    static async updateVisitFormAssociation(associationId, visitFormData) {
        try {
            const response = await ApiService.put(`/api/visit-forms/${associationId}`, visitFormData);
            return response.data;
        } catch (error) {
            console.error('Error updating visit-form association:', error);
            throw error;
        }
    }

    /**
     * Delete a visit-form association by ID
     * DELETE /api/visit-forms/{associationId}
     */
    static async deleteVisitFormAssociation(associationId) {
        try {
            await ApiService.delete(`/api/visit-forms/${associationId}`);
        } catch (error) {
            console.error('Error deleting visit-form association:', error);
            throw error;
        }
    }

    /**
     * Delete a visit-form association by visit and form IDs
     * DELETE /api/visits/{visitId}/forms/{formId}
     */
    static async deleteVisitFormAssociationByIds(visitId, formId) {
        try {
            await ApiService.delete(`/api/visits/${visitId}/forms/${formId}`);
        } catch (error) {
            console.error('Error deleting visit-form association by IDs:', error);
            throw error;
        }
    }

    // ========== Form Binding Management (Frontend Compatibility) ==========

    /**
     * Create a new form binding for a visit
     * POST /api/studies/{studyId}/visits/{visitId}/forms/{formId}
     */
    static async createFormBinding(studyId, visitId, formId, bindingData = {}) {
        try {
            const response = await ApiService.post(
                `/api/studies/${studyId}/visits/${visitId}/forms/${formId}`, 
                {
                    visitDefinitionId: visitId,
                    formDefinitionId: formId,
                    isRequired: bindingData.isRequired !== false, // default to true
                    isConditional: bindingData.isConditional || false,
                    conditionalLogic: bindingData.conditionalLogic || null,
                    displayOrder: bindingData.displayOrder || 1,
                    instructions: bindingData.instructions || null,
                    ...bindingData
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating form binding:', error);
            throw error;
        }
    }

    /**
     * Remove a form binding from a visit
     * DELETE /api/studies/{studyId}/visits/{visitId}/forms/{formId}
     */
    static async removeFormBinding(studyId, visitId, formId) {
        try {
            await ApiService.delete(`/api/studies/${studyId}/visits/${visitId}/forms/${formId}`);
        } catch (error) {
            console.error('Error removing form binding:', error);
            throw error;
        }
    }

    /**
     * Update a form binding by ID
     * NEW URL: /api/v1/study-design/form-bindings/{bindingId}
     * OLD URL: /api/form-bindings/{bindingId} (deprecated)
     * 
     * PUT /api/v1/study-design/form-bindings/{bindingId}
     */
    static async updateFormBinding(bindingId, updates) {
        try {
            const response = await ApiService.put(`/api/v1/study-design/form-bindings/${bindingId}`, updates);
            return response.data;
        } catch (error) {
            console.error('Error updating form binding:', error);
            throw error;
        }
    }

    /**
     * Delete a form binding by ID
     * NEW URL: /api/v1/study-design/form-bindings/{bindingId}
     * OLD URL: /api/form-bindings/{bindingId} (deprecated)
     * 
     * DELETE /api/v1/study-design/form-bindings/{bindingId}
     */
    static async deleteFormBinding(bindingId) {
        try {
            await ApiService.delete(`/api/v1/study-design/form-bindings/${bindingId}`);
        } catch (error) {
            console.error('Error deleting form binding:', error);
            throw error;
        }
    }

    // ========== Form Reordering ==========

    /**
     * Reorder forms within a visit
     * PUT /api/visits/{visitId}/forms/reorder
     */
    static async reorderFormsInVisit(visitId, formIds) {
        try {
            await ApiService.put(`/api/visits/${visitId}/forms/reorder`, formIds);
        } catch (error) {
            console.error('Error reordering forms in visit:', error);
            throw error;
        }
    }

    // ========== Bulk Operations ==========

    /**
     * Bulk create visit-form associations
     * POST /api/visit-forms/bulk
     */
    static async createBulkVisitFormAssociations(visitFormAssociations) {
        try {
            const response = await ApiService.post('/api/visit-forms/bulk', visitFormAssociations);
            return response.data;
        } catch (error) {
            console.error('Error creating bulk visit-form associations:', error);
            throw error;
        }
    }

    // ========== Utility Methods ==========

    /**
     * Add multiple forms to a visit
     * Convenience method for bulk form binding
     */
    static async addFormsToVisit(studyId, visitId, formIds, bindingOptions = {}) {
        try {
            const promises = formIds.map(formId => 
                this.createFormBinding(studyId, visitId, formId, bindingOptions)
            );
            return await Promise.all(promises);
        } catch (error) {
            console.error('Error adding forms to visit:', error);
            throw error;
        }
    }

    /**
     * Remove multiple forms from a visit
     * Convenience method for bulk form removal
     */
    static async removeFormsFromVisit(studyId, visitId, formIds) {
        try {
            const promises = formIds.map(formId => 
                this.removeFormBinding(studyId, visitId, formId)
            );
            await Promise.all(promises);
        } catch (error) {
            console.error('Error removing forms from visit:', error);
            throw error;
        }
    }

    /**
     * Replace all forms for a visit
     * Removes existing forms and adds new ones
     */
    static async replaceVisitForms(studyId, visitId, newFormIds, bindingOptions = {}) {
        try {
            // First get current forms
            const currentForms = await this.getFormsByVisitId(visitId);
            
            // Remove all current forms
            if (currentForms && currentForms.length > 0) {
                const currentFormIds = currentForms.map(form => form.formDefinitionId);
                await this.removeFormsFromVisit(studyId, visitId, currentFormIds);
            }
            
            // Add new forms
            if (newFormIds && newFormIds.length > 0) {
                return await this.addFormsToVisit(studyId, visitId, newFormIds, bindingOptions);
            }
            
            return [];
        } catch (error) {
            console.error('Error replacing visit forms:', error);
            throw error;
        }
    }
}

export default VisitFormService;
