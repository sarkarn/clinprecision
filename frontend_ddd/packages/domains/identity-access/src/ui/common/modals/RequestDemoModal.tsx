import React, { useMemo, useState } from "react";

interface RequestDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RequestDemoModal: React.FC<RequestDemoModalProps> = ({ isOpen, onClose }) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [organization, setOrganization] = useState("");
    const [message, setMessage] = useState("");

    // Memoize the disabled state to avoid recalculations during renders.
    const isSubmitDisabled = useMemo(() => {
        return !fullName.trim() || !email.trim();
    }, [fullName, email]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // TODO: Integrate with backend once available.
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Request a Demo</h2>
                        <p className="text-sm text-gray-600">
                            Share your details and the team will reach out shortly.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="demo-full-name">
                            Full name
                        </label>
                        <input
                            id="demo-full-name"
                            type="text"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Jane Doe"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="demo-email">
                            Work email
                        </label>
                        <input
                            id="demo-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="jane.doe@organization.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="demo-organization">
                            Organization
                        </label>
                        <input
                            id="demo-organization"
                            type="text"
                            value={organization}
                            onChange={(event) => setOrganization(event.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="ClinPrecision"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="demo-message">
                            Additional details
                        </label>
                        <textarea
                            id="demo-message"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            className="h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Let us know what you would like to explore."
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitDisabled}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestDemoModal;
