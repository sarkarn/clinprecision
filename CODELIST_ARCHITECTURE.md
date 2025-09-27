# ClinPrecision Code List Architecture

## Overview
Centralized code list management system to eliminate hardcoded values and ensure data consistency across frontend and backend.

## Database Schema

### Core Code List Table
```sql
CREATE TABLE code_lists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code_type VARCHAR(100) NOT NULL,           -- e.g., 'AMENDMENT_TYPE', 'STUDY_STATUS'
    code_value VARCHAR(100) NOT NULL,          -- e.g., 'INITIAL', 'MAJOR'
    display_label VARCHAR(255) NOT NULL,       -- e.g., 'Initial Protocol'
    description TEXT,                          -- e.g., 'Initial protocol version'
    sort_order INT DEFAULT 0,                 -- For ordering in dropdowns
    is_active BOOLEAN DEFAULT TRUE,           -- For soft deletes
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    
    UNIQUE KEY uk_code_type_value (code_type, code_value),
    INDEX idx_code_type (code_type),
    INDEX idx_active (is_active)
);
```

### Metadata Table (Optional)
```sql
CREATE TABLE code_list_types (
    code_type VARCHAR(100) PRIMARY KEY,
    description VARCHAR(500),
    is_system_managed BOOLEAN DEFAULT FALSE,  -- Cannot be modified via UI
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Initial Data Population

### Amendment Types
```sql
INSERT INTO code_lists (code_type, code_value, display_label, description, sort_order) VALUES
('AMENDMENT_TYPE', 'INITIAL', 'Initial Protocol', 'Initial protocol version', 1),
('AMENDMENT_TYPE', 'MAJOR', 'Major Amendment', 'Protocol changes affecting safety/efficacy', 2),
('AMENDMENT_TYPE', 'MINOR', 'Minor Amendment', 'Administrative changes', 3),
('AMENDMENT_TYPE', 'SAFETY', 'Safety Amendment', 'Safety-related changes', 4),
('AMENDMENT_TYPE', 'ADMINISTRATIVE', 'Administrative Amendment', 'Non-substantial changes', 5);
```

### Study Statuses
```sql
INSERT INTO code_lists (code_type, code_value, display_label, description, sort_order) VALUES
('STUDY_STATUS', 'DRAFT', 'Draft', 'Study in development', 1),
('STUDY_STATUS', 'PLANNING', 'Planning', 'Study being planned', 2),
('STUDY_STATUS', 'ACTIVE', 'Active', 'Study actively recruiting', 3),
('STUDY_STATUS', 'COMPLETED', 'Completed', 'Study completed', 4);
```

### Protocol Version Statuses
```sql
INSERT INTO code_lists (code_type, code_value, display_label, description, sort_order) VALUES
('PROTOCOL_VERSION_STATUS', 'DRAFT', 'Draft', 'Protocol version in development', 1),
('PROTOCOL_VERSION_STATUS', 'PROTOCOL_REVIEW', 'Protocol Review', 'Under protocol review', 2),
('PROTOCOL_VERSION_STATUS', 'APPROVED', 'Approved', 'Protocol version approved', 3),
('PROTOCOL_VERSION_STATUS', 'ACTIVE', 'Active', 'Currently active protocol version', 4),
('PROTOCOL_VERSION_STATUS', 'SUPERSEDED', 'Superseded', 'Replaced by newer version', 5),
('PROTOCOL_VERSION_STATUS', 'WITHDRAWN', 'Withdrawn', 'Protocol version withdrawn', 6);
```

## Backend Implementation

### 1. Code List Service
```java
@Service
public class CodeListService {
    
    @Autowired
    private CodeListRepository codeListRepository;
    
    public List<CodeListDto> getCodeListByType(String codeType) {
        return codeListRepository.findByCodeTypeAndIsActiveOrderBySortOrder(codeType, true)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    public Map<String, List<CodeListDto>> getAllCodeLists() {
        List<CodeList> allCodes = codeListRepository.findByIsActiveOrderByCodeTypeSortOrder(true);
        return allCodes.stream()
                .map(this::mapToDto)
                .collect(Collectors.groupingBy(CodeListDto::getCodeType));
    }
}
```

### 2. REST Controller
```java
@RestController
@RequestMapping("/api/code-lists")
public class CodeListController {
    
    @Autowired
    private CodeListService codeListService;
    
    @GetMapping("/{codeType}")
    public ResponseEntity<List<CodeListDto>> getCodeList(@PathVariable String codeType) {
        return ResponseEntity.ok(codeListService.getCodeListByType(codeType));
    }
    
    @GetMapping
    public ResponseEntity<Map<String, List<CodeListDto>>> getAllCodeLists() {
        return ResponseEntity.ok(codeListService.getAllCodeLists());
    }
}
```

### 3. Update Enums (Temporary for backward compatibility)
```java
public enum AmendmentType {
    INITIAL,    // Add this missing value
    MAJOR,
    MINOR,
    SAFETY,
    ADMINISTRATIVE
}
```

## Frontend Implementation

### 1. Code List Service
```javascript
class CodeListService {
    static async getCodeList(codeType) {
        try {
            const response = await ApiService.get(`/api/code-lists/${codeType}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching code list for ${codeType}:`, error);
            throw error;
        }
    }
    
    static async getAllCodeLists() {
        try {
            const response = await ApiService.get('/api/code-lists');
            return response.data;
        } catch (error) {
            console.error('Error fetching all code lists:', error);
            throw error;
        }
    }
}
```

### 2. Code List Hook
```javascript
export const useCodeLists = (codeTypes = []) => {
    const [codeLists, setCodeLists] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchCodeLists = async () => {
            if (codeTypes.length === 0) return;
            
            try {
                setLoading(true);
                
                // Fetch specific code types or all
                const promises = codeTypes.includes('*') 
                    ? [CodeListService.getAllCodeLists()]
                    : codeTypes.map(type => 
                        CodeListService.getCodeList(type).then(data => ({ [type]: data }))
                      );
                
                const results = await Promise.all(promises);
                const combined = results.reduce((acc, result) => ({ ...acc, ...result }), {});
                
                setCodeLists(combined);
                setError(null);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCodeLists();
    }, [codeTypes.join(',')]);
    
    return { codeLists, loading, error };
};
```

### 3. Updated Protocol Version Hook
```javascript
const useProtocolVersioning = (studyId) => {
    // Load code lists dynamically
    const { codeLists } = useCodeLists(['AMENDMENT_TYPE', 'PROTOCOL_VERSION_STATUS']);
    
    // Use dynamic code lists instead of hardcoded constants
    const AMENDMENT_TYPES = useMemo(() => {
        return (codeLists.AMENDMENT_TYPE || []).reduce((acc, item) => {
            acc[item.codeValue] = {
                value: item.codeValue,
                label: item.displayLabel,
                description: item.description
            };
            return acc;
        }, {});
    }, [codeLists.AMENDMENT_TYPE]);
    
    const PROTOCOL_VERSION_STATUS = useMemo(() => {
        return (codeLists.PROTOCOL_VERSION_STATUS || []).reduce((acc, item) => {
            acc[item.codeValue] = {
                value: item.codeValue,
                label: item.displayLabel,
                description: item.description,
                // Additional UI properties can be added here
            };
            return acc;
        }, {});
    }, [codeLists.PROTOCOL_VERSION_STATUS]);
    
    // Rest of the hook remains the same but uses dynamic values
};
```

## Benefits

### 1. **Single Source of Truth**
- All code lists managed in database
- Backend and frontend always synchronized
- No hardcoded values

### 2. **Easy Maintenance**
- Add/modify code lists via admin interface
- No code deployments for simple changes
- Version control for code list changes

### 3. **Flexibility**
- Support for multiple languages (add locale columns)
- Conditional code lists based on context
- Easy A/B testing of different labels

### 4. **Performance**
- Cache code lists on frontend
- Batch loading of all code lists on app start
- Lazy loading for specific types

## Migration Strategy

### Phase 1: Backend
1. Create code list tables and populate data
2. Add missing enum values (like `INITIAL`)
3. Create code list service and API endpoints
4. Update existing services to use code lists

### Phase 2: Frontend
1. Create CodeListService and useCodeLists hook
2. Update components one by one to use dynamic code lists
3. Remove hardcoded constants
4. Add caching for performance

### Phase 3: Admin Interface
1. Create admin screens for code list management
2. Add validation and business rules
3. Implement audit trails for changes

## Code List Types to Implement

- `AMENDMENT_TYPE`
- `STUDY_STATUS` 
- `PROTOCOL_VERSION_STATUS`
- `STUDY_PHASE`
- `REGULATORY_STATUS`
- `USER_ROLE`
- `ORGANIZATION_TYPE`
- `VISIT_TYPE`
- `FORM_STATUS`
- `DATA_TYPE`

This approach eliminates the current frontend/backend mismatch and provides a scalable foundation for all dropdown lists and enums in the application.