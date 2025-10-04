# Admin Microservice - Code List Management

## Overview

The admin microservice provides centralized management of application code lists (dropdowns, lookup values) with comprehensive REST API endpoints for both other microservices and the frontend admin UI.

## Features

### Core Functionality
- **Centralized Code Management**: Single source of truth for all dropdown/lookup values
- **Category-based Organization**: Code lists organized by categories (AMENDMENT_TYPE, STUDY_STATUS, etc.)
- **Multi-tier API Design**: Separate endpoints optimized for microservices vs admin UI
- **Caching**: Performance optimization with Spring Cache
- **Audit Trail**: Full tracking of changes with created/updated timestamps and user references
- **Soft Delete**: Safe deletion with ability to restore
- **Validation**: Code existence and validity checking
- **Search**: Text-based search across all code lists

### Advanced Features
- **Hierarchical Support**: Parent-child relationships between code lists
- **Metadata Storage**: JSON metadata for extended attributes
- **Expiry Management**: Date-based validity periods
- **System vs User Codes**: Distinction between system-managed and user-configurable codes
- **Sort Order Management**: Custom ordering within categories
- **Bulk Operations**: Efficient batch updates

## API Endpoints

### For Other Microservices (Fast & Simple)
```
GET /api/admin/codelists/simple/{category}      - Get simple code lists for dropdowns
GET /api/admin/codelists/{category}/{code}      - Get specific code by category and code
GET /api/admin/codelists/validate/{category}/{code} - Validate code existence
GET /api/admin/codelists/categories             - Get all categories
GET /api/admin/codelists/health                 - Health check
```

### For Admin UI (Full CRUD)
```
GET /api/admin/codelists/{category}             - Get full code lists by category  
GET /api/admin/codelists/id/{id}                - Get code list by ID
POST /api/admin/codelists                       - Create new code list
PUT /api/admin/codelists/{id}                   - Update code list
DELETE /api/admin/codelists/{id}                - Soft delete code list
DELETE /api/admin/codelists/{id}/hard           - Hard delete (admin only)
```

### Search & Utility
```
GET /api/admin/codelists/search?searchText=     - Search code lists
GET /api/admin/codelists/{parentId}/children    - Get child code lists
GET /api/admin/codelists/expiring?days=         - Get expiring code lists
PUT /api/admin/codelists/{category}/sort-order  - Update sort order
```

### Cache Management  
```
POST /api/admin/codelists/cache/clear           - Clear all caches
```

## Database Schema

The code list system uses the following main table:

### `code_lists` Table
- `id` - Primary key
- `category` - Code category (e.g., AMENDMENT_TYPE)
- `code` - Code value (e.g., MAJOR)
- `display_name` - Human-readable display name
- `description` - Optional description
- `is_active` - Soft delete flag
- `sort_order` - Display order within category
- `system_code` - System-managed vs user-configurable
- `parent_code_id` - For hierarchical relationships
- `effective_date` / `expiry_date` - Validity periods
- `metadata` - JSON for extended attributes
- Audit fields: `created_by`, `created_date`, `updated_by`, `updated_date`, `version_number`

## Implementation Components

### Entity Layer
- **CodeListEntity**: JPA entity with JSON metadata support and lifecycle callbacks

### Repository Layer  
- **CodeListRepository**: Spring Data JPA with complex queries for filtering, searching, and statistics

### Service Layer
- **CodeListService**: Business logic with caching, validation, and bulk operations

### Controller Layer
- **CodeListController**: REST endpoints optimized for different consumers

### Configuration
- **CacheConfig**: Spring Cache configuration
- **AdminServiceConfig**: Component scanning and JPA repositories

## Usage Examples

### For Microservices (Simple)
```java
// Get amendment types for dropdown
ResponseEntity<List<CodeListDto>> response = restTemplate.getForEntity(
    "http://admin-service/api/admin/codelists/simple/AMENDMENT_TYPE", 
    List.class
);

// Validate amendment type  
ResponseEntity<Map<String, Boolean>> validation = restTemplate.getForEntity(
    "http://admin-service/api/admin/codelists/validate/AMENDMENT_TYPE/MAJOR",
    Map.class
);
```

### For Admin UI (Full CRUD)
```java
// Create new code list
CreateCodeListRequest request = CreateCodeListRequest.builder()
    .category("AMENDMENT_TYPE")
    .code("EMERGENCY")
    .displayName("Emergency Amendment")
    .description("Emergency protocol amendments")
    .createdBy(currentUserId)
    .build();

ResponseEntity<CodeListDto> response = restTemplate.postForEntity(
    "http://admin-service/api/admin/codelists",
    request,
    CodeListDto.class
);
```

## Caching Strategy

- **Cache Names**: `codeLists`, `simpleCodeLists`, `codeListCategories`
- **Cache Eviction**: Automatic on create/update/delete operations
- **Manual Cache Clearing**: Available via `/cache/clear` endpoint
- **Cache Provider**: ConcurrentMapCacheManager (can be replaced with Redis for production)

## Error Handling

- **404**: Category/code not found
- **409**: Duplicate code creation, optimistic locking conflicts  
- **400**: Invalid request data, validation errors
- **500**: Internal server errors with detailed logging

## Security Considerations

- **System Code Protection**: System-managed codes cannot be modified/deleted by regular users
- **Audit Trail**: All changes tracked with user and timestamp
- **Soft Delete**: Safe deletion with restore capability
- **Hard Delete**: Restricted to non-system codes only

## Database Setup

1. Run `code_lists_schema.sql` to create the schema
2. Run `code_lists_data.sql` to populate initial data
3. Ensure proper indexes are in place for performance

## Next Steps

1. **Integration**: Connect other microservices to use these endpoints
2. **Frontend Integration**: Build admin UI to manage code lists
3. **Monitoring**: Add metrics and monitoring for cache performance
4. **Security**: Implement proper authentication/authorization
5. **Production Cache**: Replace with Redis or other distributed cache