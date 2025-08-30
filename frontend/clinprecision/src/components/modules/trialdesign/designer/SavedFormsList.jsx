import React from 'react';

export default function SavedFormsList({ savedForms, onEditForm, onDeleteForm }) {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Saved CRF Forms</h3>
            {savedForms.length === 0 ? (
                <p className="text-gray-500">No forms created yet.</p>
            ) : (
                <ul>
                    {savedForms.map((form, idx) => (
                        <li key={idx} className="mb-2 flex items-center">
                            <span className="font-medium mr-4">{form.name}</span>
                            <button
                                onClick={() => onEditForm(idx)}
                                className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDeleteForm(idx)}
                                className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}