# ClinPrecision Microservices Architecture Recommendation
# Phase 1: Consolidation + Event Sourcing Integration

## Recommended Service Architecture (8-10 Services)

### Core Business Services (5)

1. **Identity & Access Service**
   - Merge: user-service + admin-service (user management parts)
   - Responsibilities: Authentication, users, roles, permissions
   - Event Sourcing: User lifecycle, role changes, permission grants
   - Database: Users, roles, permissions + user_events table

2. **Clinical Operations Service** 
   - Merge: studydesign-service + datacapture-service
   - Responsibilities: Studies, protocols, forms, data collection
   - Event Sourcing: Study creation, protocol amendments, data entries
   - Database: Studies, forms, subjects + clinical_events table

3. **Site Management Service** (NEW)
   - Responsibilities: Sites, user-site assignments, site activation
   - Event Sourcing: Site lifecycle, user assignments, qualification
   - Database: Sites, assignments + site_events table

4. **Organization Service** (Extract from admin)
   - Responsibilities: Organizations, hierarchies, configurations
   - Event Sourcing: Org changes, hierarchy updates
   - Database: Organizations + org_events table

5. **Notification & Workflow Service** (NEW)
   - Responsibilities: Email, alerts, workflow orchestration
   - Event Sourcing: Notification delivery, workflow state
   - Database: Templates, queues + notification_events table

### Infrastructure Services (3-5)

6. **API Gateway Service** (existing)
   - Routing, authentication, rate limiting
   - No event sourcing needed

7. **Config Service** (existing)
   - Centralized configuration
   - No event sourcing needed

8. **Discovery Service** (existing)
   - Service registration and discovery
   - No event sourcing needed

9. **Event Store Service** (NEW - Optional)
   - Centralized event storage if needed
   - Alternative: Events in each service DB

10. **Reporting & Analytics Service** (NEW - Future)
    - Read models, dashboards, compliance reports
    - Consumes events from all services

## Event Sourcing Implementation Strategy

### Phase 1: Table-Based Event Store
```sql
-- Each service gets its own events table
CREATE TABLE user_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aggregate_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSON NOT NULL,
    event_version INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL
);

CREATE TABLE site_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aggregate_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSON NOT NULL,
    event_version INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL
);
```

### Phase 2: Dedicated Event Store (Future)
- Migrate to EventStore DB or Apache Kafka
- Implement event replay and projections
- Add SAGA pattern for cross-service workflows

## Maintenance Impact Analysis

### Current Maintenance Burden: 7 Services
- 7 deployments
- 7 databases to manage
- 7 sets of logs to monitor
- Medium complexity

### Recommended Maintenance Burden: 8-10 Services
- 5 core business services (consolidated)
- 3-5 infrastructure services
- Event sourcing adds complexity but improves debugging
- **Overall: Slight increase but better organized**

### Alternative: Monolith with Event Sourcing
- Single deployment
- Single database
- Event sourcing within modules
- **Lowest maintenance burden**
- **Recommended if team size < 10 developers**

## Team Structure Recommendations

### Small Team (3-6 developers):
- **Choose Monolith with Event Sourcing**
- Single deployment, modular design
- Event sourcing for audit and compliance

### Medium Team (6-12 developers):
- **Choose Hybrid Approach (8 services)**
- 2 developers per core service
- Shared infrastructure services

### Large Team (12+ developers):
- **Choose Full Microservices (12-15 services)**
- Dedicated team per bounded context
- Platform team for infrastructure

## Implementation Timeline

### Month 1-2: Consolidation
- Merge admin-service user management into user-service
- Extract organization management
- Add event sourcing to existing services

### Month 3-4: Site Management
- Implement site-management-service with event sourcing
- Add user-site assignment workflows
- Create site activation processes

### Month 5-6: Optimization
- Add notification service
- Implement cross-service event handling
- Create reporting read models

## Cost-Benefit Analysis

### Benefits:
✅ Complete audit trail for compliance
✅ Better debugging and monitoring
✅ Scalable read models
✅ Time-travel debugging
✅ Replay capability for data fixes

### Costs:
❌ Additional complexity
❌ Learning curve for team
❌ More infrastructure to manage
❌ Eventual consistency challenges
❌ Storage overhead for events

## My Final Recommendation:

**Start with 8-service hybrid approach:**
1. Identity & Access Service (merged)
2. Clinical Operations Service (merged) 
3. Site Management Service (new)
4. Organization Service (extracted)
5. Notification Service (new)
6. API Gateway (existing)
7. Config Service (existing)
8. Discovery Service (existing)

This gives you:
- Manageable service count
- Event sourcing benefits where needed
- Room to grow
- Reasonable maintenance burden