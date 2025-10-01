// SubjectEnrollment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudies } from '../../../services/StudyService';
import { enrollSubject } from '../../../services/SubjectService';
import StudyDesignService from '../../../services/StudyDesignService';
import { SiteService } from '../../../services/SiteService';

export default function SubjectEnrollment() {
    const [studies, setStudies] = useState([]);
    const [selectedStudy, setSelectedStudy] = useState('');
    const [studyArms, setStudyArms] = useState([]);
    const [studySites, setStudySites] = useState([]);
    const [formData, setFormData] = useState({
        subjectId: '',
        studyId: '',
        armId: '',
        siteId: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Load all studies (not limited by user assignments)
        const fetchStudies = async () => {
            try {
                setError(null);
                const studiesData = await getStudies();
                setStudies(studiesData);
            } catch (err) {
                console.error('Error fetching studies:', err);
                setError('Failed to load studies.');
            }
        };

        fetchStudies();
    }, []);

    useEffect(() => {
        if (!selectedStudy) {
            setStudyArms([]);
            setStudySites([]);
            setFormData(prev => ({ ...prev, studyId: '', armId: '', siteId: '' }));
            return;
        }

        const fetchStudyDependentData = async () => {
            try {
                setError(null);
                // Fetch arms via StudyDesignService (gateway-prefixed)
                const arms = await StudyDesignService.getStudyArms(selectedStudy);
                setStudyArms(Array.isArray(arms) ? arms : []);

                // Fetch site-study associations and populate dropdown
                const associations = await SiteService.getSiteAssociationsForStudy(selectedStudy);
                console.log('[SubjectEnrollment] Associations API raw:', associations);
                const assocList = Array.isArray(associations) ? associations : [];

                // Normalize status and pick ACTIVE; if none active, fall back to all
                const normalized = assocList.map(a => {
                    // status may be string or enum object; normalize to uppercase string
                    let rawStatus = a?.status;
                    let statusStr = '';
                    if (rawStatus && typeof rawStatus === 'object') {
                        // Common enum serialization shape { name: 'ACTIVE', ... } or { status: 'ACTIVE' }
                        statusStr = (rawStatus.name || rawStatus.status || '').toString();
                    } else {
                        statusStr = (rawStatus ?? '').toString();
                    }
                    const __status = statusStr.toUpperCase();
                    return { ...a, __status };
                });
                const activeOnly = normalized.filter(a => a.__status === 'ACTIVE');
                const chosen = activeOnly.length > 0 ? activeOnly : normalized;

                const sitesOptions = chosen.map(a => {
                    // association id to send to backend enrollment = site_studies.id
                    const associationId = (a.id ?? a.siteStudyId ?? a.siteId);
                    const value = associationId != null ? String(associationId) : '';
                    // site display fields may not be present on DTO; build a reasonable label
                    const siteNum = a.siteNumber || a.site_num || a.siteCode || null;
                    const siteName = a.siteName || a.site_name || a.name || null;
                    const fallback = value ? `Assoc ${value}` : 'Associated Site';
                    const base = siteNum && siteName
                        ? `${siteNum} - ${siteName}`
                        : (siteName || fallback);
                    const label = activeOnly.length > 0 ? base : `${base} [${a.__status || 'UNKNOWN'}]`;
                    return { siteId: value, label };
                });

                setStudySites(sitesOptions);

                setFormData(prev => ({
                    ...prev,
                    studyId: selectedStudy,
                    armId: (Array.isArray(arms) && arms.length > 0) ? (arms[0].id?.toString() || arms[0].id) : '',
                    siteId: (sitesOptions.length > 0) ? sitesOptions[0].siteId : ''
                }));
            } catch (error) {
                console.error('Error fetching study dependent data:', error);
                setError('Failed to load study details (arms/sites).');
            }
        };

        fetchStudyDependentData();
    }, [selectedStudy]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'studyId') {
            setSelectedStudy(value);
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate form
            if (!formData.subjectId || !formData.studyId || !formData.armId || !formData.siteId || !formData.firstName || !formData.lastName) {
                throw new Error('Please fill all required fields.');
            }

            // Validate email format if provided
            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                throw new Error('Please enter a valid email address.');
            }

            // Enroll subject
            const result = await enrollSubject(formData);
            console.log('Subject enrolled successfully:', result);
            navigate(`/subject-management/subjects/${result.id}`);
        } catch (error) {
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
                            Subject ID*
                        </label>
                        <input
                            type="text"
                            name="subjectId"
                            value={formData.subjectId}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            placeholder="e.g., SUBJ-001"
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
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Study Arm*
                        </label>
                        <select
                            name="armId"
                            value={formData.armId}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            required
                            disabled={studyArms.length === 0}
                        >
                            <option value="">Select an arm</option>
                            {studyArms.map(arm => (
                                <option key={arm.id} value={arm.id}>{arm.name || arm.title || `Arm ${arm.id}`}</option>
                            ))}
                        </select>
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
}