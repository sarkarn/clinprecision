// AdminDashboard.jsx
const applicants = [
    { name: "John Doe", trial: "Diabetes Study", status: "Screened" },
    { name: "Jane Smith", trial: "Asthma Trial", status: "Enrolled" },
];

export default function AdminDashboard() {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Trial</th>
                        <th className="border p-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {applicants.map((applicant, idx) => (
                        <tr key={idx}>
                            <td className="border p-2">{applicant.name}</td>
                            <td className="border p-2">{applicant.trial}</td>
                            <td className="border p-2">{applicant.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-2">Messaging Panel</h3>
                <textarea className="w-full border p-2 rounded" rows="4" placeholder="Message to applicant..." />
                <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">Send</button>
            </div>
        </div>
    );
}