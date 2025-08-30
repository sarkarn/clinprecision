import React, { useState } from 'react';

const VisitScheduleDesigner = () => {
  const [visits, setVisits] = useState([{ name: 'Visit 1', day: 0 }]);

  const addVisit = () => {
    setVisits([...visits, { name: 'Visit ' + (visits.length + 1), day: visits.length * 7 }]);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold mb-4">Visit Schedule</h2>
      <ul className="space-y-2 mb-4">
        {visits.map((visit, idx) => (
          <li key={idx} className="flex justify-between bg-gray-50 p-2 border rounded">
            <span>{visit.name}</span>
            <span>Day {visit.day}</span>
          </li>
        ))}
      </ul>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={addVisit}
      >
        Add Visit
      </button>
    </div>
  );
};

export default VisitScheduleDesigner;