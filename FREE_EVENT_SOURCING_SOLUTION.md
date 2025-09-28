# Budget-Friendly Event Sourcing Solutions for ClinPrecision
# Open Source & Free Options Analysis

## 🆓 **Axon Framework (Open Source) - Still My Top Recommendation**

### **What's Free vs Paid:**
- ✅ **Axon Framework**: 100% FREE and open source (Apache 2.0 license)
- ✅ **All CQRS/Event Sourcing features**: FREE
- ✅ **Spring Boot integration**: FREE
- ❌ **Axon Server** (commercial event store): PAID (but optional!)

### **Free Implementation Options:**

#### **Option 1: Axon Framework + JPA Event Store (100% Free)**
```xml
<dependency>
    <groupId>org.axonframework</groupId>
    <artifactId>axon-spring-boot-starter</artifactId>
    <version>4.9.1</version>
</dependency>

<!-- Use JPA/MySQL for event storage - completely free -->
<dependency>
    <groupId>org.axonframework</groupId>
    <artifactId>axon-eventsourcing</artifactId>
    <version>4.9.1</version>
</dependency>
```

**Event Store Configuration (Free):**
```java
@Configuration
public class AxonConfig {
    
    @Bean
    public EventStorageEngine eventStorageEngine(EntityManagerProvider entityManagerProvider) {
        // Use your existing MySQL database - no additional costs!
        return JpaEventStorageEngine.builder()
                .entityManagerProvider(entityManagerProvider)
                .build();
    }
}
```

#### **Option 2: Pure Spring + Custom Event Store (100% Free)**
This is what I'll recommend for your budget:

```java
// Simple, effective, and completely free
@Service
@Transactional
public class EventSourcingService {
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private ApplicationEventPublisher publisher;
    
    public void saveAndPublishEvents(String aggregateId, List<DomainEvent> events) {
        // Save to your existing MySQL database
        events.forEach(event -> {
            EventEntity eventEntity = new EventEntity();
            eventEntity.setAggregateId(aggregateId);
            eventEntity.setEventType(event.getClass().getSimpleName());
            eventEntity.setEventData(JsonUtils.toJson(event));
            eventEntity.setTimestamp(LocalDateTime.now());
            
            eventRepository.save(eventEntity);
            
            // Publish for immediate processing
            publisher.publishEvent(event);
        });
    }
}
```

---

## 🎯 **My Budget-Friendly Recommendation: Spring + Simple Event Store**

### **Why This Works Best for You:**

1. **$0 Cost**: Uses your existing Spring Boot + MySQL setup
2. **Regulatory Compliant**: Full audit trail with event storage
3. **Simple to Understand**: Your team can start immediately
4. **Proven Pattern**: Works in production for many companies
5. **Migration Path**: Can upgrade to Axon later when you have budget

### **Complete Implementation Blueprint**

#### **1. Event Storage Schema (Free)**
```sql
-- Add to your existing MySQL database
CREATE TABLE domain_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSON NOT NULL,
    event_version INT NOT NULL DEFAULT 1,
    occurred_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(100) NOT NULL,
    correlation_id VARCHAR(100),
    reason VARCHAR(500),
    
    INDEX idx_aggregate (aggregate_type, aggregate_id),
    INDEX idx_occurred_on (occurred_on),
    INDEX idx_event_type (event_type)
);

-- Read model for site dashboard
CREATE TABLE site_read_model (
    site_id BIGINT PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL,
    site_number VARCHAR(50) NOT NULL,
    organization_id BIGINT,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP,
    activated_at TIMESTAMP,
    active_studies_count INT DEFAULT 0,
    active_users_count INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### **2. Event Infrastructure (Free)**
```java
// Base domain event
@Data
public abstract class DomainEvent {
    private final UUID eventId = UUID.randomUUID();
    private final LocalDateTime timestamp = LocalDateTime.now();
    private final String userId;
    private final String correlationId;
    private final String reason;
}

// Site events
@Data
@EqualsAndHashCode(callSuper = true)
public class SiteCreatedEvent extends DomainEvent {
    private final Long siteId;
    private final String siteName;
    private final String siteNumber;
    private final Long organizationId;
    
    public SiteCreatedEvent(Long siteId, String siteName, String siteNumber, 
                           Long organizationId, String userId, String reason) {
        super(userId, UUID.randomUUID().toString(), reason);
        this.siteId = siteId;
        this.siteName = siteName;
        this.siteNumber = siteNumber;
        this.organizationId = organizationId;
    }
}

// Event store service
@Service
@Transactional
public class SimpleEventStore {
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private ApplicationEventPublisher publisher;
    
    public void saveEvents(String aggregateType, String aggregateId, 
                          List<DomainEvent> events) {
        
        events.forEach(event -> {
            // Save to database for audit trail
            EventEntity entity = new EventEntity();
            entity.setAggregateType(aggregateType);
            entity.setAggregateId(aggregateId);
            entity.setEventType(event.getClass().getSimpleName());
            entity.setEventData(JsonUtils.toJson(event));
            entity.setUserId(event.getUserId());
            entity.setCorrelationId(event.getCorrelationId());
            entity.setReason(event.getReason());
            
            eventRepository.save(entity);
            
            // Publish for immediate processing
            publisher.publishEvent(event);
        });
    }
    
    public List<DomainEvent> getEventsByAggregate(String aggregateType, String aggregateId) {
        List<EventEntity> entities = eventRepository.findByAggregateTypeAndAggregateIdOrderByOccurredOn(
            aggregateType, aggregateId);
        
        return entities.stream()
            .map(this::deserializeEvent)
            .collect(Collectors.toList());
    }
}
```

#### **3. Site Aggregate (Free)**
```java
@Service
@Transactional
public class SiteService {
    
    @Autowired
    private SiteRepository siteRepository;
    
    @Autowired
    private SimpleEventStore eventStore;
    
    public SiteDto createSite(CreateSiteDto dto) {
        // Validate business rules
        if (siteRepository.findBySiteNumber(dto.getSiteNumber()).isPresent()) {
            throw new BusinessException("Site number already exists");
        }
        
        // Create entity
        SiteEntity site = new SiteEntity();
        site.setName(dto.getName());
        site.setSiteNumber(dto.getSiteNumber());
        site.setStatus(SiteEntity.SiteStatus.pending);
        
        SiteEntity savedSite = siteRepository.save(site);
        
        // Create and store events
        List<DomainEvent> events = List.of(
            new SiteCreatedEvent(
                savedSite.getId(),
                savedSite.getName(),
                savedSite.getSiteNumber(),
                dto.getOrganizationId(),
                getCurrentUserId(),
                "Site created through admin interface"
            )
        );
        
        eventStore.saveEvents("Site", savedSite.getId().toString(), events);
        
        return mapToDto(savedSite);
    }
    
    public SiteDto activateSite(Long siteId, Long studyId, String reason) {
        SiteEntity site = siteRepository.findById(siteId)
            .orElseThrow(() -> new EntityNotFoundException("Site not found"));
        
        if (site.getStatus() != SiteEntity.SiteStatus.pending) {
            throw new BusinessException("Site must be pending to activate");
        }
        
        site.setStatus(SiteEntity.SiteStatus.active);
        SiteEntity activatedSite = siteRepository.save(site);
        
        // Store activation event
        List<DomainEvent> events = List.of(
            new SiteActivatedEvent(
                siteId,
                studyId,
                getCurrentUserId(),
                reason
            )
        );
        
        eventStore.saveEvents("Site", siteId.toString(), events);
        
        return mapToDto(activatedSite);
    }
}
```

#### **4. Read Model Projections (Free)**
```java
@Component
public class SiteReadModelProjection {
    
    @Autowired
    private SiteReadModelRepository readModelRepository;
    
    @EventListener
    public void handle(SiteCreatedEvent event) {
        SiteReadModel readModel = new SiteReadModel();
        readModel.setSiteId(event.getSiteId());
        readModel.setSiteName(event.getSiteName());
        readModel.setSiteNumber(event.getSiteNumber());
        readModel.setOrganizationId(event.getOrganizationId());
        readModel.setStatus("PENDING");
        readModel.setCreatedAt(event.getTimestamp());
        
        readModelRepository.save(readModel);
    }
    
    @EventListener
    public void handle(SiteActivatedEvent event) {
        SiteReadModel readModel = readModelRepository.findBySiteId(event.getSiteId());
        readModel.setStatus("ACTIVE");
        readModel.setActivatedAt(event.getTimestamp());
        readModel.setActiveStudiesCount(readModel.getActiveStudiesCount() + 1);
        
        readModelRepository.save(readModel);
    }
}
```

---

## 🆚 **Free vs Paid Comparison**

| Feature | Free Solution | Axon Server (Paid) |
|---------|---------------|-------------------|
| **Event Storage** | MySQL (existing) | Specialized event store |
| **CQRS/ES Patterns** | ✅ Manual implementation | ✅ Built-in |
| **Audit Trail** | ✅ Complete | ✅ Complete |
| **Regulatory Compliance** | ✅ Full | ✅ Full |
| **Performance** | ✅ Good | ⭐ Excellent |
| **Event Replay** | ✅ Manual | ⭐ Built-in |
| **Snapshots** | ❌ Manual | ✅ Automatic |
| **Cost** | $0 | $$$$ |

---

## 🎯 **My Final Recommendation**

**Go with the Spring + Simple Event Store approach!**

**Benefits:**
- ✅ **$0 cost** - uses your existing infrastructure
- ✅ **Regulatory compliant** - complete audit trail
- ✅ **Team friendly** - pure Spring patterns
- ✅ **Production ready** - many companies use this
- ✅ **Migration path** - can move to Axon later

**Implementation Timeline:**
- **Week 1-2**: Set up event infrastructure
- **Week 3-4**: Implement site creation/activation
- **Week 5-6**: Add user assignment workflows

This gives you **80% of the benefits** of expensive solutions at **0% of the cost!**

**Want me to start implementing this approach for your site management?**