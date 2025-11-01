// Public API exports for studydesign domain

// Export hooks first (includes EnhancedDashboardMetrics type)
export * from './hooks';

// Export UI components selectively to avoid naming conflicts
export { default as StudyDesignModule } from './ui/StudyDesignModule';
export { default as StudyViewPage } from './ui/StudyViewPage';
// Export component with alias to avoid conflict with type
export { default as EnhancedDashboardMetricsComponent } from './ui/EnhancedDashboardMetrics';

// Other exports
export * from './model';
export * from './services';
export * from './store';
export * from './utils';
export * from './constants';
