import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrganizationService } from '@domains/organization/src/services/OrganizationService';

interface Organization {
	id: number | string;
	name: string;
	externalId?: string;
	status?: string;
	email?: string;
	phone?: string;
	website?: string;
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
}

interface Contact {
	id: number | string;
	contactName: string;
	title?: string;
	department?: string;
	email?: string;
	phone?: string;
	isPrimary?: boolean;
}

interface ContactFormData {
	contactName: string;
	title: string;
	department: string;
	email: string;
	phone: string;
	isPrimary: boolean;
}

const OrganizationDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [organization, setOrganization] = useState<Organization | null>(null);
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [showContactForm, setShowContactForm] = useState(false);
	const [editingContactId, setEditingContactId] = useState<number | string | null>(null);
	const [contactFormData, setContactFormData] = useState<ContactFormData>({
		contactName: '',
		title: '',
		department: '',
		email: '',
		phone: '',
		isPrimary: false,
	});

	useEffect(() => {
		const fetchData = async () => {
			if (!id) {
				return;
			}

			try {
				setLoading(true);
				const [orgData, contactsData] = await Promise.all([
					OrganizationService.getOrganizationById(id),
					OrganizationService.getOrganizationContacts(id),
				]);

				setOrganization(orgData as Organization);
				setContacts(contactsData as unknown as Contact[]);
				setError(null);
			} catch (err) {
				console.error('Error fetching organization details:', err);
				setError('Failed to load organization details. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	const handleEditOrganization = () => {
		navigate(`/organization-admin/organizations/edit/${id}`);
	};

	const handleBackToList = () => {
		navigate('/organization-admin/organizations');
	};

	const handleShowAddContact = () => {
		setContactFormData({
			contactName: '',
			title: '',
			department: '',
			email: '',
			phone: '',
			isPrimary: false,
		});
		setEditingContactId(null);
		setShowContactForm(true);
	};

	const handleEditContact = (contact: Contact) => {
		setContactFormData({
			contactName: contact.contactName,
			title: contact.title || '',
			department: contact.department || '',
			email: contact.email || '',
			phone: contact.phone || '',
			isPrimary: contact.isPrimary || false,
		});
		setEditingContactId(contact.id);
		setShowContactForm(true);
	};

	const handleContactChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setContactFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleSubmitContact = async (e: FormEvent) => {
		e.preventDefault();
		if (!id) {
			return;
		}

		try {
			if (editingContactId) {
				await OrganizationService.updateOrganizationContact(id, editingContactId as string, contactFormData as any);
				setContacts((prev) =>
					prev.map((contact) =>
						contact.id === editingContactId ? { ...contact, ...contactFormData } : contact,
					)
				);
			} else {
				const newContact = await OrganizationService.addOrganizationContact(id, contactFormData as any);
				setContacts((prev) => [...prev, newContact as unknown as Contact]);
			}

			setShowContactForm(false);
			setEditingContactId(null);
			setContactFormData({
				contactName: '',
				title: '',
				department: '',
				email: '',
				phone: '',
				isPrimary: false,
			});
		} catch (err) {
			console.error('Error saving contact:', err);
			setError('Failed to save contact. Please try again.');
		}
	};

	const handleDeleteContact = async (contactId: number | string) => {
		if (!id) {
			return;
		}

		if (window.confirm('Are you sure you want to delete this contact?')) {
			try {
				await OrganizationService.deleteOrganizationContact(id, contactId as string);
				setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
			} catch (err) {
				console.error('Error deleting contact:', err);
				setError('Failed to delete contact. Please try again.');
			}
		}
	};

	const handleCancelContact = () => {
		setShowContactForm(false);
		setEditingContactId(null);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
				{error}
				<div className="mt-4">
					<button
						onClick={handleBackToList}
						className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
					>
						Back to Organizations
					</button>
				</div>
			</div>
		);
	}

	if (!organization) {
		return (
			<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
				Organization not found
				<div className="mt-4">
					<button
						onClick={handleBackToList}
						className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
					>
						Back to Organizations
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto">
			<div className="mb-6 flex justify-between items-center">
				<div>
					<h3 className="text-xl font-semibold">{organization.name}</h3>
				</div>
				<div className="flex space-x-3">
					<button
						onClick={handleBackToList}
						className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
					>
						Back to List
					</button>
					<button
						onClick={handleEditOrganization}
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					>
						Edit Organization
					</button>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
				<div className="px-6 py-4 border-b border-gray-200">
					<h4 className="text-lg font-medium text-gray-800">Organization Details</h4>
				</div>
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
						<div>
							<h5 className="text-sm font-medium text-gray-500 mb-1">External ID</h5>
							<p className="text-gray-900">{organization.externalId || 'Not specified'}</p>
						</div>
						<div>
							<h5 className="text-sm font-medium text-gray-500 mb-1">Status</h5>
							<p className="text-gray-900 flex items-center">
								<span
									className={`mr-2 w-3 h-3 rounded-full inline-block ${
										organization.status === 'active'
											? 'bg-green-500'
											: organization.status === 'inactive'
											? 'bg-gray-500'
											: 'bg-yellow-500'
									}`}
								/>
								{organization.status
									? organization.status.charAt(0).toUpperCase() + organization.status.slice(1)
									: 'Unknown'}
							</p>
						</div>
						<div>
							<h5 className="text-sm font-medium text-gray-500 mb-1">Email</h5>
							<p className="text-gray-900">{organization.email || 'Not specified'}</p>
						</div>
						<div>
							<h5 className="text-sm font-medium text-gray-500 mb-1">Phone</h5>
							<p className="text-gray-900">{organization.phone || 'Not specified'}</p>
						</div>
						<div>
							<h5 className="text-sm font-medium text-gray-500 mb-1">Website</h5>
							<p className="text-gray-900">
								{organization.website ? (
									<a
										href={organization.website}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:underline"
									>
										{organization.website}
										</a>
									) : (
										'Not specified'
									)}
							</p>
						</div>
					</div>

					<div className="mt-8">
						<h5 className="text-sm font-medium text-gray-500 mb-3">Address</h5>
						<div className="text-gray-900">
							{organization.addressLine1 && <p>{organization.addressLine1}</p>}
							{organization.addressLine2 && <p>{organization.addressLine2}</p>}
							{(organization.city || organization.state || organization.postalCode) && (
								<p>
									{organization.city && `${organization.city}, `}
									{organization.state && `${organization.state} `}
									{organization.postalCode && organization.postalCode}
								</p>
							)}
							{organization.country && <p>{organization.country}</p>}
							{!organization.addressLine1 && !organization.city && !organization.country && (
								<p className="text-gray-500 italic">No address information provided</p>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-sm border border-gray-200">
				<div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
					<h4 className="text-lg font-medium text-gray-800">Contacts</h4>
					<button
						onClick={handleShowAddContact}
						className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded text-sm"
					>
						Add Contact
					</button>
				</div>

				{showContactForm && (
					<div className="p-6 border-b border-gray-200 bg-gray-50">
						<h5 className="text-md font-medium text-gray-800 mb-4">{editingContactId ? 'Edit Contact' : 'Add New Contact'}</h5>
						<form onSubmit={handleSubmitContact}>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contactName">
										Name *
									</label>
									<input
										type="text"
										id="contactName"
										name="contactName"
										value={contactFormData.contactName}
										onChange={handleContactChange}
										className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
										Title
									</label>
									<input
										type="text"
										id="title"
										name="title"
										value={contactFormData.title}
										onChange={handleContactChange}
										className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="department">
										Department
									</label>
									<input
										type="text"
										id="department"
										name="department"
										value={contactFormData.department}
										onChange={handleContactChange}
										className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
										Email
									</label>
									<input
										type="email"
										id="email"
										name="email"
										value={contactFormData.email}
										onChange={handleContactChange}
										className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
										Phone
									</label>
									<input
										type="tel"
										id="phone"
										name="phone"
										value={contactFormData.phone}
										onChange={handleContactChange}
										className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
								<div className="flex items-center">
									<input
										type="checkbox"
										id="isPrimary"
										name="isPrimary"
										checked={contactFormData.isPrimary}
										onChange={handleContactChange}
										className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
									/>
									<label className="ml-2 block text-sm text-gray-700" htmlFor="isPrimary">
										Primary Contact
									</label>
								</div>
							</div>
							<div className="flex justify-end space-x-3">
								<button
									type="button"
									onClick={handleCancelContact}
									className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
								>
									Cancel
								</button>
								<button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
									{editingContactId ? 'Update Contact' : 'Add Contact'}
								</button>
							</div>
						</form>
					</div>
				)}

				<div className="p-6">
					{contacts.length === 0 ? (
						<div className="text-center py-6 text-gray-500">
							<p>No contacts have been added to this organization yet.</p>
							<p className="mt-1 text-sm">Click "Add Contact" to add your first contact.</p>
						</div>
					) : (
						<div className="divide-y divide-gray-200">
							{contacts.map((contact) => (
								<div key={contact.id} className="py-4 first:pt-0 last:pb-0">
									<div className="flex justify-between items-start">
										<div>
											<div className="flex items-center">
												<h5 className="text-md font-medium text-gray-900">{contact.contactName}</h5>
												{contact.isPrimary && (
													<span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Primary</span>
												)}
											</div>
											{contact.title && <p className="text-sm text-gray-600 mt-1">{contact.title}</p>}
											{contact.department && <p className="text-sm text-gray-600">{contact.department}</p>}
											<div className="mt-2 text-sm">
												{contact.email && (
													<p className="text-gray-600">
														<span className="font-medium">Email: </span>
														<a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
															{contact.email}
														</a>
													</p>
												)}
												{contact.phone && (
													<p className="text-gray-600">
														<span className="font-medium">Phone: </span>
														<a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
															{contact.phone}
														</a>
													</p>
												)}
											</div>
										</div>
										<div className="flex space-x-2">
											<button onClick={() => handleEditContact(contact)} className="text-blue-600 hover:text-blue-900">
												Edit
											</button>
											<button onClick={() => handleDeleteContact(contact.id)} className="text-red-600 hover:text-red-900">
												Delete
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default OrganizationDetail;
