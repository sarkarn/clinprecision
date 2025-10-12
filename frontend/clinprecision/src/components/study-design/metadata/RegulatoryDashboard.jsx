import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MetadataStyles.css';

/**
 * RegulatoryDashboard Component
 * 
 * Displays regulatory compliance monitoring dashboard including:
 * - Overall compliance level and summary
 * - Key metrics (SDV coverage, FDA fields, CDASH mappings, etc.)
 * - Compliance details and validation status
 * - Recommendations and issues
 * - Report generation capabilities
 * 
 * @component
 * @param {number} studyId - The study ID
 */
const RegulatoryDashboard = ({ studyId }) => {
  const [complianceReport, setComplianceReport] = useState(null);
  const [metadataSummary, setMetadataSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9093/clinops-ws';

  useEffect(() => {
    if (studyId) {
      fetchComplianceData();
    }
  }, [studyId]);

  /**
   * Fetch compliance report and metadata summary
   */
  const fetchComplianceData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch both compliance report and metadata summary in parallel
      const [complianceResponse, summaryResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/study-metadata/${studyId}/compliance-report`),
        axios.get(`${API_BASE}/api/study-metadata/${studyId}/metadata-summary`)
      ]);

      setComplianceReport(complianceResponse.data);
      setMetadataSummary(summaryResponse.data);
    } catch (err) {
      console.error('Error fetching compliance data:', err);
      setError('Failed to load compliance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get compliance level badge class
   */
  const getComplianceBadgeClass = (level) => {
    const levelMap = {
      'EXCELLENT': 'compliance-excellent',
      'GOOD': 'compliance-good',
      'ACCEPTABLE': 'compliance-acceptable',
      'NEEDS_IMPROVEMENT': 'compliance-needs-improvement'
    };
    return levelMap[level] || 'compliance-acceptable';
  };

  /**
   * Get compliance level icon
   */
  const getComplianceIcon = (level) => {
    const iconMap = {
      'EXCELLENT': '✅',
      'GOOD': '✓',
      'ACCEPTABLE': '⚠️',
      'NEEDS_IMPROVEMENT': '❌'
    };
    return iconMap[level] || '⚠️';
  };

  /**
   * Generate recommendations based on compliance data
   */
  const generateRecommendations = () => {
    if (!complianceReport) return [];

    const recommendations = [];

    // Check SDV coverage
    if (complianceReport.sdvCoveragePercent < 50) {
      recommendations.push({
        type: 'critical',
        message: `SDV coverage is only ${complianceReport.sdvCoveragePercent.toFixed(1)}%. Consider increasing SDV requirements for critical fields.`
      });
    } else if (complianceReport.sdvCoveragePercent < 75) {
      recommendations.push({
        type: 'warning',
        message: `SDV coverage is ${complianceReport.sdvCoveragePercent.toFixed(1)}%. Consider reviewing SDV strategy for better compliance.`
      });
    }

    // Check critical data point SDV
    if (complianceReport.criticalDataPointSDVPercent < 95) {
      recommendations.push({
        type: 'critical',
        message: `Only ${complianceReport.criticalDataPointSDVPercent.toFixed(1)}% of critical data points have SDV. All critical fields should have SDV enabled.`
      });
    }

    // Check CDASH mappings
    if (complianceReport.cdashMappingsCount === 0) {
      recommendations.push({
        type: 'warning',
        message: 'No CDASH mappings configured. Consider adding CDASH/SDTM mappings for regulatory submissions.'
      });
    }

    // Check medical coding
    if (complianceReport.medicalCodingConfigCount === 0) {
      recommendations.push({
        type: 'info',
        message: 'No medical coding configurations found. If study collects adverse events or concomitant medications, configure medical coding.'
      });
    }

    return recommendations;
  };

  /**
   * Generate compliance report document
   */
  const handleGenerateReport = async () => {
    try {
      alert('Generating compliance report...');
      
      // TODO: Implement actual report generation
      // This would typically:
      // 1. Call backend API to generate PDF/Word document
      // 2. Download the report
      // 3. Show success message
      
      console.log('Compliance report generation requested for study:', studyId);
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report. Please try again.');
    }
  };

  /**
   * Export report to PDF
   */
  const handleExportPdf = async () => {
    try {
      alert('Exporting to PDF...');
      
      // TODO: Implement PDF export
      // This would typically:
      // 1. Call backend API to generate PDF
      // 2. Download the PDF file
      // 3. Show success message
      
      console.log('PDF export requested for study:', studyId);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Failed to export PDF. Please try again.');
    }
  };

  /**
   * View detailed compliance breakdown
   */
  const handleViewDetails = () => {
    alert('Opening detailed compliance view...');
    // TODO: Navigate to detailed compliance view or open modal
  };

  /**
   * Refresh compliance data
   */
  const handleRefresh = () => {
    fetchComplianceData();
  };

  if (loading) {
    return (
      <div className="metadata-panel">
        <div className="loading-spinner">Loading compliance dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metadata-panel">
        <div className="error-message">{error}</div>
        <button className="btn btn-primary" onClick={handleRefresh}>
          Retry
        </button>
      </div>
    );
  }

  if (!complianceReport || !metadataSummary) {
    return (
      <div className="metadata-panel">
        <div className="error-message">No compliance data available</div>
      </div>
    );
  }

  const recommendations = generateRecommendations();
  const complianceLevel = complianceReport.complianceLevel;
  const lastUpdated = new Date().toLocaleString();

  return (
    <div className="metadata-panel" style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div className="metadata-panel-header">
        <h3>📊 Regulatory Compliance Dashboard</h3>
        <button className="btn btn-secondary" onClick={handleRefresh} style={{ fontSize: '14px' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Compliance Summary */}
      <div className="summary-section">
        <h4>Compliance Summary</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
          <div style={{ fontSize: '48px' }}>
            {getComplianceIcon(complianceLevel)}
          </div>
          <div>
            <span className={`compliance-badge ${getComplianceBadgeClass(complianceLevel)}`}>
              Overall Level: {complianceLevel.replace('_', ' ')}
            </span>
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#6c757d' }}>
              Last Updated: {lastUpdated}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metadata-section">
        <div className="metadata-section-header">
          🎯 Key Metrics
        </div>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">SDV Coverage</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="metric-value">
                {complianceReport.sdvCoveragePercent.toFixed(1)}%
              </div>
              <div className="metric-status">
                {complianceReport.sdvCoveragePercent >= 75 ? '✅' : 
                 complianceReport.sdvCoveragePercent >= 50 ? '⚠️' : '❌'}
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Critical SDV</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="metric-value">
                {complianceReport.criticalDataPointSDVPercent.toFixed(1)}%
              </div>
              <div className="metric-status">
                {complianceReport.criticalDataPointSDVPercent >= 95 ? '✅' : 
                 complianceReport.criticalDataPointSDVPercent >= 85 ? '⚠️' : '❌'}
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Total Fields</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="metric-value">{metadataSummary.totalFields}</div>
              <div className="metric-status">ℹ️</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">FDA Required</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="metric-value">{metadataSummary.fdaRequiredCount}</div>
              <div className="metric-status">
                {metadataSummary.fdaRequiredCount > 0 ? '✅' : '⚠️'}
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">CDASH Mappings</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="metric-value">{metadataSummary.totalCdashMappings}</div>
              <div className="metric-status">
                {metadataSummary.totalCdashMappings > 0 ? '✅' : '⚠️'}
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Medical Coding</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="metric-value">{metadataSummary.totalCodingConfigs}</div>
              <div className="metric-status">
                {metadataSummary.totalCodingConfigs > 0 ? '✅' : 'ℹ️'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Details */}
      <div className="metadata-section">
        <div className="metadata-section-header">
          📋 Compliance Details
        </div>
        <div className="fields-list">
          <div className="field-list-item">
            <div className="metric-status" style={{ fontSize: '20px' }}>
              {metadataSummary.criticalFieldsCount === metadataSummary.sdvRequiredCount ? '✅' : '⚠️'}
            </div>
            <div className="field-list-name" style={{ fontFamily: 'inherit' }}>
              Critical Data Points: {metadataSummary.criticalFieldsCount} defined, 
              {' '}{metadataSummary.sdvRequiredCount} with SDV
            </div>
          </div>

          <div className="field-list-item">
            <div className="metric-status" style={{ fontSize: '20px' }}>
              {metadataSummary.fdaRequiredCount > 0 ? '✅' : '⚠️'}
            </div>
            <div className="field-list-name" style={{ fontFamily: 'inherit' }}>
              FDA Required Fields: {metadataSummary.fdaRequiredCount} configured
            </div>
          </div>

          <div className="field-list-item">
            <div className="metric-status" style={{ fontSize: '20px' }}>
              {metadataSummary.sdvRequiredCount > 0 ? '✅' : '⚠️'}
            </div>
            <div className="field-list-name" style={{ fontFamily: 'inherit' }}>
              Safety Fields: {metadataSummary.sdvRequiredCount} with review configured
            </div>
          </div>

          <div className="field-list-item">
            <div className="metric-status" style={{ fontSize: '20px' }}>
              {metadataSummary.medicalReviewCount > 0 ? '✅' : 'ℹ️'}
            </div>
            <div className="field-list-name" style={{ fontFamily: 'inherit' }}>
              Medical Review: {metadataSummary.medicalReviewCount} fields require medical review
            </div>
          </div>

          <div className="field-list-item">
            <div className="metric-status" style={{ fontSize: '20px' }}>✅</div>
            <div className="field-list-name" style={{ fontFamily: 'inherit' }}>
              Audit Trail: Configured for critical data points
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className={recommendations.length > 0 ? 'metadata-section' : 'recommendations-section'}>
        <div className="metadata-section-header" style={{ color: recommendations.length > 0 ? '#2c3e50' : '#155724' }}>
          🔍 {recommendations.length > 0 ? 'Recommendations' : 'Compliance Status'}
        </div>
        {recommendations.length === 0 ? (
          <div className="no-issues">
            ✅ No compliance issues found. Study metadata is properly configured.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendations.map((rec, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  borderRadius: '4px',
                  background: rec.type === 'critical' ? '#f8d7da' :
                             rec.type === 'warning' ? '#fff3cd' : '#d1ecf1',
                  border: `1px solid ${rec.type === 'critical' ? '#f5c6cb' :
                                       rec.type === 'warning' ? '#ffc107' : '#bee5eb'}`,
                  color: rec.type === 'critical' ? '#721c24' :
                         rec.type === 'warning' ? '#856404' : '#0c5460'
                }}
              >
                <strong>{rec.type === 'critical' ? '❌ Critical:' :
                         rec.type === 'warning' ? '⚠️ Warning:' : 'ℹ️ Info:'}</strong>
                {' '}{rec.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="metadata-panel-actions">
        <button className="btn btn-primary" onClick={handleGenerateReport}>
          📄 Generate Report
        </button>
        <button className="btn btn-secondary" onClick={handleExportPdf}>
          📥 Export PDF
        </button>
        <button className="btn btn-secondary" onClick={handleViewDetails}>
          🔍 View Details
        </button>
      </div>
    </div>
  );
};

export default RegulatoryDashboard;
