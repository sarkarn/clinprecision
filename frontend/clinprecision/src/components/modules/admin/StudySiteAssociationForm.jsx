import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import SiteService from '../../../services/SiteService';
import StudyService from '../../../services/StudyService';

export default function StudySiteAssociationForm() {
    const navigate = useNavigate();
    const { id } = useParams(); // optional: edit mode in future

    const [sites, setSites] = useState([]);
    const [studies, setStudies] = useState([]);
    const [selectedSiteId, setSelectedSiteId] = useState('');
    const [selectedStudyId, setSelectedStudyId] = useState('');
    const [reason, setReason] = useState('Initial site onboarding to study');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const [siteList, studyList] = await Promise.all([
                    SiteService.getAllSites(),
                    StudyService.getStudies()
                ]);
                setSites(siteList || []);
                setStudies(studyList || []);
            } catch (e) {
                console.error('Failed to load form data', e);
                setError('Failed to load sites or studies');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Optionally: filter out studies already associated with selected site
    const associatedStudyIdsForSelectedSite = useMemo(() => {
        return [];
    }, [selectedSiteId]);

    const availableStudies = useMemo(() => {
        if (!Array.isArray(studies)) return [];
        // StudyService.getStudies returns objects with id and title, and protocolNumber; SSA uses studyId string often protocolNumber
        return studies.map(s => ({
            key: s.protocolNumber || String(s.id),
            label: `${s.protocolNumber || s.id} - ${s.title || s.name || 'Untitled'}`
        })).filter(s => !associatedStudyIdsForSelectedSite.includes(s.key));
    }, [studies, associatedStudyIdsForSelectedSite]);

    const validate = () => {
        const errs = [];
        if (!selectedSiteId) errs.push('Please select a site');
        if (!selectedStudyId) errs.push('Please select a study');
        if (!reason || reason.trim().length < 4) errs.push('Please provide a brief reason (min 4 chars)');
        return errs;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (errs.length) {
            setError(errs.join('\n'));
            return;
        }
        try {
            setSubmitting(true);
            setError(null);
            await SiteService.associateSiteWithStudy(Number(selectedSiteId), { studyId: selectedStudyId, reason });
            setNotice('Association created successfully');
            // small delay for UX, then go back to list
            setTimeout(() => navigate('/user-management/study-site-associations'), 600);
        } catch (e) {
            console.error('Create association failed', e);
            setError(e?.response?.data || e.message || 'Failed to create association');
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Study Site Association</h1>
                <p className="text-gray-600 mb-6">Link an existing site to a study for activation and tracking.</p>

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
                            onChange={e => setSelectedSiteId(e.target.value)}
                        >
                            <option value="">Select a site...</option>
                            {sites.map(s => (
                                <option key={s.id} value={s.id}>{s.siteNumber} - {s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Study</label>
                        <select
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={selectedStudyId}
                            onChange={e => setSelectedStudyId(e.target.value)}
                        >
                            <option value="">Select a study...</option>
                            {availableStudies.map(s => (
                                <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Provide an audit reason for this association"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate('/user-management/study-site-associations')}
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
                            {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Create Association
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
