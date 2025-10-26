import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrganizationService from "services/OrganizationService";
import { Card, CardBody, CardActions, Button, Badge, ListControls, BreadcrumbNavigation } from "../../../shared/ui";
import { Building2, MapPin, Eye, Edit2, Trash2, Plus } from "lucide-react";

interface Organization {
    id: number | string;
    name: string;
    city?: string;
    country?: string;
    status: string;
    type?: string;
    createdAt?: string;
}

interface FilterOption {
    label: string;
    value: string;
}

interface Filter {
    label: string;
    value: string;
    currentValue: string;
    options: FilterOption[];
}

interface SortOption {
    label: string;
    value: string;
}

interface BreadcrumbItem {
    label: string;
    path?: string;
}

const OrganizationList: React.FC = () => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterAndSortOrganizations();
    }, [organizations, searchTerm, statusFilter, sortBy]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const orgsData = await OrganizationService.getAllOrganizations();
            setOrganizations(orgsData as any);
            setError(null);
        } catch (err) {
            console.error("Error fetching organization data:", err);
            setError("Failed to load organizations. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortOrganizations = () => {
        let result = [...organizations];

        // Search filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(org =>
                org.name.toLowerCase().includes(lowerSearch) ||
                (org.city && org.city.toLowerCase().includes(lowerSearch)) ||
                (org.country && org.country.toLowerCase().includes(lowerSearch))
            );
        }

        // Status filter
        if (statusFilter) {
            result = result.filter(org => org.status === statusFilter);
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'location') {
                const locA = `${a.city || ''} ${a.country || ''}`;
                const locB = `${b.city || ''} ${b.country || ''}`;
                return locA.localeCompare(locB);
            } else if (sortBy === 'date') {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            }
            return 0;
        });

        setFilteredOrganizations(result);
    };

    const handleCreateOrganization = () => {
        navigate('/organization-admin/organizations/create');
    };

    const handleEditOrganization = (id: number | string) => {
        navigate(`/organization-admin/organizations/edit/${id}`);
    };

    const handleViewOrganization = (id: number | string) => {
        navigate(`/organization-admin/organizations/view/${id}`);
    };

    const handleDeleteOrganization = async (id: number | string) => {
        if (window.confirm("Are you sure you want to delete this organization?")) {
            try {
                await OrganizationService.deleteOrganization(id as any);
                setOrganizations(organizations.filter(org => org.id !== id));
            } catch (err) {
                console.error("Error deleting organization:", err);
                setError("Failed to delete organization. Please try again later.");
            }
        }
    };

    const getStatusVariant = (status: string): string => {
        if (status === 'active') return 'success';
        if (status === 'inactive') return 'neutral';
        return 'warning';
    };

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Organization Administration', path: '/organization-admin' },
        { label: 'Organizations' }
    ];

    const filters: Filter[] = [
        {
            label: 'Status',
            value: 'status',
            currentValue: statusFilter,
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' }
            ]
        }
    ];

    const sortOptions: SortOption[] = [
        { label: 'Name (A-Z)', value: 'name' },
        { label: 'Location', value: 'location' },
        { label: 'Recently Added', value: 'date' }
    ];

    return (
        <div className="p-6">
            <BreadcrumbNavigation {...({ items: breadcrumbItems } as any)} />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Organizations</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage sponsor organizations and CROs</p>
                </div>
                <Button {...({ variant: "primary", icon: Plus, onClick: handleCreateOrganization } as any)}>
                    Create New Organization
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <ListControls
                {...({
                    onSearch: setSearchTerm,
                    searchPlaceholder: "Search by name or location...",
                    filters: filters,
                    onFilterChange: (name: string, value: string) => setStatusFilter(value),
                    sortOptions: sortOptions,
                    currentSort: sortBy,
                    onSortChange: setSortBy
                } as any)}
            />

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                </div>
            ) : filteredOrganizations.length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                        {searchTerm || statusFilter ? 'No organizations match your filters' : 'No organizations found. Click the button above to create a new one.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredOrganizations.map((org) => (
                        <Card key={org.id} hoverable>
                            <CardBody className="pb-2">
                                <div className="flex items-start gap-3">
                                    {/* Organization Icon */}
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 
                                                      flex items-center justify-center text-white">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                    </div>

                                    {/* Organization Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base font-semibold text-gray-900 truncate">
                                            {org.name}
                                        </h4>
                                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span className="truncate">
                                                {org.city && org.country
                                                    ? `${org.city}, ${org.country}`
                                                    : org.country || org.city || 'No location'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Organization Type/Details */}
                                {org.type && (
                                    <div className="mt-3">
                                        <Badge {...({ variant: "violet", size: "sm" } as any)}>
                                            {org.type}
                                        </Badge>
                                    </div>
                                )}

                                {/* Status */}
                                <div className="mt-2">
                                    <Badge
                                        {...({ variant: getStatusVariant(org.status), size: "sm" } as any)}
                                    >
                                        {org.status
                                            ? org.status.charAt(0).toUpperCase() + org.status.slice(1)
                                            : 'Unknown'}
                                    </Badge>
                                </div>
                            </CardBody>

                            <CardActions>
                                <Button
                                    {...({ variant: "ghost", size: "sm", icon: Eye, onClick: () => handleViewOrganization(org.id) } as any)}
                                >
                                    View
                                </Button>
                                <Button
                                    {...({ variant: "ghost", size: "sm", icon: Edit2, onClick: () => handleEditOrganization(org.id) } as any)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    {...({ variant: "danger", size: "sm", icon: Trash2, onClick: () => handleDeleteOrganization(org.id) } as any)}
                                >
                                    Delete
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                </div>
            )}

            {/* Statistics Footer */}
            {!loading && filteredOrganizations.length > 0 && (
                <div className="mt-6 text-sm text-gray-600 text-center">
                    Showing {filteredOrganizations.length} of {organizations.length} organizations
                </div>
            )}
        </div>
    );
};

export default OrganizationList;
