import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StudyService from 'services/StudyService';
import FormService from 'services/FormService';
import VisitDefinitionService from 'services/VisitDefinitionService';

interface CRF {
    id: number | string;
    name: string;
    description?: string;
    formDefinition?: string;
    isActive?: boolean;
    type?: string;
    formType?: string;
    studyId?: number | string;
    isNew?: boolean;
    isModified?: boolean;
    isNewAssociation?: boolean;
    isHandled?: boolean;
    fields?: string;
}

interface Visit {
    id?: number;
    tempId?: number;
    name: string;
    timepoint: string;
    description?: string;
    crfs?: CRF[];
    isNew?: boolean;
    isModified?: boolean;
    crfsToDelete?: (number | string)[];
    crfsToAssociate?: (number | string)[];
}

interface Arm {
    id?: number;
    name: string;
    description?: string;
    visits?: Visit[];
    isDeleted?: boolean;
    visitsToDelete?: number[];
}

interface Study {
    id: number | string;
    name: string;
    phase?: string;
    status?: string;
    plannedStartDate?: string;
    plannedEndDate?: string;
    sponsor?: string;
    principalInvestigator?: string;
    arms?: Arm[];
}

interface AvailableForm {
    id: number | string;
    name: string;
    formType?: string;
    description?: string;
}

interface CurrentVisitContext {
    armIndex: number;
    visitIndex: number;
    crfIndex?: number;
    crf?: CRF;
    mode: 'edit' | 'view' | 'create';
}

const StudyEditPage: React.FC = () => {
    const { studyId } = useParams<{ studyId: string }>();
    const navigate = useNavigate();
    const [study, setStudy] = useState<Study | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('details');
    const [arms, setArms] = useState<Arm[]>([]);
    const [isCRFBuilderOpen, setIsCRFBuilderOpen] = useState<boolean>(false);
    const [currentVisit, setCurrentVisit] = useState<CurrentVisitContext | null>(null);
    const [availableForms, setAvailableForms] = useState<AvailableForm[]>([]);
    const [formLoading, setFormLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchStudy = async (): Promise<void> => {
            try {
                const studyData = await StudyService.getStudyById(studyId as any);
                setStudy(studyData as any);

                // Get study arms from study data
                setArms((studyData as any).arms || []);

                setLoading(false);
            } catch (err) {
                setError('Failed to load study');
                setLoading(false);
                console.error(err);
            }
        };

        const fetchAvailableForms = async (): Promise<void> => {
            setFormLoading(true);
            try {
                const forms = await FormService.getForms();
                setAvailableForms(Array.isArray(forms) ? forms as any : []);
            } catch (err) {
                console.error("Error fetching available forms:", err);
            } finally {
                setFormLoading(false);
            }
        };

        if (studyId) {
            fetchStudy();
            fetchAvailableForms();
        }
    }, [studyId]);

    const handleStudyChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setStudy({
            ...study!,
            [name]: value
        });
    };

    const handleSaveStudy = async (e?: FormEvent<HTMLFormElement>): Promise<void> => {
        if (e) e.preventDefault();

        // Show a saving indicator
        setLoading(true);

        try {
            // Keep track of deleted arms to exclude them from the update
            const armsToKeep = arms.filter(arm => !arm.isDeleted);

            // 1. Update study details first
            console.log("Attempting to update study details...");
            try {
                // Use the standard updateStudy method
                await StudyService.updateStudy(studyId as any, study as any);
                console.log("Study details updated successfully");
            } catch (err: any) {
                console.error("All study detail update methods failed:", err);
                // If all update methods fail, show error and stop processing
                setLoading(false);
                alert(`Error updating study details: ${err.message || 'Unknown error'}. Please try again later.`);
                return;
            }

            // 2. Process arms separately (create/update)
            for (const arm of arms) {
                if (arm.isDeleted) continue; // Skip deleted arms

                let armId = arm.id;

                // Create or update arm
                if (!armId) {
                    // For new arms, create them
                    const armData: any = {
                        name: arm.name,
                        description: arm.description,
                        studyId: studyId
                    };
                    const newArm = await (StudyService as any).createStudyArm(studyId as any, armData);
                    armId = newArm.id;
                    // Update local arm with server-assigned ID
                    const armIndex = arms.findIndex(a => a === arm);
                    if (armIndex !== -1) {
                        arms[armIndex].id = armId;
                    }
                } else {
                    // For existing arms, update them
                    const armData: any = {
                        id: armId,
                        name: arm.name,
                        description: arm.description,
                        studyId: studyId
                    };
                    await (StudyService as any).updateStudyArm(studyId as any, armId as any, armData);
                }

                // 3. Process visits for this arm
                if (arm.visits) {
                    for (const visit of arm.visits) {
                        let visitId = visit.id;

                        // Create new visits
                        if (visit.isNew) {
                            const visitData: any = {
                                name: visit.name,
                                timepoint: visit.timepoint,
                                description: visit.description,
                                armId: armId  // Include arm reference
                            };
                            const newVisit = await VisitDefinitionService.createVisit(studyId as any, visitData);
                            visitId = newVisit.id;
                            visit.id = visitId; // Update with server ID
                            visit.isNew = false;
                        }
                        // Update modified visits
                        else if (visit.isModified) {
                            const visitData: any = {
                                name: visit.name,
                                timepoint: visit.timepoint,
                                description: visit.description,
                                armId: armId  // Include arm reference
                            };
                            await VisitDefinitionService.updateVisit(studyId as any, visitId as any, visitData);
                            visit.isModified = false;
                        }

                        // 4. Process CRFs for this visit
                        if (visit.crfs) {
                            for (const crf of visit.crfs) {
                                // Create new CRFs
                                if (crf.isNew) {
                                    try {
                                        const crfData: any = {
                                            name: crf.name || 'New CRF',
                                            description: crf.description || '',
                                            formDefinition: crf.formDefinition || '{}',
                                            fields: crf.fields || '[]', // Required by the database
                                            formType: crf.formType || crf.type || 'custom',
                                            isActive: true,
                                            studyId: studyId
                                        };

                                        const newCrf = await FormService.createForm(crfData);
                                        crf.id = newCrf.id; // Update with server ID

                                        // Associate with visit
                                        await FormService.associateFormWithVisit(studyId as any, visitId as any, newCrf.id as any);
                                        crf.isNew = false;
                                    } catch (crfError) {
                                        console.error("Failed to create or associate CRF:", crfError);
                                        // Generate a temporary ID to allow frontend to continue
                                        if (!crf.id) {
                                            crf.id = `temp-crf-${Date.now()}`;
                                        }
                                        // Mark as handled but still new to avoid duplicate creation attempts
                                        crf.isHandled = true;
                                    }
                                }
                                // Update modified CRFs
                                else if (crf.isModified) {
                                    try {
                                        const crfData: any = {
                                            name: crf.name || 'Updated CRF',
                                            description: crf.description || '',
                                            formType: crf.formType || crf.type || 'custom',
                                            fields: crf.fields || '[]' // Required by the database
                                        };

                                        // If formDefinition was changed, include it
                                        if (crf.formDefinition) {
                                            crfData.formDefinition = crf.formDefinition;
                                        }

                                        await FormService.updateForm(crf.id as any, crfData);
                                        crf.isModified = false;
                                    } catch (crfError) {
                                        console.error("Failed to update CRF:", crfError);
                                        // Mark as handled but not modified to avoid duplicate update attempts
                                        crf.isModified = false;
                                        crf.isHandled = true;
                                    }
                                }
                                // Create new associations
                                else if (crf.isNewAssociation) {
                                    try {
                                        await FormService.associateFormWithVisit(studyId as any, visitId as any, crf.id as any);
                                        crf.isNewAssociation = false;
                                    } catch (assocError) {
                                        console.error("Failed to associate CRF with visit:", assocError);
                                        // Mark as handled but not new association to avoid duplicate attempts
                                        crf.isNewAssociation = false;
                                        crf.isHandled = true;
                                    }
                                }
                            }

                            // Process CRF deletions
                            if (visit.crfsToDelete && visit.crfsToDelete.length > 0) {
                                for (const crfId of visit.crfsToDelete) {
                                    try {
                                        await FormService.removeFormFromVisit(studyId as any, visitId as any, crfId as any);
                                    } catch (deleteError) {
                                        console.error(`Failed to remove CRF ${crfId} from visit ${visitId}:`, deleteError);
                                        // Continue with other deletions even if one fails
                                    }
                                }
                                visit.crfsToDelete = [];
                            }
                        }
                    }

                    // Process visit deletions
                    if (arm.visitsToDelete && arm.visitsToDelete.length > 0) {
                        for (const visitId of arm.visitsToDelete) {
                            await VisitDefinitionService.deleteVisit(studyId as any, String(visitId));
                        }
                        arm.visitsToDelete = [];
                    }
                }
            }

            setLoading(false);
            alert('Study changes saved successfully!');

            // Reset all tracking flags
            const cleanedArms = JSON.parse(JSON.stringify(arms)) as Arm[];
            cleanedArms.forEach(arm => {
                delete arm.visitsToDelete;
                if (arm.visits) {
                    arm.visits.forEach(visit => {
                        delete visit.isNew;
                        delete visit.isModified;
                        delete visit.crfsToDelete;
                        delete visit.crfsToAssociate;
                        delete visit.tempId;

                        if (visit.crfs) {
                            visit.crfs.forEach(crf => {
                                delete crf.isNew;
                                delete crf.isModified;
                                delete crf.isNewAssociation;
                            });
                        }
                    });
                }
            });

            setArms(cleanedArms);

            // Optionally navigate away
            // navigate('/study-design/list');
        } catch (error: any) {
            setLoading(false);
            alert(`Error saving study: ${error.message || 'Unknown error'}. Some changes may not have been saved.`);
            console.error("Error in handleSaveStudy:", error);
        }
    };

    const addArm = (): void => {
        const newArm: Arm = {
            name: `Arm ${arms.length + 1}`,
            description: '',
            visits: []
        };
        setArms([...arms, newArm]);
    };

    const updateArm = (index: number, field: keyof Arm, value: string): void => {
        const updatedArms = [...arms];
        updatedArms[index] = {
            ...updatedArms[index],
            [field]: value
        };
        setArms(updatedArms);
    };

    const deleteArm = async (index: number): Promise<void> => {
        if (window.confirm('Are you sure you want to delete this arm?')) {
            const arm = arms[index];

            // Delete from server if it has an ID
            if (arm.id) {
                try {
                    await (StudyService as any).deleteStudyArm(studyId as any, arm.id as any);
                } catch (error: any) {
                    console.error("Error deleting arm:", error);
                    alert(`Error deleting arm: ${error.message || 'Unknown error'}`);
                    return;
                }
            }

            // Instead of removing from the array, mark it as deleted
            const updatedArms = [...arms];
            updatedArms[index] = {
                ...updatedArms[index],
                isDeleted: true
            };

            // Update local state - filter out deleted arms from UI
            setArms(updatedArms.filter(arm => !arm.isDeleted));
        }
    };

    const addVisit = (armIndex: number): void => {
        const updatedArms = [...arms];
        const arm = updatedArms[armIndex];

        // Generate a temporary ID for the new visit (negative to distinguish from server IDs)
        const tempId = -Math.floor(Math.random() * 1000000);

        const newVisit: Visit = {
            tempId: tempId,
            name: `Visit ${(arm.visits || []).length + 1}`,
            timepoint: '0',
            description: '',
            crfs: [],
            isNew: true
        };

        // Initialize visits array if it doesn't exist
        if (!arm.visits) arm.visits = [];
        arm.visits.push(newVisit);

        setArms(updatedArms);
    };

    const updateVisit = (armIndex: number, visitIndex: number, field: keyof Visit, value: string): void => {
        const updatedArms = [...arms];
        const arm = updatedArms[armIndex];
        const visit = arm.visits![visitIndex];

        // Update the field in memory
        (visit as any)[field] = value;

        // Mark the visit as modified if it's not a new visit
        if (!visit.isNew && !visit.isModified) {
            visit.isModified = true;
        }

        setArms(updatedArms);
    };

    const deleteVisit = (armIndex: number, visitIndex: number): void => {
        if (window.confirm('Are you sure you want to delete this visit?')) {
            const updatedArms = [...arms];
            const arm = updatedArms[armIndex];
            const visit = arm.visits![visitIndex];

            // If it's an existing visit (has a real ID), mark it for deletion
            if (visit.id && !visit.isNew) {
                // Keep track of visits to delete on save
                if (!arm.visitsToDelete) {
                    arm.visitsToDelete = [];
                }
                arm.visitsToDelete.push(visit.id);
            }

            // Remove from UI immediately
            arm.visits = arm.visits!.filter((_, i) => i !== visitIndex);
            setArms(updatedArms);
        }
    };

    const addCRF = (armIndex: number, visitIndex: number): void => {
        const updatedArms = [...arms];
        const tempId = `temp-crf-${Date.now()}`;
        const newCRF: CRF = {
            id: tempId,
            name: '',
            description: '',
            formDefinition: '{}',
            isActive: true,
            isNew: true,
            studyId: studyId,
            type: 'custom',
            formType: 'custom'
        };

        if (!updatedArms[armIndex].visits![visitIndex].crfs) {
            updatedArms[armIndex].visits![visitIndex].crfs = [];
        }

        updatedArms[armIndex].visits![visitIndex].crfs!.push(newCRF);
        setArms(updatedArms);

        // Open the CRF builder with the newly created CRF
        const crfIndex = updatedArms[armIndex].visits![visitIndex].crfs!.length - 1;
        setCurrentVisit({ armIndex, visitIndex, crfIndex, crf: newCRF, mode: 'edit' });
        setIsCRFBuilderOpen(true);
    };

    const handleCRFSave = (newCRF: CRF): void => {
        const updatedArms = [...arms];
        const { armIndex, visitIndex, crfIndex, mode } = currentVisit!;
        const arm = updatedArms[armIndex];
        const visit = arm.visits![visitIndex];

        if (mode === 'edit' && crfIndex !== undefined) {
            // Update existing CRF
            const crf = visit.crfs![crfIndex];
            const updatedCRF: CRF = {
                ...crf,
                ...newCRF,
                isModified: !crf.isNew
            };

            visit.crfs![crfIndex] = updatedCRF;
        } else {
            // Add new CRF
            if (!visit.crfs) {
                visit.crfs = [];
            }

            const tempId = `temp-crf-${Date.now()}`;
            const newCRFWithId: CRF = {
                ...newCRF,
                id: tempId,
                isNew: true,
                formType: newCRF.formType || newCRF.type || 'custom',
                studyId: studyId
            };

            visit.crfs.push(newCRFWithId);
        }

        setArms(updatedArms);
        setIsCRFBuilderOpen(false);
    };

    const updateCRF = (armIndex: number, visitIndex: number, crfIndex: number, field: keyof CRF, value: string): void => {
        const updatedArms = [...arms];
        const arm = updatedArms[armIndex];
        const visit = arm.visits![visitIndex];
        const crf = visit.crfs![crfIndex];

        const updatedCRF: CRF = {
            ...crf,
            [field]: value
        };

        // Special handling for type field - also update formType to match
        if (field === 'type') {
            updatedCRF.formType = value;
        }

        // Mark as modified if it's not a new CRF
        if (!crf.isNew && !crf.isModified) {
            updatedCRF.isModified = true;
        }

        visit.crfs![crfIndex] = updatedCRF;
        setArms(updatedArms);
    };

    const deleteCRF = (armIndex: number, visitIndex: number, crfIndex: number): void => {
        if (window.confirm('Are you sure you want to delete this CRF?')) {
            const updatedArms = [...arms];
            const arm = updatedArms[armIndex];
            const visit = arm.visits![visitIndex];
            const crf = visit.crfs![crfIndex];

            // If it's an existing CRF (has a real ID, not a temp ID), mark it for deletion
            if (crf.id && !crf.isNew) {
                // Keep track of CRFs to delete on save
                if (!visit.crfsToDelete) {
                    visit.crfsToDelete = [];
                }
                visit.crfsToDelete.push(crf.id);
            }

            // Remove from UI immediately
            visit.crfs = visit.crfs!.filter((_, i) => i !== crfIndex);
            setArms(updatedArms);
        }
    };

    const associateExistingForm = (armIndex: number, visitIndex: number, formId: string): void => {
        const updatedArms = [...arms];
        const arm = updatedArms[armIndex];
        const visit = arm.visits![visitIndex];

        // Find the form in available forms
        const form = availableForms.find(f => String(f.id) === formId);
        if (!form) {
            alert('Selected form not found');
            return;
        }

        // Keep track of associations to create on save
        if (!visit.crfsToAssociate) {
            visit.crfsToAssociate = [];
        }
        visit.crfsToAssociate.push(formId);

        // Add to local state
        if (!visit.crfs) visit.crfs = [];

        // Add a copy of the form with an association flag
        const formCopy: CRF = {
            ...(form as any),
            isNewAssociation: true
        };

        visit.crfs.push(formCopy);
        setArms(updatedArms);
    };

    if (loading) return <div className="text-center py-4">Loading study...</div>;
    if (error) return <div className="text-red-500 py-4">{error}</div>;
    if (!study) return <div className="text-center py-4">Study not found</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <Link to="/study-design/studies" className="text-blue-600 hover:underline">
                    &larr; Back to Studies
                </Link>
                <h2 className="text-2xl font-bold mt-2">Edit Study: {study.name}</h2>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex -mb-px">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Study Details
                    </button>
                    <button
                        onClick={() => setActiveTab('arms')}
                        className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'arms'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Study Arms & Visits
                    </button>
                </nav>
            </div>

            {/* Study Details Tab */}
            {activeTab === 'details' && (
                <form onSubmit={handleSaveStudy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Study ID
                            </label>
                            <input
                                type="text"
                                value={study.id}
                                disabled
                                className="bg-gray-100 border border-gray-300 rounded-md w-full p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Study Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={study.name}
                                onChange={handleStudyChange}
                                className="border border-gray-300 rounded-md w-full p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phase
                            </label>
                            <select
                                name="phase"
                                value={study.phase}
                                onChange={handleStudyChange}
                                className="border border-gray-300 rounded-md w-full p-2"
                            >
                                <option value="Phase I">Phase I</option>
                                <option value="Phase II">Phase II</option>
                                <option value="Phase III">Phase III</option>
                                <option value="Phase IV">Phase IV</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={study.status}
                                onChange={handleStudyChange}
                                className="border border-gray-300 rounded-md w-full p-2"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Recruiting">Recruiting</option>
                                <option value="Active">Active</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Planned Start Date
                            </label>
                            <input
                                type="date"
                                name="plannedStartDate"
                                value={study.plannedStartDate}
                                onChange={handleStudyChange}
                                className="border border-gray-300 rounded-md w-full p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Planned End Date
                            </label>
                            <input
                                type="date"
                                name="plannedEndDate"
                                value={study.plannedEndDate}
                                onChange={handleStudyChange}
                                className="border border-gray-300 rounded-md w-full p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sponsor
                            </label>
                            <input
                                type="text"
                                name="sponsor"
                                value={study.sponsor}
                                onChange={handleStudyChange}
                                className="border border-gray-300 rounded-md w-full p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Principal Investigator
                            </label>
                            <input
                                type="text"
                                name="principalInvestigator"
                                value={study.principalInvestigator || ''}
                                onChange={handleStudyChange}
                                className="border border-gray-300 rounded-md w-full p-2"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/study-design/studies')}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            )}

            {/* Study Arms & Visits Tab */}
            {activeTab === 'arms' && (
                <div>
                    <div className="mb-4 flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Study Arms</h3>
                        <button
                            onClick={addArm}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                            + Add Arm
                        </button>
                    </div>

                    {arms.length === 0 ? (
                        <p className="text-gray-500">No arms defined for this study. Add an arm to get started.</p>
                    ) : (
                        <div className="space-y-6">
                            {arms.map((arm, armIndex) => (
                                <div key={arm.id || armIndex} className="border rounded-lg p-4">
                                    {/* Arm Header */}
                                    <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="text"
                                                    value={arm.name}
                                                    onChange={(e) => updateArm(armIndex, 'name', e.target.value)}
                                                    className="border border-gray-300 rounded-md p-2 font-medium w-64"
                                                    placeholder="Arm Name"
                                                />
                                                <input
                                                    type="text"
                                                    value={arm.description || ''}
                                                    onChange={(e) => updateArm(armIndex, 'description', e.target.value)}
                                                    className="border border-gray-300 rounded-md p-2 flex-1"
                                                    placeholder="Arm Description"
                                                />
                                                <button
                                                    onClick={() => deleteArm(armIndex)}
                                                    className="text-red-600 hover:text-red-800 px-2 py-1"
                                                >
                                                    Delete Arm
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visits Section */}
                                    <div className="pl-4 mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-medium text-blue-600">Visits</h4>
                                            <button
                                                onClick={() => addVisit(armIndex)}
                                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                                            >
                                                + Add Visit
                                            </button>
                                        </div>

                                        {!arm.visits || arm.visits.length === 0 ? (
                                            <p className="text-gray-500 text-sm ml-4">No visits defined for this arm.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {arm.visits.map((visit, visitIndex) => (
                                                    <div key={visit.id || visitIndex} className="border-l-2 border-blue-300 pl-4 ml-2">
                                                        {/* Visit Header */}
                                                        <div className="flex items-center justify-between bg-blue-50 p-2 rounded mb-2">
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <input
                                                                    type="text"
                                                                    value={visit.name}
                                                                    onChange={(e) => updateVisit(armIndex, visitIndex, 'name', e.target.value)}
                                                                    className="border border-gray-200 rounded p-1 w-48"
                                                                    placeholder="Visit Name"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    value={visit.timepoint}
                                                                    onChange={(e) => updateVisit(armIndex, visitIndex, 'timepoint', e.target.value)}
                                                                    className="border border-gray-200 rounded p-1 w-24"
                                                                    placeholder="Days"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={visit.description || ''}
                                                                    onChange={(e) => updateVisit(armIndex, visitIndex, 'description', e.target.value)}
                                                                    className="border border-gray-200 rounded p-1 flex-1"
                                                                    placeholder="Visit Description"
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <div className="flex items-center mr-2">
                                                                    <select
                                                                        className="border border-gray-200 rounded p-1 text-xs"
                                                                        onChange={(e) => {
                                                                            if (e.target.value) {
                                                                                associateExistingForm(armIndex, visitIndex, e.target.value);
                                                                                e.target.value = ''; // Reset after selection
                                                                            }
                                                                        }}
                                                                        disabled={formLoading}
                                                                    >
                                                                        <option value="">Add Existing Form...</option>
                                                                        {availableForms.map(form => (
                                                                            <option key={form.id} value={String(form.id)}>
                                                                                {form.name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <button
                                                                    onClick={() => addCRF(armIndex, visitIndex)}
                                                                    className="bg-green-500 text-white px-2 py-1 rounded text-xs mr-2"
                                                                >
                                                                    + Create CRF
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteVisit(armIndex, visitIndex)}
                                                                    className="text-red-600 hover:text-red-800 px-2 py-1"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* CRFs Section */}
                                                        <div className="pl-4">
                                                            {!visit.crfs || visit.crfs.length === 0 ? (
                                                                <p className="text-gray-500 text-sm ml-4">No CRFs assigned to this visit.</p>
                                                            ) : (
                                                                <div className="ml-2">
                                                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded">
                                                                        <thead className="bg-gray-50">
                                                                            <tr>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                    CRF Name
                                                                                </th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                    Type
                                                                                </th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                    Description
                                                                                </th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                    Actions
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                            {visit.crfs.map((crf, crfIndex) => (
                                                                                <tr key={crf.id || crfIndex} className="hover:bg-gray-50">
                                                                                    <td className="px-4 py-2">
                                                                                        <input
                                                                                            type="text"
                                                                                            value={crf.name}
                                                                                            onChange={(e) => updateCRF(armIndex, visitIndex, crfIndex, 'name', e.target.value)}
                                                                                            className="border border-gray-200 rounded p-1 w-full"
                                                                                            placeholder="CRF Name"
                                                                                        />
                                                                                    </td>
                                                                                    <td className="px-4 py-2">
                                                                                        <select
                                                                                            value={crf.type || 'custom'}
                                                                                            onChange={(e) => updateCRF(armIndex, visitIndex, crfIndex, 'type', e.target.value)}
                                                                                            className="border border-gray-200 rounded p-1 w-full"
                                                                                        >
                                                                                            <option value="demographics">Demographics</option>
                                                                                            <option value="vitals">Vital Signs</option>
                                                                                            <option value="labs">Lab Results</option>
                                                                                            <option value="medication">Medication</option>
                                                                                            <option value="adverse">Adverse Events</option>
                                                                                            <option value="custom">Custom</option>
                                                                                        </select>
                                                                                    </td>
                                                                                    <td className="px-4 py-2">
                                                                                        <input
                                                                                            type="text"
                                                                                            value={crf.description || ''}
                                                                                            onChange={(e) => updateCRF(armIndex, visitIndex, crfIndex, 'description', e.target.value)}
                                                                                            className="border border-gray-200 rounded p-1 w-full"
                                                                                            placeholder="CRF Description"
                                                                                        />
                                                                                    </td>
                                                                                    <td className="px-4 py-2">
                                                                                        <div className="flex space-x-2">
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    const crf = visit.crfs![crfIndex];
                                                                                                    setCurrentVisit({ armIndex, visitIndex, crfIndex, crf, mode: 'edit' });
                                                                                                    setIsCRFBuilderOpen(true);
                                                                                                }}
                                                                                                className="text-yellow-600 hover:text-yellow-800"
                                                                                                title="Edit CRF"
                                                                                            >
                                                                                                Edit
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    const crf = visit.crfs![crfIndex];
                                                                                                    setCurrentVisit({ armIndex, visitIndex, crfIndex, crf, mode: 'view' });
                                                                                                    setIsCRFBuilderOpen(true);
                                                                                                }}
                                                                                                className="text-blue-600 hover:text-blue-800"
                                                                                                title="View CRF"
                                                                                            >
                                                                                                View
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => deleteCRF(armIndex, visitIndex, crfIndex)}
                                                                                                className="text-red-600 hover:text-red-800"
                                                                                                title="Delete CRF"
                                                                                            >
                                                                                                Delete
                                                                                            </button>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={() => handleSaveStudy()}
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Save All Changes
                        </button>
                    </div>
                </div>
            )}

            {/* CRF Builder Modal */}
            {isCRFBuilderOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                    <div className="bg-white rounded-lg shadow-lg p-6 z-10 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Form Builder Available</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                The comprehensive Form Builder with clinical metadata is now available in the dedicated Forms section.
                            </p>
                            <div className="flex space-x-3 justify-center">
                                <button
                                    onClick={() => {
                                        navigate(`/study-design/study/${studyId}/forms/builder`);
                                        setIsCRFBuilderOpen(false);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Go to Study Form Builder
                                </button>
                                <button
                                    onClick={() => setIsCRFBuilderOpen(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyEditPage;
