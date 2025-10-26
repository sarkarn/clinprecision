/**
 * SubjectEnrollment Component
 * 
 * EDC Blinding Compliance: Treatment arm selection removed from enrollment
 * Randomization is handled by external IWRS/RTSM system, not during patient registration
 * See: EDC_BLINDING_ARCHITECTURE_DECISION.md
 * 
 * Updated: October 2025
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudies } from 'services/StudyService';
import { enrollSubject } from 'services/SubjectService';
import { SiteService } from 'services/SiteService';

interface Study {
    id: number;
    title?: string;
    name?: string;
    studyStatus?: {
        code: string;
    };
    status?: string;
}

interface SiteOption {
    siteId: string;
    label: string;
}

interface SiteAssociation {
    id: number;
    status?: string | { name?: string; status?: string };
    siteNumber?: string;
    site_num?: string;
    siteCode?: string;
    siteName?: string;
    site_name?: string;
    name?: string;
    __status?: string;
}

interface FormData {
    subjectId: string;
    studyId: string;
    siteId: string;
    enrollmentDate: string;
    status: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

const SubjectEnrollment: React.FC = () => {
    const [studies, setStudies] = useState<Study[]>([]);
    const [selectedStudy, setSelectedStudy] = useState('');
    const [studySites, setStudySites] = useState<SiteOption[]>([]);
    const [formData, setFormData] = useState<FormData>({
        subjectId: '',
        studyId: '',
        siteId: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Load studies that are ready for patient enrollment
        // Only PUBLISHED or ACTIVE studies should allow enrollment
        const fetchStudies = async () => {
            try {
                setError(null);
                const studiesData = await getStudies() as any;

                // Filter to show only studies ready for enrollment (PUBLISHED or ACTIVE)
                // Similar to DB Build form which filters for APPROVED/ACTIVE studies
                const enrollmentReadyStudies = (studiesData || []).filter((study: Study) => {
                    const status = study.studyStatus?.code || study.status;
                    // Allow PUBLISHED (officially published) or ACTIVE (actively enrolling)
                    return status === 'PUBLISHED' || status === 'ACTIVE' || status === 'APPROVED';
                });

                console.log('Total studies:', studiesData?.length || 0);
                console.log('Enrollment-ready studies (PUBLISHED/ACTIVE/APPROVED):', enrollmentReadyStudies.length);

                setStudies(enrollmentReadyStudies);
            } catch (err) {
                console.error('Error fetching studies:', err);
                setError('Failed to load studies.');
            }
        };

        fetchStudies();
    }, []);

    useEffect(() => {
        if (!selectedStudy) {
            setStudySites([]);
            setFormData(prev => ({ ...prev, studyId: '', siteId: '' }));
            return;
        }

        const fetchStudyDependentData = async () => {
            try {
                setError(null);

                // NOTE: Arm fields removed for EDC blinding compliance
                // Treatment arm assignment is handled by external IWRS/RTSM system, not during enrollment
                // See: EDC_BLINDING_ARCHITECTURE_DECISION.md

                // Fetch site-study associations and populate dropdown
                const associations = await SiteService.getSiteAssociationsForStudy(selectedStudy) as any;
                console.log('[SubjectEnrollment] Associations API raw:', associations);
                const assocList: SiteAssociation[] = Array.isArray(associations) ? associations : [];

                // Normalize status and pick ACTIVE; if none active, fall back to all
                const normalized = assocList.map(a => {
                    // status may be string or enum object; normalize to uppercase string
                    let rawStatus = a?.status;
                    let statusStr = '';
                    if (rawStatus && typeof rawStatus === 'object') {
                        // Common enum serialization shape { name: 'ACTIVE', ... } or { status: 'ACTIVE' }
                        statusStr = ((rawStatus as any).name || (rawStatus as any).status || '').toString();
                    } else {
                        statusStr = (rawStatus ?? '').toString();
                    }
                    const __status = statusStr.toUpperCase();
                    return { ...a, __status };
                });
                const activeOnly = normalized.filter(a => a.__status === 'ACTIVE');
                const chosen = activeOnly.length > 0 ? activeOnly : normalized;

                const sitesOptions = chosen.map(a => {
                    // Use association ID for enrollment
                    const associationId = a.id;
                    const value = associationId != null ? String(associationId) : '';

                    // Build display label using enhanced DTO fields
                    const siteNum = a.siteNumber || a.site_num || a.siteCode || null;
                    const siteName = a.siteName || a.site_name || a.name || null;

                    let base;
                    if (siteNum && siteName) {
                        base = `Site ${siteNum} - ${siteName}`;
                    } else if (siteName) {
                        base = siteName;
                    } else if (siteNum) {
                        base = `Site ${siteNum}`;
                    } else {
                        base = value ? `Assoc ${value}` : 'Associated Site';
                    }

                    const label = activeOnly.length > 0 ? base : `${base} [${a.__status || 'UNKNOWN'}]`;
                    return { siteId: value, label };
                });

                setStudySites(sitesOptions);

                setFormData(prev => ({
                    ...prev,
                    studyId: selectedStudy,
                    siteId: (sitesOptions.length > 0) ? sitesOptions[0].siteId : ''
                }));
            } catch (error) {
                console.error('Error fetching study dependent data:', error);
                setError('Failed to load study details (sites).');
            }
        };

        fetchStudyDependentData();
    }, [selectedStudy]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'studyId') {
            setSelectedStudy(value);
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate form
            // NOTE: armId removed for EDC blinding compliance - randomization handled by external IWRS/RTSM
            if (!formData.subjectId || !formData.studyId || !formData.siteId || !formData.firstName || !formData.lastName) {
                throw new Error('Please fill all required fields.');
            }

            // Validate name lengths (match backend validation)
            if (formData.firstName.trim().length < 2) {
                throw new Error('First name must be at least 2 characters long.');
            }

            if (formData.lastName.trim().length < 2) {
                throw new Error('Last name must be at least 2 characters long.');
            }

            // Validate email format if provided
            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                throw new Error('Please enter a valid email address.');
            }

            // Enroll subject
            const result = await enrollSubject(formData as any) as any;
            console.log('Subject enrolled successfully:', result);
            navigate(`/subject-management/subjects/${result.id}`);
        } catch (error: any) {
            console.error('Error enrolling subject:', error);
            setError(error.message || 'Failed to enroll subject.');
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Enroll New Subject</h3>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Screening Number*
                        </label>
                        <input
                            type="text"
                            name="subjectId"
                            value={formData.subjectId}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            placeholder="e.g., SCR-001, SUBJ-001"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name*
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            placeholder="Enter first name"
                            required
                            minLength={2}
                            title="First name must be at least 2 characters long"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name*
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            placeholder="Enter last name"
                            required
                            minLength={2}
                            title="Last name must be at least 2 characters long"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            placeholder="subject@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            placeholder="+1-555-123-4567"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Study*
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Only studies with status PUBLISHED, APPROVED, or ACTIVE can enroll patients
                        </p>
                        <select
                            name="studyId"
                            value={formData.studyId}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            required
                        >
                            <option value="">Select a study</option>
                            {studies.map(study => (
                                <option key={study.id} value={study.id}>{study.title || study.name}</option>
                            ))}
                        </select>
                        {studies.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">
                                No enrollment-ready studies available. Studies must be PUBLISHED, APPROVED, or ACTIVE to enroll patients.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Study Site*
                        </label>
                        <select
                            name="siteId"
                            value={formData.siteId}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            required
                            disabled={studySites.length === 0}
                        >
                            <option value="">Select a study site</option>
                            {studySites.map(s => (
                                <option key={s.siteId} value={s.siteId}>{s.label}</option>
                            ))}
                        </select>
                        {selectedStudy && studySites.length === 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                No site associations found for this study. Ensure at least one site is associated and ACTIVE in User Management.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Enrollment Date*
                        </label>
                        <input
                            type="date"
                            name="enrollmentDate"
                            value={formData.enrollmentDate}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            required
                        />
                    </div>
                </div>

                {/* EDC Blinding Compliance Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-semibold text-blue-900 mb-1">Treatment Assignment Process</h4>
                            <p className="text-sm text-blue-800 mb-2">
                                This EDC system maintains study blinding by NOT assigning treatment arms during enrollment.
                            </p>
                            <p className="text-xs text-blue-700">
                                <strong>Next Steps After Enrollment:</strong> Contact the IWRS/RTSM system to randomize the patient
                                and receive treatment assignment. The EDC system will remain blinded to maintain study integrity.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/subject-management')}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Enrolling...' : 'Enroll Subject'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubjectEnrollment;
