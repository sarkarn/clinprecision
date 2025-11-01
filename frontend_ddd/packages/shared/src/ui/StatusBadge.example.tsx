/**
 * StatusBadge Component Examples
 * 
 * Demonstrates usage patterns for the StatusBadge component across
 * all status types used in the ClinPrecision application.
 * 
 * Run this in a dev environment to see all badge variations.
 */

import React from 'react';
import {
  StatusBadge,
  EntityStatusBadge,
  PatientStatusBadge,
  FormStatusBadge,
  VisitTypeBadge,
} from './StatusBadge';
import type { EntityStatus } from '@shared/types/common.types';
import { PatientStatus, FormStatus } from '@shared/types/status.types';
import type { VisitType } from '@shared/types/visit.types';

const StatusBadgeExamples: React.FC = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">StatusBadge Component</h1>
        <p className="text-gray-600">
          Generic, type-safe status badge supporting all entity types
        </p>
      </div>

      {/* ================================================================ */}
      {/* Example 1: EntityStatus - Study/Site/Protocol Statuses */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            1. Entity Status Badges (Study, Site, Protocol)
          </h2>
          <p className="text-sm text-gray-600">
            Used for study, site, protocol, and form definition statuses
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Default Variant</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="DRAFT" />
              <StatusBadge status="ACTIVE" />
              <StatusBadge status="INACTIVE" />
              <StatusBadge status="APPROVED" />
              <StatusBadge status="PUBLISHED" />
              <StatusBadge status="ARCHIVED" />
              <StatusBadge status="UNDER_REVIEW" />
              <StatusBadge status="REJECTED" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">With Icons</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="DRAFT" showIcon />
              <StatusBadge status="ACTIVE" showIcon />
              <StatusBadge status="APPROVED" showIcon />
              <StatusBadge status="UNDER_REVIEW" showIcon />
              <StatusBadge status="REJECTED" showIcon />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Outline Variant</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="DRAFT" variant="outline" />
              <StatusBadge status="ACTIVE" variant="outline" showIcon />
              <StatusBadge status="APPROVED" variant="outline" showIcon />
              <StatusBadge status="REJECTED" variant="outline" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Dot Variant (Compact)</h3>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="DRAFT" variant="dot" />
              <StatusBadge status="ACTIVE" variant="dot" />
              <StatusBadge status="APPROVED" variant="dot" />
              <StatusBadge status="REJECTED" variant="dot" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Sizes (sm, md, lg)</h3>
            <div className="flex items-center flex-wrap gap-2">
              <StatusBadge status="ACTIVE" size="sm" showIcon />
              <StatusBadge status="ACTIVE" size="md" showIcon />
              <StatusBadge status="ACTIVE" size="lg" showIcon />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Type-Safe Convenience Component</h3>
            <div className="flex flex-wrap gap-2">
              <EntityStatusBadge status="DRAFT" />
              <EntityStatusBadge status="ACTIVE" showIcon />
              <EntityStatusBadge status="APPROVED" showIcon />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Example 2: PatientStatus - Subject Workflow */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            2. Patient Status Badges (Subject Management)
          </h2>
          <p className="text-sm text-gray-600">
            Used for subject enrollment and workflow statuses
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">All Patient Statuses</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="SCREENING" />
              <StatusBadge status="ENROLLED" />
              <StatusBadge status="ACTIVE" />
              <StatusBadge status="COMPLETED" />
              <StatusBadge status="WITHDRAWN" />
              <StatusBadge status="DISCONTINUED" />
              <StatusBadge status="SCREEN_FAILED" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">With Icons</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="SCREENING" showIcon />
              <StatusBadge status="ENROLLED" showIcon />
              <StatusBadge status="COMPLETED" showIcon />
              <StatusBadge status="WITHDRAWN" showIcon />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Dot Variant for Lists</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32">Subject 001</span>
                <StatusBadge status="SCREENING" variant="dot" size="sm" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32">Subject 002</span>
                <StatusBadge status="ENROLLED" variant="dot" size="sm" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32">Subject 003</span>
                <StatusBadge status="COMPLETED" variant="dot" size="sm" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Type-Safe Convenience Component</h3>
            <div className="flex flex-wrap gap-2">
              <PatientStatusBadge status={PatientStatus.SCREENING} showIcon />
              <PatientStatusBadge status={PatientStatus.ENROLLED} showIcon />
              <PatientStatusBadge status={PatientStatus.COMPLETED} showIcon />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Example 3: FormStatus - CRF Instance Workflow */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            3. Form Status Badges (CRF Instances)
          </h2>
          <p className="text-sm text-gray-600">
            Used for CRF instance workflow statuses
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">All Form Statuses</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="NOT_STARTED" />
              <StatusBadge status="IN_PROGRESS" />
              <StatusBadge status="COMPLETED" />
              <StatusBadge status="VERIFIED" />
              <StatusBadge status="LOCKED" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">With Icons</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="NOT_STARTED" showIcon />
              <StatusBadge status="IN_PROGRESS" showIcon />
              <StatusBadge status="VERIFIED" showIcon />
              <StatusBadge status="LOCKED" showIcon />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Type-Safe Convenience Component</h3>
            <div className="flex flex-wrap gap-2">
              <FormStatusBadge status={FormStatus.NOT_STARTED} />
              <FormStatusBadge status={FormStatus.IN_PROGRESS} showIcon />
              <FormStatusBadge status={FormStatus.VERIFIED} showIcon />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Example 4: VisitType - Visit Classifications */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            4. Visit Type Badges
          </h2>
          <p className="text-sm text-gray-600">
            Used for visit classifications and timeline display
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">All Visit Types</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="SCREENING" />
              <StatusBadge status="ENROLLMENT" />
              <StatusBadge status="SCHEDULED" />
              <StatusBadge status="UNSCHEDULED" />
              <StatusBadge status="ADVERSE_EVENT" />
              <StatusBadge status="EARLY_TERMINATION" />
              <StatusBadge status="FOLLOW_UP" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">With Icons</h3>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="ENROLLMENT" showIcon />
              <StatusBadge status="SCHEDULED" showIcon />
              <StatusBadge status="ADVERSE_EVENT" showIcon />
              <StatusBadge status="FOLLOW_UP" showIcon />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Type-Safe Convenience Component</h3>
            <div className="flex flex-wrap gap-2">
              <VisitTypeBadge status="SCREENING" showIcon />
              <VisitTypeBadge status="ENROLLMENT" showIcon />
              <VisitTypeBadge status="SCHEDULED" showIcon />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Example 5: Real-World Usage in Lists/Tables */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            5. Real-World Usage Examples
          </h2>
          <p className="text-sm text-gray-600">
            How StatusBadge appears in actual application contexts
          </p>
        </div>

        <div className="space-y-4">
          {/* Table Header Example */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">In Tables</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Study Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phase
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">ONCOLOGY-2024-001</td>
                    <td className="px-6 py-4">
                      <StatusBadge status="ACTIVE" showIcon />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">Phase III</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">CARDIO-2024-002</td>
                    <td className="px-6 py-4">
                      <StatusBadge status="UNDER_REVIEW" showIcon />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">Phase II</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">NEURO-2023-015</td>
                    <td className="px-6 py-4">
                      <StatusBadge status="COMPLETED" showIcon />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">Phase III</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card Header Example */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">In Card Headers</h3>
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">ONCOLOGY-2024-001</h4>
                <StatusBadge status="ACTIVE" size="lg" showIcon />
              </div>
              <p className="text-sm text-gray-600">
                Phase III Oncology Trial - 240 subjects enrolled
              </p>
            </div>
          </div>

          {/* Compact List Example */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">In Compact Lists (Dot Variant)</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span className="text-sm text-gray-900">Subject 001 - John Doe</span>
                <StatusBadge status="SCREENING" variant="dot" size="sm" />
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span className="text-sm text-gray-900">Subject 002 - Jane Smith</span>
                <StatusBadge status="ENROLLED" variant="dot" size="sm" />
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span className="text-sm text-gray-900">Subject 003 - Bob Johnson</span>
                <StatusBadge status="COMPLETED" variant="dot" size="sm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Example 6: Custom Labels */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            6. Custom Labels
          </h2>
          <p className="text-sm text-gray-600">
            Override default status text with custom labels
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status="ACTIVE" label="Live" showIcon />
          <StatusBadge status="INACTIVE" label="Paused" />
          <StatusBadge status="COMPLETED" label="Finished" showIcon />
          <StatusBadge status="UNDER_REVIEW" label="Pending Approval" showIcon />
        </div>
      </section>

      {/* ================================================================ */}
      {/* Example 7: Migration from Old Pattern */}
      {/* ================================================================ */}
      <section className="space-y-4 bg-blue-50 p-6 rounded-lg">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            7. Migration Guide: Before & After
          </h2>
          <p className="text-sm text-gray-600">
            Replacing inline badge implementations with StatusBadge
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">❌ Old Pattern (Inline)</h3>
            <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// Hard-coded classes, no type safety
<span className="inline-flex items-center px-2.5 py-1 rounded-full 
               text-sm font-medium bg-green-100 text-green-800">
  Active
</span>`}
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">✅ New Pattern (StatusBadge)</h3>
            <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// Type-safe, consistent, maintainable
<StatusBadge status="ACTIVE" showIcon />

// Or with type-specific convenience component
<EntityStatusBadge status={EntityStatus.ACTIVE} showIcon />`}
            </pre>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div>
              <p className="text-xs text-gray-600 mb-1">Old:</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="text-2xl text-gray-400">→</div>
            <div>
              <p className="text-xs text-gray-600 mb-1">New:</p>
              <StatusBadge status="ACTIVE" showIcon />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StatusBadgeExamples;
