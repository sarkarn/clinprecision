import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStudy } from '../../../services/StudyService';

const StudyRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phase: '',
        status: 'Planned',
        startDate: '',
        endDate: '',
        sponsor: '',
        investigator: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Basic validation
            if (!formData.name || !formData.phase) {
                throw new Error('Study name and phase are required');
            }

            const response = await registerStudy(formData);
            setLoading(false);

            // Navigate to the study list or edit page after successful registration
            navigate('/study-design/list');
        } catch (err) {
            setError(err.message || 'Failed to register study');
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Register New Study</h3>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Study Name*
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phase*
                        </label>
                        <select
                            name="phase"
                            value={formData.phase}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            required
                        >
                            <option value="">Select Phase</option>
                            <option value="Phase 1">Phase 1</option>
                            <option value="Phase 2">Phase 2</option>
                            <option value="Phase 3">Phase 3</option>
                            <option value="Phase 4">Phase 4</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                        >
                            <option value="Planned">Planned</option>
                            <option value="Recruiting">Recruiting</option>
                            <option value="Active">Active</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                            <option value="Terminated">Terminated</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sponsor
                        </label>
                        <input
                            type="text"
                            name="sponsor"
                            value={formData.sponsor}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Principal Investigator
                        </label>
                        <input
                            type="text"
                            name="investigator"
                            value={formData.investigator}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="border border-gray-300 rounded-md w-full px-3 py-2"
                    ></textarea>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/study-design/list')}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register Study'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudyRegister;