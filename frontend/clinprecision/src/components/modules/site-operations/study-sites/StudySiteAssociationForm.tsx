import React, { useEffect, useMemo, useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import SiteService from '../../../../services/SiteService';
import StudyService from '../../../../services/StudyService';

interface Site {
    id: number | string;
    name: string;
    siteNumber: string;
}

interface Study {
    id: number | string;
    protocolNumber?: string;
    title?: string;
    name?: string;
}

interface Association {
    id: number | string;
    siteId: number | string;
    studyId: number | string;
    siteName?: string;
    siteNumber?: string;
    subjectEnrollmentCap?: number;
    subjectEnrollmentCount?: number;
}

interface AvailableStudy {
    key: string;
    label: string;
}

export default function StudySiteAssociationForm(): React.ReactElement {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // association ID for edit mode

    const [sites, setSites] = useState<Site[]>([]);
    const [studies, setStudies] = useState<Study[]>([]);
    const [selectedSiteId, setSelectedSiteId] = useState<string>('');
    const [selectedStudyId, setSelectedStudyId] = useState<string>('');
    const [reason, setReason] = useState<string>('Initial site onboarding to study');
    const [enrollmentCap, setEnrollmentCap] = useState<string>('');
    const [enrollmentCount, setEnrollmentCount] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [existingAssociation, setExistingAssociation] = useState<Association | null>(null);

    useEffect(() => {
        const load = async (): Promise<void> => {
            try {
                setLoading(true);
                setError(null);
      const [siteList, studyList] = await Promise.all([
        SiteService.getAllSites(),
        StudyService.getStudies()
      ]);
      setSites(siteList as any || []);
      setStudies(studyList as any || []);                // If id is present, we're in edit mode - find the association
                if (id) {
                    setIsEditMode(true);
                    setReason('Updating study site association');

                    // Load all associations to find the one we need
                    const allAssociations: Association[] = [];
                    for (const site of siteList) {
                        try {
                            const siteAssociations = await SiteService.getStudyAssociationsForSite(site.id as any);
                            const enrichedAssociations = siteAssociations.map((assoc: any) => ({
                                ...assoc,
                                siteId: site.id,
                                siteName: site.name,
                                siteNumber: site.siteNumber
                            }));
                            allAssociations.push(...enrichedAssociations);
                        } catch (error) {
                            console.warn(`Failed to load associations for site ${site.id}:`, error);
                        }
                    }

                    // Find the association with matching ID (convert to string for comparison)
                    console.log('Looking for association ID:', id, 'Type:', typeof id);
                    console.log('Available associations:', allAssociations.map(a => ({ id: a.id, type: typeof a.id })));

                    const association = allAssociations.find(a => String(a.id) === String(id));
                    if (association) {
                        console.log('Found association:', association);
                        setExistingAssociation(association);
                        setSelectedSiteId(String(association.siteId));
                        setSelectedStudyId(String(association.studyId));
                        setEnrollmentCap(association.subjectEnrollmentCap ? String(association.subjectEnrollmentCap) : '');
                        setEnrollmentCount(association.subjectEnrollmentCount ? String(association.subjectEnrollmentCount) : '');
                    } else {
                        console.error('Association not found. Searched ID:', id, 'Available IDs:', allAssociations.map(a => a.id));
                        setError(`Association with ID ${id} not found`);
                    }
                }
            } catch (e: any) {
                console.error('Failed to load form data', e);
                setError('Failed to load sites or studies');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    // Optionally: filter out studies already associated with selected site
    const associatedStudyIdsForSelectedSite = useMemo(() => {
        return [];
    }, [selectedSiteId]);

    const availableStudies = useMemo((): AvailableStudy[] => {
        if (!Array.isArray(studies)) return [];
        // Use numeric study.id as the association key; display protocolNumber for readability
        return studies.map(s => ({
            key: String(s.id),
            label: `${s.protocolNumber || s.id} - ${s.title || s.name || 'Untitled'}`
        })).filter(s => !associatedStudyIdsForSelectedSite.includes(s.key));
    }, [studies, associatedStudyIdsForSelectedSite]);

    const validate = (): string[] => {
        const errs: string[] = [];
        if (!selectedSiteId) errs.push('Please select a site');
        if (!selectedStudyId) errs.push('Please select a study');
        if (!reason || reason.trim().length < 4) errs.push('Please provide a brief reason (min 4 chars)');

        // Validate enrollment numbers if provided
        if (enrollmentCap && (isNaN(Number(enrollmentCap)) || Number(enrollmentCap) < 0)) {
            errs.push('Enrollment cap must be a positive number');
        }
        if (enrollmentCount && (isNaN(Number(enrollmentCount)) || Number(enrollmentCount) < 0)) {
            errs.push('Enrollment count must be a positive number');
        }
        if (enrollmentCap && enrollmentCount && Number(enrollmentCount) > Number(enrollmentCap)) {
            errs.push('Enrollment count cannot exceed enrollment cap');
        }

        return errs;
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        const errs = validate();
        if (errs.length) {
            setError(errs.join('\n'));
            return;
        }
        try {
            setSubmitting(true);
            setError(null);

            if (isEditMode) {
                // Update existing association
                const updateData = {
                    reason,
                    subjectEnrollmentCap: enrollmentCap ? Number(enrollmentCap) : null,
                    subjectEnrollmentCount: enrollmentCount ? Number(enrollmentCount) : null
                };
                await SiteService.updateSiteStudyAssociation(
                    selectedSiteId as any,
                    Number(selectedStudyId),
                    updateData as any
                );
                setNotice('Association updated successfully');
            } else {
                // Create new association
                await SiteService.associateSiteWithStudy(
                    selectedSiteId as any,
                    { studyId: Number(selectedStudyId), reason } as any
                );
                setNotice('Association created successfully');
            }

            // small delay for UX, then go back to list
            setTimeout(() => navigate('/site-operations/study-sites'), 600);
        } catch (e: any) {
            console.error(`${isEditMode ? 'Update' : 'Create'} association failed`, e);
            setError(e?.response?.data || e.message || `Failed to ${isEditMode ? 'update' : 'create'} association`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="flex items-center text-gray-600">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading form...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {isEditMode ? 'Edit Study Site Association' : 'Create Study Site Association'}
                </h1>
                <p className="text-gray-600 mb-6">
                    {isEditMode
                        ? 'Update the enrollment settings for this study-site association.'
                        : 'Link an existing site to a study for activation and tracking.'}
                </p>

                {error && (
                    <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-800 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        <span>{error}</span>
                    </div>
                )}
                {notice && (
                    <div className="mb-4 p-3 rounded border border-green-200 bg-green-50 text-green-800 flex items-center">
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        <span>{notice}</span>
                    </div>
                )}

                <form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
                        <select
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={selectedSiteId}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedSiteId(e.target.value)}
                            disabled={isEditMode}
                        >
                            <option value="">Select a site...</option>
                            {sites.map(s => (
                                <option key={s.id} value={s.id}>{s.siteNumber} - {s.name}</option>
                            ))}
                        </select>
                        {isEditMode && (
                            <p className="mt-1 text-sm text-gray-500">Site cannot be changed in edit mode</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Study</label>
                        <select
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={selectedStudyId}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedStudyId(e.target.value)}
                            disabled={isEditMode}
                        >
                            <option value="">Select a study...</option>
                            {availableStudies.map(s => (
                                <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                        </select>
                        {isEditMode && (
                            <p className="mt-1 text-sm text-gray-500">Study cannot be changed in edit mode</p>
                        )}
                    </div>

                    {isEditMode && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subject Enrollment Cap
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Maximum number of subjects"
                                    value={enrollmentCap}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEnrollmentCap(e.target.value)}
                                    min="0"
                                />
                                <p className="mt-1 text-sm text-gray-500">Leave blank for no limit</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Enrollment Count
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Current number of enrolled subjects"
                                    value={enrollmentCount}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEnrollmentCount(e.target.value)}
                                    min="0"
                                />
                                <p className="mt-1 text-sm text-gray-500">Current enrollment status</p>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder={isEditMode ? "Provide a reason for this update" : "Provide an audit reason for this association"}
                            value={reason}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate('/site-operations/study-sites')}
                            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center"
                            disabled={submitting}
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {isEditMode ? 'Update Association' : 'Create Association'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
