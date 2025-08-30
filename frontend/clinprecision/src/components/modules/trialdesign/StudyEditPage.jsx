import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStudyById } from '../../../services/StudyService';
import CRFBuilder from './designer/CRFBuilder';

const StudyEditPage = () => {
    const { studyId } = useParams();
    const navigate = useNavigate();
    const [study, setStudy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [arms, setArms] = useState([]);
    const [isCRFBuilderOpen, setIsCRFBuilderOpen] = useState(false);
    const [currentVisit, setCurrentVisit] = useState(null);

    useEffect(() => {
        const fetchStudy = async () => {
            try {
                const studyData = await getStudyById(studyId);
                setStudy(studyData);
                setArms(studyData.arms || []);
                setLoading(false);
            } catch (err) {
                setError('Failed to load study');
                setLoading(false);
                console.error(err);
            }
        };

        if (studyId) {
            fetchStudy();
        }
    }, [studyId]);

    const handleStudyChange = (e) => {
        const { name, value } = e.target;
        setStudy({
            ...study,
            [name]: value
        });
    };

    const handleSaveStudy = (e) => {
        e.preventDefault();
        alert('Study changes saved!');
        navigate('/study-design/list');
    };

    const addArm = () => {
        const newArm = {
            id: `arm_${arms.length + 1}`,
            name: `Arm ${arms.length + 1}`,
            description: '',
            visits: []
        };
        setArms([...arms, newArm]);
    };

    const updateArm = (index, field, value) => {
        const updatedArms = [...arms];
        updatedArms[index] = {
            ...updatedArms[index],
            [field]: value
        };
        setArms(updatedArms);
    };

    const deleteArm = (index) => {
        if (window.confirm('Are you sure you want to delete this arm?')) {
            const updatedArms = arms.filter((_, i) => i !== index);
            setArms(updatedArms);
        }
    };

    const addVisit = (armIndex) => {
        const updatedArms = [...arms];
        const newVisit = {
            id: `visit_${updatedArms[armIndex].visits.length + 1}`,
            name: `Visit ${updatedArms[armIndex].visits.length + 1}`,
            timepoint: '0',
            description: ''
        };
        updatedArms[armIndex].visits = [...updatedArms[armIndex].visits, newVisit];
        setArms(updatedArms);
    };

    const updateVisit = (armIndex, visitIndex, field, value) => {
        const updatedArms = [...arms];
        updatedArms[armIndex].visits[visitIndex] = {
            ...updatedArms[armIndex].visits[visitIndex],
            [field]: value
        };
        setArms(updatedArms);
    };

    const deleteVisit = (armIndex, visitIndex) => {
        if (window.confirm('Are you sure you want to delete this visit?')) {
            const updatedArms = [...arms];
            updatedArms[armIndex].visits = updatedArms[armIndex].visits.filter((_, i) => i !== visitIndex);
            setArms(updatedArms);
        }
    };

    const addCRF = (armIndex, visitIndex) => {
        setCurrentVisit({ armIndex, visitIndex });
        setIsCRFBuilderOpen(true);
    };

    const handleCRFSave = (newCRF) => {
        const updatedArms = [...arms];
        const { armIndex, visitIndex } = currentVisit;
        if (!updatedArms[armIndex].visits[visitIndex].crfs) {
            updatedArms[armIndex].visits[visitIndex].crfs = [];
        }
        updatedArms[armIndex].visits[visitIndex].crfs.push(newCRF);
        setArms(updatedArms);
        setIsCRFBuilderOpen(false);
    };

    const updateCRF = (armIndex, visitIndex, crfIndex, field, value) => {
        const updatedArms = [...arms];
        updatedArms[armIndex].visits[visitIndex].crfs[crfIndex] = {
            ...updatedArms[armIndex].visits[visitIndex].crfs[crfIndex],
            [field]: value
        };
        setArms(updatedArms);
    };

    const deleteCRF = (armIndex, visitIndex, crfIndex) => {
        if (window.confirm('Are you sure you want to delete this CRF?')) {
            const updatedArms = [...arms];
            updatedArms[armIndex].visits[visitIndex].crfs =
                updatedArms[armIndex].visits[visitIndex].crfs.filter((_, i) => i !== crfIndex);
            setArms(updatedArms);
        }
    };

    if (loading) return <div className="text-center py-4">Loading study...</div>;
    if (error) return <div className="text-red-500 py-4">{error}</div>;
    if (!study) return <div className="text-center py-4">Study not found</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <Link to="/study-design/list" className="text-blue-600 hover:underline">
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
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={study.startDate}
                                onChange={handleStudyChange}
                                className="border border-gray-300 rounded-md w-full p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={study.endDate}
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
                                name="investigator"
                                value={study.investigator}
                                onChange={handleStudyChange}
                                className="border border-gray-300 rounded-md w-full p-2"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/study-design/list')}
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
                                <div key={arm.id} className="border rounded-lg p-4">
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
                                                    <div key={visit.id} className="border-l-2 border-blue-300 pl-4 ml-2">
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
                                                                <button
                                                                    onClick={() => addCRF(armIndex, visitIndex)}
                                                                    className="bg-green-500 text-white px-2 py-1 rounded text-xs mr-2"
                                                                >
                                                                    + Add CRF
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
                                                                                <tr key={crf.id} className="hover:bg-gray-50">
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
                                                                                            value={crf.type}
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
                                                                                        <button
                                                                                            onClick={() => deleteCRF(armIndex, visitIndex, crfIndex)}
                                                                                            className="text-red-600 hover:text-red-800"
                                                                                        >
                                                                                            Delete
                                                                                        </button>
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
                            onClick={handleSaveStudy}
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
                    <div className="bg-white rounded-lg shadow-lg p-6 z-10 max-w-3xl w-full">
                        <CRFBuilder onSave={handleCRFSave} onCancel={() => setIsCRFBuilderOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyEditPage;