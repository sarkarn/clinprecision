// LandingPage.jsx
export default function PatientScreening() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold text-blue-600">ClinicalConnect</h1>
                <nav className="space-x-6">
                    <a href="#" className="text-gray-700">Home</a>
                    <a href="#" className="text-gray-700">About</a>
                    <a href="#" className="text-gray-700">Contact</a>
                </nav>
            </header>

            <section className="text-center">
                <h2 className="text-4xl font-bold mb-4">Find the Right Trial for You</h2>
                <p className="text-lg mb-6">Secure, easy, and personalized trial matching.</p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">See If You Qualify</button>
            </section>

            <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                {["Easy", "Secure", "Trusted"].map((title) => (
                    <div key={title} className="bg-white p-6 rounded shadow text-center">
                        <h3 className="text-xl font-semibold mb-2">{title}</h3>
                        <p>We make patient recruitment simple and transparent.</p>
                    </div>
                ))}
            </section>
        </div>
    );
}