// EligibilityForm.jsx
import { useState } from 'react';

export default function EligibilityForm() {
    const [formData, setFormData] = useState({ age: '', condition: '', location: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-xl mx-auto p-8 bg-white shadow-md rounded mt-12">
            <h2 className="text-2xl font-bold mb-4">Eligibility Questionnaire</h2>
            <form className="space-y-4">
                <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                >
                    <option value="">Select Condition</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Hypertension">Hypertension</option>
                    <option value="Asthma">Asthma</option>
                </select>
                <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Check Eligibility
                </button>
            </form>
        </div>
    );
}