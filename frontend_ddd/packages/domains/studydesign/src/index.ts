// Public API exports for studydesign domain

// Export UI components (resolve naming conflict with hooks)
export * from './ui';

// Export hooks (note: EnhancedDashboardMetrics type from hooks will be available)
export * from './hooks';

// Other exports
export * from './model';
export * from './services';
export * from './store';
export * from './utils';
export * from './constants';

// Re-export component with explicit name to avoid conflict
export { default as EnhancedDashboardMetricsComponent } from './ui/EnhancedDashboardMetrics';
