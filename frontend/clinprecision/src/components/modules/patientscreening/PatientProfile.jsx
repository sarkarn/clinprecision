// PatientProfile.jsx
export default function PatientProfile() {
    return (
        <div className="max-w-3xl mx-auto p-8">
            <h2 className="text-2xl font-bold mb-6">Patient Profile</h2>
            <div className="mb-6">
                <h3 className="font-semibold mb-2">Personal Info</h3>
                <input type="text" placeholder="Full Name" className="w-full border p-2 rounded mb-2" />
                <input type="email" placeholder="Email" className="w-full border p-2 rounded" />
            </div>
            <div className="mb-6">
                <h3 className="font-semibold mb-2">Medical History</h3>
                <input type="file" className="w-full border p-2 rounded" />
            </div>
            <div>
                <h3 className="font-semibold mb-2">Consent Form</h3>
                <iframe
                    src="/consent.pdf"
                    title="Consent Form"
                    className="w-full h-64 border rounded"
                ></iframe>
            </div>
        </div>
    );
}
