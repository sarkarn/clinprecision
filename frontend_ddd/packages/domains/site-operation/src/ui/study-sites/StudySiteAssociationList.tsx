import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
	Plus,
	Search,
	RefreshCw,
	Eye,
	Edit,
	Play,
	Trash2,
	Building,
	BookOpen,
	Users,
	Calendar,
	Filter,
	CheckCircle,
	Clock,
	XCircle,
	AlertTriangle,
} from 'lucide-react';
import SiteService from '@packages/services/SiteService';
import StudyService from '@packages/services/StudyService';

interface Site {
	id: number | string;
	name?: string;
	siteNumber?: string;
}

interface Study {
	id: number | string;
	protocolNumber?: string;
	title?: string;
	name?: string;
}

interface Association {
	id: number | string;
	siteId?: number | string;
	studyId: number | string;
	siteName?: string;
	siteNumber?: string;
	studyName?: string;
	status: string;
	createdAt?: string;
}

type NotificationType = 'success' | 'error' | 'info';

interface NotificationState {
	show: boolean;
	message: string;
	type: NotificationType;
}

const ITEMS_PER_PAGE = 10;

const StudySiteAssociationList: React.FC = () => {
	const [associations, setAssociations] = useState<Association[]>([]);
	const [filteredAssociations, setFilteredAssociations] = useState<Association[]>([]);
	const [sites, setSites] = useState<Site[]>([]);
	const [studies, setStudies] = useState<Study[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [selectedSite, setSelectedSite] = useState('');
	const [selectedStudy, setSelectedStudy] = useState('');
	const [selectedStatus, setSelectedStatus] = useState('');
	const [searchTerm, setSearchTerm] = useState('');

	const [currentPage, setCurrentPage] = useState(1);
	const [selectedItems, setSelectedItems] = useState<Array<number | string>>([]);
	const [notification, setNotification] = useState<NotificationState>({ show: false, message: '', type: 'success' });

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		applyFilters();
	}, [associations, selectedSite, selectedStudy, selectedStatus, searchTerm]);

	useEffect(() => {
		if (selectedItems.length === 0) {
			return;
		}

		const currentPageIds = getCurrentPageItems().map(item => item.id);
		const stillVisible = selectedItems.filter(id => currentPageIds.includes(id));
		if (stillVisible.length !== selectedItems.length) {
			setSelectedItems(stillVisible);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, filteredAssociations]);

	const loadData = async () => {
		try {
			setLoading(true);
			setError(null);

			const [sitesData, studiesData] = await Promise.all([
				SiteService.getAllSites(),
				StudyService.getStudies(),
			]);

			setSites(sitesData as Site[]);
			setStudies(studiesData as Study[]);

			const allAssociations: Association[] = [];

			for (const site of sitesData as Site[]) {
				try {
					const siteAssociations = await SiteService.getStudyAssociationsForSite(String(site.id));

					if (!Array.isArray(siteAssociations)) {
						continue;
					}

					const enriched = (siteAssociations as Association[]).map(association => {
						const studyId = association.studyId;
						const studyIdAsNumber = Number(studyId);

						const matchedStudy = (studiesData as Study[]).find(study =>
							study.id === studyId ||
							study.id === studyIdAsNumber ||
							(study.protocolNumber ? String(study.protocolNumber) === String(studyId) : false)
						);

						return {
							...association,
							siteId: site.id,
							siteName: site.name,
							siteNumber: site.siteNumber,
							studyName: matchedStudy?.title || matchedStudy?.name || `Study ${studyId}`,
						} as Association;
					});

					allAssociations.push(...enriched);
				} catch (siteError) {
					console.warn(`Failed to load associations for site ${site.id}`, siteError);
				}
			}

			setAssociations(allAssociations);
		} catch (loadError) {
			console.error('Error loading study site associations', loadError);
			setError('Failed to load study site associations. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const applyFilters = () => {
		const nextAssociations = associations.filter(association => {
			if (selectedSite && String(association.siteId) !== selectedSite) {
				return false;
			}

			if (selectedStudy && String(association.studyId) !== selectedStudy) {
				return false;
			}

			if (selectedStatus && association.status !== selectedStatus) {
				return false;
			}

			if (searchTerm) {
				const term = searchTerm.toLowerCase();
				const matchesSearch = [
					association.siteName,
					association.siteNumber,
					association.studyName,
					association.studyId ? String(association.studyId) : undefined,
				].some(value => value?.toLowerCase().includes(term));

				if (!matchesSearch) {
					return false;
				}
			}

			return true;
		});

		setFilteredAssociations(nextAssociations);
		setCurrentPage(1);
	};

	const handleActivateAssociation = async (association: Association) => {
		const reason = window.prompt('Please enter a reason for activation:');
		if (!reason) {
			return;
		}

		if (!association.siteId) {
			showNotification('Site information is missing for this association.', 'error');
			return;
		}

		try {
			await SiteService.activateSiteForStudy(
				String(association.siteId),
				association.studyId,
				{ reason },
			);
			showNotification('Study site association activated successfully!', 'success');
			await loadData();
		} catch (activateError) {
			console.error('Error activating study site association', activateError);
			showNotification('Failed to activate study site association.', 'error');
		}
	};

	const handleRemoveAssociation = async (association: Association) => {
		const reason = window.prompt('Please enter a reason for removal:');
		if (!reason) {
			return;
		}

		if (!association.siteId) {
			showNotification('Site information is missing for this association.', 'error');
			return;
		}

		const confirmed = window.confirm(
			`Are you sure you want to remove the association between ${association.siteName} and study ${association.studyId}?`,
		);

		if (!confirmed) {
			return;
		}

		try {
			await SiteService.removeSiteStudyAssociation(String(association.siteId), String(association.studyId), reason);
			showNotification('Study site association removed successfully!', 'success');
			await loadData();
		} catch (removeError) {
			console.error('Error removing study site association', removeError);
			showNotification('Failed to remove study site association.', 'error');
		}
	};

	const showNotification = (message: string, type: NotificationType = 'success') => {
		setNotification({ show: true, message, type });
		window.setTimeout(() => {
			setNotification({ show: false, message: '', type: 'success' });
		}, 3000);
	};

	const siteOptions = useMemo(() =>
		sites.map(site => ({
			value: String(site.id),
			label: `${site.siteNumber ? `${site.siteNumber} - ` : ''}${site.name ?? 'Unnamed Site'}`,
		})),
		[sites],
	);

	const studyOptions = useMemo(() =>
		studies.map(study => ({
			value: String(study.protocolNumber ?? study.id),
			label: `${study.protocolNumber ?? study.id} - ${study.name ?? study.title ?? 'Untitled Study'}`,
		})),
		[studies],
	);

	const getCurrentPageItems = () => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredAssociations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
	};

	const totalPages = Math.max(1, Math.ceil(filteredAssociations.length / ITEMS_PER_PAGE));
	const showBulkActions = selectedItems.length > 0;

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
					<span className="ml-3 text-gray-600">Loading study site associations...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="flex justify-center items-center h-64">
					<div className="text-center">
						<AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
						<p className="text-red-600">{error}</p>
						<button
							onClick={loadData}
							className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="mb-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Study Site Associations</h1>
						<p className="text-gray-600 mt-1">Manage relationships between studies and clinical sites</p>
					</div>
					<div className="flex gap-3">
						<button
							onClick={loadData}
							className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
						>
							<RefreshCw className="w-4 h-4" />
							Refresh
						</button>
						<Link
							to="/site-operations/study-sites/create"
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
						>
							<Plus className="w-4 h-4" />
							Create Association
						</Link>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
				<div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
					<div className="flex items-center">
						<div className="flex-1">
							<p className="text-2xl font-bold text-blue-600">{associations.length}</p>
							<p className="text-gray-600">Total Associations</p>
						</div>
						<BookOpen className="w-8 h-8 text-blue-500" />
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
					<div className="flex items-center">
						<div className="flex-1">
							<p className="text-2xl font-bold text-green-600">
								{associations.filter(a => a.status === 'ACTIVE').length}
							</p>
							<p className="text-gray-600">Active Associations</p>
						</div>
						<CheckCircle className="w-8 h-8 text-green-500" />
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
					<div className="flex items-center">
						<div className="flex-1">
							<p className="text-2xl font-bold text-yellow-600">
								{associations.filter(a => a.status === 'PENDING').length}
							</p>
							<p className="text-gray-600">Pending Activation</p>
						</div>
						<Clock className="w-8 h-8 text-yellow-500" />
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
					<div className="flex items-center">
						<div className="flex-1">
							<p className="text-2xl font-bold text-gray-600">{sites.length}</p>
							<p className="text-gray-600">Total Sites</p>
						</div>
						<Building className="w-8 h-8 text-gray-500" />
					</div>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow p-6 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
					<div className="relative">
						<Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
						<input
							type="text"
							placeholder="Search associations..."
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							value={searchTerm}
							onChange={event => setSearchTerm(event.target.value)}
						/>
					</div>

					<select
						className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						value={selectedSite}
						onChange={event => setSelectedSite(event.target.value)}
					>
						<option value="">All Sites</option>
						{siteOptions.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>

					<select
						className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						value={selectedStudy}
						onChange={event => setSelectedStudy(event.target.value)}
					>
						<option value="">All Studies</option>
						{studyOptions.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>

					<select
						className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						value={selectedStatus}
						onChange={event => setSelectedStatus(event.target.value)}
					>
						<option value="">All Statuses</option>
						<option value="ACTIVE">Active</option>
						<option value="PENDING">Pending</option>
						<option value="INACTIVE">Inactive</option>
					</select>

					<button
						onClick={() => {
							setSelectedSite('');
							setSelectedStudy('');
							setSelectedStatus('');
							setSearchTerm('');
						}}
						className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
					>
						<Filter className="w-4 h-4" />
						Clear Filters
					</button>
				</div>
			</div>

			{showBulkActions && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<Users className="w-5 h-5 text-blue-600 mr-2" />
							<span className="text-blue-800 font-medium">
								{selectedItems.length} association{selectedItems.length > 1 ? 's' : ''} selected
							</span>
						</div>
						<div className="flex gap-2">
							<button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
								Bulk Activate
							</button>
							<button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
								Bulk Remove
							</button>
							<button
								onClick={() => setSelectedItems([])}
								className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
							>
								Clear Selection
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									<input
										type="checkbox"
										onChange={event => {
											if (event.target.checked) {
												setSelectedItems(getCurrentPageItems().map(item => item.id));
											} else {
												setSelectedItems([]);
											}
										}}
										checked={
											getCurrentPageItems().length > 0 &&
											getCurrentPageItems().every(item => selectedItems.includes(item.id))
										}
										className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Site Information
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Study Information
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Association ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Created
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{getCurrentPageItems().map(association => (
								<tr key={association.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<input
											type="checkbox"
											checked={selectedItems.includes(association.id)}
											onChange={event => {
												if (event.target.checked) {
													setSelectedItems(prev => [...prev, association.id]);
												} else {
													setSelectedItems(prev => prev.filter(id => id !== association.id));
												}
											}}
											className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<Building className="w-5 h-5 text-gray-400 mr-3" />
											<div>
												<div className="text-sm font-medium text-gray-900">{association.siteName}</div>
												<div className="text-sm text-gray-500">Site #{association.siteNumber}</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<BookOpen className="w-5 h-5 text-gray-400 mr-3" />
											<div>
												<div className="text-sm font-medium text-gray-900">{association.studyName}</div>
												<div className="text-sm text-gray-500">{association.studyId}</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(association.status)}</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{association.id || 'N/A'}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{association.createdAt ? new Date(association.createdAt).toLocaleDateString() : 'Unknown'}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex justify-end gap-2">
											<button className="text-blue-600 hover:text-blue-900" title="View Details">
												<Eye className="w-4 h-4" />
											</button>
											<Link
												to={`/site-operations/study-sites/edit/${association.id}`}
												className="text-green-600 hover:text-green-900"
												title="Edit Association"
											>
												<Edit className="w-4 h-4" />
											</Link>
											{association.status === 'PENDING' && (
												<button
													onClick={() => handleActivateAssociation(association)}
													className="text-green-600 hover:text-green-900"
													title="Activate Association"
												>
													<Play className="w-4 h-4" />
												</button>
											)}
											<button
												onClick={() => handleRemoveAssociation(association)}
												className="text-red-600 hover:text-red-900"
												title="Remove Association"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{totalPages > 1 && (
					<div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
						<div className="flex-1 flex justify-between sm:hidden">
							<button
								onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
								disabled={currentPage === 1}
								className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
							>
								Previous
							</button>
							<button
								onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
								disabled={currentPage === totalPages}
								className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
							>
								Next
							</button>
						</div>
						<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
							<div>
								<p className="text-sm text-gray-700">
									Showing{' '}
									<span className="font-medium">{filteredAssociations.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
									{' '}to{' '}
									<span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAssociations.length)}</span>
									{' '}of{' '}
									<span className="font-medium">{filteredAssociations.length}</span>
									{' '}results
								</p>
							</div>
							<div>
								<nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
									{Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
										<button
											key={page}
											onClick={() => setCurrentPage(page)}
											className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
												? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
												: 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
												}`}
										>
											{page}
										</button>
									))}
								</nav>
							</div>
						</div>
					</div>
				)}
			</div>

			{filteredAssociations.length === 0 && (
				<div className="bg-white rounded-lg shadow p-8 text-center mt-6">
					<BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-semibold text-gray-900 mb-2">No study site associations found</h3>
					<p className="text-gray-600 mb-4">
						{associations.length === 0
							? 'No associations have been created yet. Create your first association to get started.'
							: 'No associations match your current filters. Try adjusting your search criteria.'}
					</p>
					{associations.length === 0 && (
						<Link
							to="/site-operations/study-sites/create"
							className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
						>
							<Plus className="w-4 h-4 mr-2" />
							Create Your First Association
						</Link>
					)}
				</div>
			)}

			{notification.show && (
				<div className="fixed bottom-4 right-4 z-50">
					<div
						className={`p-4 rounded-md shadow-lg flex items-center gap-3 ${
							notification.type === 'success'
								? 'bg-green-100 text-green-800'
								: notification.type === 'error'
									? 'bg-red-100 text-red-800'
									: 'bg-blue-100 text-blue-800'
						}`}
					>
						{notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
						{notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
						{notification.type === 'info' && <Calendar className="w-5 h-5" />}
						<span>{notification.message}</span>
						<button
							onClick={() => setNotification({ ...notification, show: false })}
							className="ml-2 hover:opacity-75"
						>
							<XCircle className="w-4 h-4" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

const getStatusBadge = (status: string) => {
	const statusConfig: Record<string, { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
		ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle },
		PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: Clock },
		INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: XCircle },
	};

	const config = statusConfig[status] ?? statusConfig.INACTIVE;
	const IconComponent = config.icon;

	return (
		<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
			<IconComponent className="w-3 h-3 mr-1" />
			{status}
		</span>
	);
};

export default StudySiteAssociationList;
