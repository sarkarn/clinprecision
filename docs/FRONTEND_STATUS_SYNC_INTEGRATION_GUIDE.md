# Frontend Status Synchronization Integration Guide

## Quick Start

### 1. Update Existing Components

Replace existing study management components with enhanced versions:

```javascript
// Before: Old StudyOverviewDashboard
import StudyOverviewDashboard from './study-management/StudyOverviewDashboard';

// After: Enhanced version with real-time capabilities
import EnhancedStudyOverviewDashboard from './study-management/EnhancedStudyOverviewDashboard';

// Usage remains the same
<EnhancedStudyOverviewDashboard
    studyId={studyId}
    onBack={handleBack}
    onEdit={handleEdit}
    onCreateVersion={handleCreateVersion}
/>
```

```javascript
// Before: Old StudyListGrid
import StudyListGrid from './study-management/StudyListGrid';

// After: Enhanced version with real-time capabilities
import EnhancedStudyListGrid from './study-management/EnhancedStudyListGrid';

// Usage with additional real-time features
<EnhancedStudyListGrid
    onStudySelect={handleStudySelect}
    onStudyEdit={handleStudyEdit}
    onCreateVersion={handleCreateVersion}
    showActions={true}
    selectable={false}
/>
```

### 2. Add Status Indicators to Existing Components

Enhance any component that displays study status:

```javascript
import StatusIndicator, { CompactStatusIndicator } from '../shared/status/StatusIndicator';
import { useStatusSynchronization } from '../../../hooks/useStatusSynchronization';

const StudyCard = ({ study }) => {
    const { getCachedStatus, isConnected } = useStatusSynchronization({
        studyId: study.id
    });
    
    const realtimeStatus = getCachedStatus(study.id);
    
    return (
        <div className="study-card">
            <h3>{study.title}</h3>
            
            {/* Replace static status display */}
            <StatusIndicator
                status={realtimeStatus?.status || study.status}
                lastUpdated={realtimeStatus?.updatedAt || study.updatedAt}
                isRealTime={isConnected && !!realtimeStatus}
                connectionStatus="connected"
                showLastUpdated={true}
                size="md"
            />
            
            {/* Or use compact version for lists */}
            <CompactStatusIndicator
                status={realtimeStatus?.status || study.status}
                isRealTime={isConnected && !!realtimeStatus}
            />
        </div>
    );
};
```

### 3. Add Real-time Dashboard to Admin Pages

```javascript
import RealTimeStatusDashboard from '../shared/status/RealTimeStatusDashboard';

const AdminPage = () => {
    return (
        <div className="admin-page">
            <h1>System Monitoring</h1>
            
            {/* Add real-time status dashboard */}
            <RealTimeStatusDashboard
                studyId={null} // null for global monitoring
                enableGlobalUpdates={true}
                showConnectionStatus={true}
                showMetrics={true}
                showPendingUpdates={true}
                showErrors={true}
                autoRefresh={true}
                refreshInterval={30000}
            />
        </div>
    );
};
```

### 4. Configure WebSocket Connection

Update your main App component or routing component:

```javascript
import webSocketService from './services/WebSocketService';

const App = () => {
    useEffect(() => {
        // Auto-connect WebSocket when app starts
        const connectWebSocket = async () => {
            try {
                await webSocketService.connect();
                console.log('WebSocket connected successfully');
            } catch (error) {
                console.warn('WebSocket connection failed:', error);
                // App continues to work without real-time features
            }
        };
        
        // Only connect if user is authenticated
        const token = localStorage.getItem('authToken');
        if (token) {
            connectWebSocket();
        }
        
        // Cleanup on unmount
        return () => {
            webSocketService.disconnect();
        };
    }, []);
    
    return (
        <Router>
            {/* Your existing routes */}
        </Router>
    );
};
```

## Backend Integration Requirements

### 1. WebSocket Endpoint

Your backend needs to implement a WebSocket endpoint at `/ws/status-updates`:

```java
@ServerEndpoint("/ws/status-updates")
public class StatusUpdateWebSocket {
    
    @OnOpen
    public void onOpen(Session session) {
        // Handle client connection
    }
    
    @OnMessage
    public void onMessage(String message, Session session) {
        // Handle incoming messages (subscribe, authenticate, etc.)
    }
    
    @OnClose
    public void onClose(Session session) {
        // Handle client disconnection
    }
}
```

### 2. Status Update Broadcasting

When study status changes in your backend:

```java
@Service
public class StatusUpdateService {
    
    @Autowired
    private WebSocketSessionManager webSocketManager;
    
    public void broadcastStatusUpdate(Long studyId, String newStatus) {
        StatusUpdateMessage message = StatusUpdateMessage.builder()
            .type("status_update")
            .timestamp(Instant.now())
            .data(StatusUpdateData.builder()
                .studyId(studyId)
                .status(newStatus)
                .build())
            .build();
            
        webSocketManager.broadcast(message);
    }
}
```

### 3. Integration with Existing Services

Integrate with your existing status computation services:

```java
@Component
public class StudyStatusComputationService {
    
    @Autowired
    private StatusUpdateService statusUpdateService;
    
    public void computeAndUpdateStatus(Long studyId) {
        String newStatus = computeStatus(studyId);
        
        // Update database
        updateStudyStatus(studyId, newStatus);
        
        // Broadcast real-time update
        statusUpdateService.broadcastStatusUpdate(studyId, newStatus);
    }
}
```

## Testing the Integration

### 1. Verify WebSocket Connection

Open browser developer tools and check:

```javascript
// Console should show:
// "🔌 Connecting to WebSocket: ws://localhost:8083/ws/status-updates"
// "✅ WebSocket connected successfully"

// Check connection status
console.log(webSocketService.getConnectionStatus());
```

### 2. Test Status Updates

Manually trigger a status update from your backend and verify:

1. Update shows in browser console
2. UI components update automatically
3. Status indicators show real-time badge
4. Notifications appear for status changes

### 3. Test Connection Recovery

1. Stop your backend WebSocket server
2. Verify UI shows disconnected state
3. Restart server
4. Verify automatic reconnection

## Gradual Migration Strategy

### Phase 1: Add WebSocket Service (Non-breaking)

1. Add WebSocket service and hook
2. Don't replace existing components yet
3. Test connection and basic functionality

### Phase 2: Enhance Key Components

1. Replace StudyOverviewDashboard with enhanced version
2. Add status indicators to critical views
3. Monitor for any issues

### Phase 3: Full Migration

1. Replace all study list components
2. Add admin dashboard monitoring
3. Enable all real-time features

### Phase 4: Advanced Features

1. Add bulk operations with real-time feedback
2. Implement offline support
3. Add advanced filtering and analytics

## Troubleshooting

### Common Issues

**WebSocket Connection Fails:**
```javascript
// Check backend endpoint is running
// Verify CORS configuration
// Check authentication token

// Debug connection
webSocketService.connect().catch(error => {
    console.error('Connection failed:', error);
});
```

**Status Updates Not Received:**
```javascript
// Check subscription status
console.log(webSocketService.getConnectionStatus().subscribedTopics);

// Manually subscribe
webSocketService.subscribeToStudy(studyId);
```

**Memory Leaks:**
```javascript
// Ensure proper cleanup in useEffect
useEffect(() => {
    // Setup subscriptions
    return () => {
        // Cleanup subscriptions
        webSocketService.unsubscribeFromStudy(studyId);
    };
}, [studyId]);
```

### Performance Monitoring

```javascript
// Monitor connection health
const { getConnectionStats } = useStatusSynchronization();

console.log('Connection stats:', getConnectionStats());
// Output: { isConnected: true, cacheSize: 5, pendingUpdates: 0, ... }
```

## Environment Configuration

### Development

```env
REACT_APP_API_GATEWAY_HOST=localhost
REACT_APP_API_GATEWAY_PORT=8083
REACT_APP_WEBSOCKET_AUTO_CONNECT=true
REACT_APP_WEBSOCKET_RECONNECT_ATTEMPTS=5
```

### Production

```env
REACT_APP_API_GATEWAY_HOST=your-production-host
REACT_APP_API_GATEWAY_PORT=443
REACT_APP_WEBSOCKET_AUTO_CONNECT=true
REACT_APP_WEBSOCKET_RECONNECT_ATTEMPTS=10
```

## Next Steps

1. **Implement Backend WebSocket Endpoint**: Set up the WebSocket server
2. **Test Basic Connection**: Verify WebSocket connectivity
3. **Integrate Status Broadcasting**: Connect with existing status computation
4. **Deploy Enhanced Components**: Replace existing components gradually
5. **Monitor and Optimize**: Track performance and user experience

The enhanced frontend status synchronization system is now ready for integration with your existing ClinPrecision application!