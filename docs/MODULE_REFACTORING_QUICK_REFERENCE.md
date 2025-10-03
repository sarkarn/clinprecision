# Module Refactoring Quick Reference

## 🎯 Quick Navigation

### New Module Routes
```
/identity-access/*         → Identity & Access Management (IAM)
/organization-admin/*      → Organization Administration
/site-operations/*         → Site Operations Management
```

### Legacy Routes (Deprecated)
```
/user-management/*         → Shows deprecation banner + old module
/admin/*                   → [To be redirected in future]
```

---

## 📁 Folder Structure

```
frontend/clinprecision/src/components/
│
├─ shared/
│  └─ ui/                          ← NEW: Reusable UI Component Library
│     ├─ SearchBar.jsx
│     ├─ Button.jsx
│     ├─ Card.jsx
│     ├─ Badge.jsx
│     ├─ FormField.jsx
│     ├─ ListControls.jsx
│     ├─ BreadcrumbNavigation.jsx
│     └─ index.js
│
└─ modules/
   ├─ identity-access/             ← NEW: User & Role Management
   │  ├─ IdentityAccessModule.jsx (Router)
   │  ├─ IAMDashboard.jsx
   │  ├─ users/
   │  │  └─ UserList.jsx           ← MIGRATED & MODERNIZED
   │  ├─ user-types/
   │  └─ study-assignments/
   │
   ├─ organization-admin/          ← NEW: Organization Management
   │  ├─ OrganizationAdminModule.jsx (Router)
   │  ├─ OrgDashboard.jsx
   │  └─ organizations/
   │     └─ OrganizationList.jsx   ← MIGRATED & MODERNIZED
   │
   ├─ site-operations/             ← NEW: Site Management
   │  ├─ SiteOperationsModule.jsx (Router)
   │  ├─ SiteDashboard.jsx
   │  ├─ sites/
   │  └─ study-sites/
   │
   └─ admin/                       ← OLD: Legacy Module (To be removed)
      └─ AdminModule.jsx
```

---

## 🎨 Using the UI Component Library

### Import Components
```javascript
import { 
  SearchBar, 
  Button, 
  Card, CardHeader, CardBody, CardActions,
  Badge, 
  FormField, 
  ListControls, 
  BreadcrumbNavigation 
} from '../../../shared/ui';
```

### SearchBar Example
```jsx
<SearchBar 
  onSearch={(term) => setSearchTerm(term)}
  placeholder="Search by name or email..."
  debounceMs={300}  // Optional, default 300ms
/>
```

### Button Example
```jsx
<Button 
  variant="primary"    // primary | secondary | danger | ghost
  size="md"            // sm | md | lg
  icon={Plus}          // Lucide React icon
  onClick={handleClick}
>
  Create User
</Button>
```

### Card Example
```jsx
<Card hoverable onClick={handleClick}>
  <CardBody>
    <h4 className="text-lg font-semibold">{title}</h4>
    <p className="text-sm text-gray-600">{description}</p>
  </CardBody>
  <CardActions>
    <Button variant="ghost" size="sm" icon={Edit2}>Edit</Button>
    <Button variant="danger" size="sm" icon={Trash2}>Delete</Button>
  </CardActions>
</Card>
```

### Badge Example
```jsx
<Badge variant="success" size="sm">Active</Badge>
<Badge variant="blue" size="sm">IAM</Badge>
```

### FormField Example
```jsx
<FormField
  label="Email"
  name="email"
  type="email"
  value={formData.email}
  onChange={handleChange}
  error={errors.email}
  helpText="Enter a valid organizational email address"
  required
  placeholder="user@example.com"
/>
```

### ListControls Example
```jsx
<ListControls
  onSearch={setSearchTerm}
  searchPlaceholder="Search by name or email..."
  filters={[
    {
      label: 'Status',
      value: 'status',
      currentValue: statusFilter,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ]
    }
  ]}
  onFilterChange={(name, value) => setStatusFilter(value)}
  sortOptions={[
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Recently Added', value: 'date' }
  ]}
  currentSort={sortBy}
  onSortChange={setSortBy}
/>
```

### BreadcrumbNavigation Example
```jsx
<BreadcrumbNavigation 
  items={[
    { label: 'Identity & Access', path: '/identity-access' },
    { label: 'Users', path: '/identity-access/users' },
    { label: 'John Doe' } // Current page (no path)
  ]}
  showHome={true}
/>
```

---

## 🎨 Design System

### Color Schemes by Module
```javascript
// Identity & Access Management
colors: 'blue', 'indigo', 'purple'
gradient: 'from-blue-500 to-blue-600'

// Organization Administration
colors: 'violet', 'purple', 'indigo'
gradient: 'from-violet-500 to-violet-600'

// Site Operations
colors: 'amber', 'orange', 'yellow'
gradient: 'from-amber-500 to-amber-600'
```

### Semantic Badge Variants
```javascript
variant="success"   // Green - Active, Approved
variant="warning"   // Yellow - Pending, Review
variant="danger"    // Red - Inactive, Error
variant="info"      // Blue - Information
variant="neutral"   // Gray - Default
```

### Button Variants
```javascript
variant="primary"    // Blue - Primary actions
variant="secondary"  // Gray - Secondary actions
variant="danger"     // Red - Delete, Remove
variant="ghost"      // Transparent - Subtle actions
```

---

## 🔄 Migration Pattern

### Before (Old Table Pattern)
```jsx
<table className="min-w-full divide-y divide-gray-200">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {users.map(user => (
      <tr key={user.id}>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>
          <button onClick={() => handleEdit(user.id)}>Edit</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### After (New Card Grid Pattern)
```jsx
<ListControls
  onSearch={setSearchTerm}
  filters={[...]}
  onFilterChange={...}
  sortOptions={[...]}
  currentSort={sortBy}
  onSortChange={setSortBy}
/>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {filteredUsers.map(user => (
    <Card key={user.id} hoverable>
      <CardBody>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                        flex items-center justify-center text-white font-semibold">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h4>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <Mail className="h-3.5 w-3.5" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {user.userTypes.map(type => (
            <Badge key={type} variant="blue" size="sm">{type}</Badge>
          ))}
        </div>
      </CardBody>
      <CardActions>
        <Button variant="ghost" size="sm" icon={Edit2} onClick={() => handleEdit(user.id)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(user.id)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  ))}
</div>
```

---

## 🚀 Creating a New List View

### Step-by-Step Template

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { YourService } from '../../../../services/YourService';
import { Card, CardBody, CardActions, Button, Badge, ListControls, BreadcrumbNavigation } from '../../../shared/ui';
import { YourIcon, Edit2, Trash2, Plus } from 'lucide-react';

export default function YourList() {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const navigate = useNavigate();

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    // Filter and sort when dependencies change
    useEffect(() => {
        filterAndSortItems();
    }, [items, searchTerm, statusFilter, sortBy]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await YourService.getAll();
            setItems(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortItems = () => {
        let result = [...items];

        // Search filter
        if (searchTerm) {
            result = result.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter) {
            result = result.filter(item => item.status === statusFilter);
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
            return 0;
        });

        setFilteredItems(result);
    };

    const handleCreate = () => navigate('/your-module/your-resource/create');
    const handleEdit = (id) => navigate(`/your-module/your-resource/edit/${id}`);
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await YourService.delete(id);
                fetchData();
            } catch (err) {
                console.error('Error deleting:', err);
                setError('Failed to delete. Please try again.');
            }
        }
    };

    const breadcrumbItems = [
        { label: 'Your Module', path: '/your-module' },
        { label: 'Your Resource' }
    ];

    return (
        <div className="p-6">
            <BreadcrumbNavigation items={breadcrumbItems} />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Your Resource</h3>
                    <p className="text-sm text-gray-600 mt-1">Description of your resource</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={handleCreate}>
                    Create New
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <ListControls
                onSearch={setSearchTerm}
                searchPlaceholder="Search..."
                filters={[
                    {
                        label: 'Status',
                        value: 'status',
                        currentValue: statusFilter,
                        options: [
                            { label: 'Active', value: 'active' },
                            { label: 'Inactive', value: 'inactive' }
                        ]
                    }
                ]}
                onFilterChange={(name, value) => setStatusFilter(value)}
                sortOptions={[
                    { label: 'Name (A-Z)', value: 'name' },
                    { label: 'Recently Added', value: 'date' }
                ]}
                currentSort={sortBy}
                onSortChange={setSortBy}
            />

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                    <YourIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No items found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map(item => (
                        <Card key={item.id} hoverable>
                            <CardBody>
                                {/* Your card content */}
                            </CardBody>
                            <CardActions>
                                <Button variant="ghost" size="sm" icon={Edit2} onClick={() => handleEdit(item.id)}>
                                    Edit
                                </Button>
                                <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(item.id)}>
                                    Delete
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                </div>
            )}

            {!loading && filteredItems.length > 0 && (
                <div className="mt-6 text-sm text-gray-600 text-center">
                    Showing {filteredItems.length} of {items.length} items
                </div>
            )}
        </div>
    );
}
```

---

## 📋 Component Checklist

When creating a new list view, ensure:

- [ ] Import all necessary UI components from `shared/ui`
- [ ] Add `useState` for items, filtered items, loading, error, search, filters, sort
- [ ] Add `useEffect` to fetch data on mount
- [ ] Add `useEffect` to filter/sort when dependencies change
- [ ] Implement `filterAndSortItems()` function
- [ ] Add breadcrumb navigation
- [ ] Add header with title, description, and create button
- [ ] Add error display
- [ ] Add `ListControls` with search, filters, and sort
- [ ] Add loading state (spinner)
- [ ] Add empty state (icon + message)
- [ ] Use card grid layout (responsive breakpoints)
- [ ] Add card actions (Edit, Delete buttons)
- [ ] Add statistics footer (X of Y items)
- [ ] Add proper error handling in CRUD operations

---

## 🔗 Routing Patterns

### Module Router Example
```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import ResourceList from './resource/ResourceList';
import ResourceForm from './resource/ResourceForm';

const YourModule = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/resource" element={<ResourceList />} />
      <Route path="/resource/create" element={<ResourceForm />} />
      <Route path="/resource/edit/:id" element={<ResourceForm />} />
      <Route path="*" element={<Navigate to="/your-module" replace />} />
    </Routes>
  );
};
```

---

## 🧪 Testing Your Component

```bash
# Start development server
npm start

# Navigate to your module
http://localhost:3000/your-module/your-resource

# Test checklist:
✓ Page loads without errors
✓ Data fetches and displays in card grid
✓ Search filters results (with 300ms delay)
✓ Filter dropdowns work correctly
✓ Sort changes order
✓ Create button navigates to form
✓ Edit button navigates to form with ID
✓ Delete button shows confirm and removes item
✓ Breadcrumb links work
✓ Empty state shows when no results
✓ Error messages display on API errors
✓ Loading spinner appears during fetch
✓ Responsive grid works on mobile/tablet/desktop
```

---

## 📚 Related Documentation

- [USER_SITE_MANAGEMENT_UX_ANALYSIS.md](./USER_SITE_MANAGEMENT_UX_ANALYSIS.md) - Full UX analysis and roadmap
- [PHASE_1_2_IMPLEMENTATION_SUMMARY.md](./PHASE_1_2_IMPLEMENTATION_SUMMARY.md) - Implementation details
- [ROUTING_QUICK_REFERENCE.md](../ROUTING_QUICK_REFERENCE.md) - Routing guide

---

## 💡 Tips & Best Practices

1. **Always use the UI component library** - Don't recreate buttons, cards, etc.
2. **Follow the card grid pattern** - Use the 4-breakpoint grid system
3. **Add breadcrumbs** - Help users navigate back
4. **Include search and filters** - Use ListControls component
5. **Show loading states** - Display spinner during fetch
6. **Handle empty states** - Show helpful message with icon
7. **Add error handling** - Display user-friendly error messages
8. **Use semantic colors** - Match module color scheme
9. **Keep cards consistent** - Avatar/icon, title, metadata, badges, actions
10. **Test responsiveness** - Verify on mobile, tablet, desktop

---

## 🆘 Common Issues

### Issue: Icons not displaying
**Solution:** Import from `lucide-react`: `import { Icon Name } from 'lucide-react';`

### Issue: TailwindCSS classes not working
**Solution:** Ensure class names are complete strings (not template literals with variables)

### Issue: Search not debouncing
**Solution:** Verify `onSearch` callback is wrapped in `useEffect` with debounce

### Issue: Filters not updating
**Solution:** Ensure `useEffect` dependency array includes filter state variables

### Issue: Cards not responsive
**Solution:** Use grid classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

---

**Last Updated:** 2025-01-XX  
**Maintained By:** Development Team  
**Questions?** Check the full analysis doc or ask in #frontend-dev
