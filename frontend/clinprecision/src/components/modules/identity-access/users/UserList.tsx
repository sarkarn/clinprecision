import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../../../../services/UserService';
import { UserTypeService } from '../../../../services/auth/UserTypeService';
import { useAuth } from '../../../login/AuthContext';
import { Card, CardHeader, CardBody, CardActions, Button, Badge, ListControls, BreadcrumbNavigation } from '../../../shared/ui';
import { User, Mail, Edit2, Trash2, Plus } from 'lucide-react';

interface UserItem {
    userId: number | string;
    firstName: string;
    lastName: string;
    email: string;
    status?: string;
    userTypes?: (number | string)[];
    createdAt?: string;
}

interface UserType {
    id: number | string;
    name: string;
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

const UserList: React.FC = () => {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserItem[]>([]);
    const [userTypes, setUserTypes] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const navigate = useNavigate();
    const { user } = useAuth();

    const isAuthenticated = !!user;

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterAndSortUsers();
    }, [users, searchTerm, statusFilter, sortBy]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const usersData = await UserService.getAllUsers();
            setUsers(usersData as any);

            const userTypesData = await UserTypeService.getAllUserTypes();
            setUserTypes(userTypesData as any);

            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortUsers = () => {
        let result = [...users];

        // Search filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(u =>
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(lowerSearch) ||
                u.email.toLowerCase().includes(lowerSearch)
            );
        }

        // Status filter (based on active/inactive)
        if (statusFilter) {
            result = result.filter(u => {
                if (statusFilter === 'active') return u.status === 'active' || !u.status;
                return u.status === statusFilter;
            });
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'name') {
                const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
                const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
                return nameA.localeCompare(nameB);
            } else if (sortBy === 'email') {
                return a.email.localeCompare(b.email);
            } else if (sortBy === 'date') {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            }
            return 0;
        });

        setFilteredUsers(result);
    };

    const handleCreateUser = () => {
        navigate('/identity-access/users/create');
    };

    const handleEditUser = (userId: number | string) => {
        navigate(`/identity-access/users/edit/${userId}`);
    };

    const handleDeleteUser = async (userId: number | string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await UserService.deleteUser(userId as any);
                fetchData();
            } catch (err) {
                console.error(`Error deleting user ${userId}:`, err);
                setError('Failed to delete user. Please try again later.');
            }
        }
    };

    const getUserTypeNames = (user: UserItem): string[] => {
        if (!user.userTypes || !user.userTypes.length) return [];
        return user.userTypes
            .map(typeId => {
                const userType = userTypes.find(type => type.id === typeId);
                return userType ? userType.name : null;
            })
            .filter(Boolean) as string[];
    };

    const getInitials = (firstName: string, lastName: string): string => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Identity & Access', path: '/identity-access' },
        { label: 'Users' }
    ];

    return (
        <div className="p-6">
            <BreadcrumbNavigation {...({ items: breadcrumbItems } as any)} />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Users</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage system users and their access</p>
                </div>
                {isAuthenticated && (
                    <Button {...({ variant: "primary", icon: Plus, onClick: handleCreateUser } as any)}>
                        Create New User
                    </Button>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <ListControls
                {...({
                    onSearch: setSearchTerm,
                    searchPlaceholder: "Search by name or email...",
                    filters: [
                        {
                            label: 'Status',
                            value: 'status',
                            currentValue: statusFilter,
                            options: [
                                { label: 'Active', value: 'active' },
                                { label: 'Inactive', value: 'inactive' }
                            ]
                        }
                    ],
                    onFilterChange: (name: string, value: string) => setStatusFilter(value),
                    sortOptions: [
                        { label: 'Name (A-Z)', value: 'name' },
                        { label: 'Email', value: 'email' },
                        { label: 'Recently Added', value: 'date' }
                    ],
                    currentSort: sortBy,
                    onSortChange: setSortBy
                } as any)}
            />

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                        {searchTerm || statusFilter ? 'No users match your filters' : 'No users found. Click the button above to create a new one.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredUsers.map((userItem) => {
                        const userTypeNames = getUserTypeNames(userItem);
                        const initials = getInitials(userItem.firstName, userItem.lastName);

                        return (
                            <Card key={userItem.userId} {...({ hoverable: true } as any)}>
                                <CardBody {...({ className: "pb-2" } as any)}>
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                                                          flex items-center justify-center text-white font-semibold text-lg">
                                                {initials}
                                            </div>
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-semibold text-gray-900 truncate">
                                                {`${userItem.firstName} ${userItem.lastName}`}
                                            </h4>
                                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                                <Mail className="h-3.5 w-3.5" />
                                                <span className="truncate">{userItem.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Types */}
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {userTypeNames.length > 0 ? (
                                            userTypeNames.map((typeName, idx) => (
                                                <Badge key={idx} {...({ variant: "blue", size: "sm" } as any)}>
                                                    {typeName}
                                                </Badge>
                                            ))
                                        ) : (
                                            <Badge {...({ variant: "neutral", size: "sm" } as any)}>No Types</Badge>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="mt-2">
                                        <Badge
                                            {...({
                                                variant: userItem.status === 'active' || !userItem.status ? 'success' : 'neutral',
                                                size: "sm"
                                            } as any)}
                                        >
                                            {userItem.status === 'active' || !userItem.status ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </CardBody>

                                <CardActions>
                                    <Button
                                        {...({
                                            variant: "ghost",
                                            size: "sm",
                                            icon: Edit2,
                                            onClick: () => handleEditUser(userItem.userId)
                                        } as any)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        {...({
                                            variant: "danger",
                                            size: "sm",
                                            icon: Trash2,
                                            onClick: () => handleDeleteUser(userItem.userId)
                                        } as any)}
                                    >
                                        Delete
                                    </Button>
                                </CardActions>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Statistics Footer */}
            {!loading && filteredUsers.length > 0 && (
                <div className="mt-6 text-sm text-gray-600 text-center">
                    Showing {filteredUsers.length} of {users.length} users
                </div>
            )}
        </div>
    );
};

export default UserList;
