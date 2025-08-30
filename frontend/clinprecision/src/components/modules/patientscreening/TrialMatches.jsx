// TrialMatches.jsx
const trials = [
    { name: "Diabetes Study", phase: "II", location: "Chicago, IL" },
    { name: "Asthma Trial", phase: "I", location: "New York, NY" },
];

export default function TrialMatches() {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Matched Trials</h2>
            <div className="mb-4 flex gap-4">
                <input type="text" placeholder="Condition" className="border p-2 rounded" />
                <input type="text" placeholder="Location" className="border p-2 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trials.map((trial, idx) => (
                    <div key={idx} className="bg-white p-6 rounded shadow">
                        <h3 className="text-xl font-semibold">{trial.name}</h3>
                        <p>Phase: {trial.phase}</p>
                        <p>Location: {trial.location}</p>
                        <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded">Apply Now</button>
                    </div>
                ))}
            </div>
        </div>
    );
}