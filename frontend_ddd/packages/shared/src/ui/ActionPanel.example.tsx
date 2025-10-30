/**
 * ActionPanel Component Examples
 * 
 * Demonstrates usage patterns for the ActionPanel component across
 * various contexts in the ClinPrecision application.
 */

import React, { useState } from 'react';
import {
  ActionPanel,
  useActionPanel,
} from './ActionPanel';
import type { Action } from './ActionPanel';
import {
  Save,
  X,
  Send,
  Trash2,
  Download,
  Upload,
  Edit,
  Plus,
  Check,
  ArrowLeft,
  Settings,
  Eye,
  Lock,
  Unlock,
} from 'lucide-react';

const ActionPanelExamples: React.FC = () => {
  const [saveLoading, setSaveLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  // Simulate async action
  const handleAsyncAction = async (action: string, setLoading: (val: boolean) => void) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    console.log(`${action} completed`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ActionPanel Component</h1>
        <p className="text-gray-600">
          Reusable action button panel with multiple layouts and variants
        </p>
      </div>

      {/* ================================================================ */}
      {/* Example 1: Basic Horizontal Layout */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            1. Horizontal Layout (Default)
          </h2>
          <p className="text-sm text-gray-600">
            Standard action panel for forms and dialogs
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-white space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Right Aligned (Default)</h3>
            <ActionPanel
              actions={[
                { id: 'cancel', label: 'Cancel', onClick: () => console.log('Cancel'), variant: 'secondary' },
                { id: 'save', label: 'Save', onClick: () => console.log('Save'), variant: 'primary', icon: Save },
              ]}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Left Aligned</h3>
            <ActionPanel
              align="left"
              actions={[
                { id: 'back', label: 'Back', onClick: () => console.log('Back'), icon: ArrowLeft },
                { id: 'next', label: 'Next', onClick: () => console.log('Next'), variant: 'primary' },
              ]}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Center Aligned</h3>
            <ActionPanel
              align="center"
              actions={[
                { id: 'discard', label: 'Discard', onClick: () => console.log('Discard'), variant: 'danger', icon: Trash2 },
                { id: 'save-draft', label: 'Save Draft', onClick: () => console.log('Draft') },
                { id: 'publish', label: 'Publish', onClick: () => console.log('Publish'), variant: 'primary', icon: Send },
              ]}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">With Icons</h3>
            <ActionPanel
              actions={[
                { id: 'download', label: 'Download', onClick: () => console.log('Download'), icon: Download },
                { id: 'upload', label: 'Upload', onClick: () => console.log('Upload'), icon: Upload },
                { id: 'edit', label: 'Edit', onClick: () => console.log('Edit'), variant: 'primary', icon: Edit },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Example 2: Split Layout */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            2. Split Layout (Primary Right, Secondary Left)
          </h2>
          <p className="text-sm text-gray-600">
            Ideal for page headers and toolbars with primary and secondary actions
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-white space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Study Management</h3>
            <ActionPanel
              layout="split"
              primaryActions={[
                { 
                  id: 'publish',
                  label: 'Publish Study', 
                  onClick: () => handleAsyncAction('Publish', setPublishLoading), 
                  variant: 'primary',
                  icon: Send,
                  loading: publishLoading,
                },
              ]}
              secondaryActions={[
                { id: 'settings', label: 'Settings', onClick: () => console.log('Settings'), icon: Settings },
                { id: 'export', label: 'Export', onClick: () => console.log('Export'), icon: Download },
              ]}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Form Actions</h3>
            <ActionPanel
              layout="split"
              primaryActions={[
                { 
                  id: 'save',
                  label: 'Save Changes', 
                  onClick: () => handleAsyncAction('Save', setSaveLoading), 
                  variant: 'primary',
                  icon: Check,
                  loading: saveLoading,
                },
              ]}
              secondaryActions={[
                { id: 'cancel', label: 'Cancel', onClick: () => console.log('Cancel') },
                { id: 'delete', label: 'Delete', onClick: () => console.log('Delete'), variant: 'danger', icon: Trash2 },
              ]}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Protocol Version Management</h3>
            <ActionPanel
              layout="split"
              primaryActions={[
                { id: 'approve', label: 'Approve', onClick: () => console.log('Approve'), variant: 'success', icon: Check },
                { id: 'create', label: 'Create Version', onClick: () => console.log('Create'), variant: 'primary', icon: Plus },
              ]}
              secondaryActions={[
                { id: 'back', label: 'Back', onClick: () => console.log('Back'), icon: ArrowLeft },
                { id: 'preview', label: 'Preview', onClick: () => console.log('Preview'), icon: Eye },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Example 3: Vertical Layout */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            3. Vertical Layout
          </h2>
          <p className="text-sm text-gray-600">
            Useful for sidebars and mobile-first designs
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-white">
          <div className="max-w-xs">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Sidebar Actions</h3>
            <ActionPanel
              layout="vertical"
              align="stretch"
              actions={[
                { id: 'new', label: 'New Study', onClick: () => console.log('New'), variant: 'primary', icon: Plus },
                { id: 'import', label: 'Import', onClick: () => console.log('Import'), icon: Upload },
                { id: 'export', label: 'Export All', onClick: () => console.log('Export'), icon: Download },
                { id: 'settings', label: 'Settings', onClick: () => console.log('Settings'), icon: Settings },
              ]}
              size="md"
            />
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Example 4: Button Variants */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            4. Button Variants
          </h2>
          <p className="text-sm text-gray-600">
            All available button styles
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-white space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">All Variants</h3>
            <ActionPanel
              align="left"
              actions={[
                { id: 'primary', label: 'Primary', onClick: () => {}, variant: 'primary' },
                { id: 'secondary', label: 'Secondary', onClick: () => {}, variant: 'secondary' },
                { id: 'success', label: 'Success', onClick: () => {}, variant: 'success' },
                { id: 'danger', label: 'Danger', onClick: () => {}, variant: 'danger' },
                { id: 'ghost', label: 'Ghost', onClick: () => {}, variant: 'ghost' },
                { id: 'outline', label: 'Outline', onClick: () => {}, variant: 'outline' },
              ]}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Variants with Icons</h3>
            <ActionPanel
              align="left"
              actions={[
                { id: 'save', label: 'Save', onClick: () => {}, variant: 'primary', icon: Save },
                { id: 'cancel', label: 'Cancel', onClick: () => {}, variant: 'secondary', icon: X },
                { id: 'approve', label: 'Approve', onClick: () => {}, variant: 'success', icon: Check },
                { id: 'delete', label: 'Delete', onClick: () => {}, variant: 'danger', icon: Trash2 },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Example 5: Button Sizes */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            5. Button Sizes
          </h2>
          <p className="text-sm text-gray-600">
            Small, medium, and large button sizes
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-white space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Small (sm)</h3>
            <ActionPanel
              size="sm"
              actions={[
                { id: 'cancel', label: 'Cancel', onClick: () => {} },
                { id: 'save', label: 'Save', onClick: () => {}, variant: 'primary', icon: Save },
              ]}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Medium (md) - Default</h3>
            <ActionPanel
              size="md"
              actions={[
                { id: 'cancel', label: 'Cancel', onClick: () => {} },
                { id: 'save', label: 'Save', onClick: () => {}, variant: 'primary', icon: Save },
              ]}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Large (lg)</h3>
            <ActionPanel
              size="lg"
              actions={[
                { id: 'cancel', label: 'Cancel', onClick: () => {} },
                { id: 'save', label: 'Save', onClick: () => {}, variant: 'primary', icon: Save },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Example 6: Loading States */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            6. Loading States
          </h2>
          <p className="text-sm text-gray-600">
            Handling asynchronous actions with loading indicators
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-white space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Panel-Wide Loading</h3>
            <ActionPanel
              actions={[
                { id: 'cancel', label: 'Cancel', onClick: () => {} },
                { id: 'save', label: 'Save', onClick: () => {}, variant: 'primary' },
              ]}
              loading={saveLoading}
              loadingText="Saving changes..."
            />
            <button
              onClick={() => handleAsyncAction('Panel save', setSaveLoading)}
              className="mt-3 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Trigger Panel Loading
            </button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Individual Action Loading</h3>
            <ActionPanel
              actions={[
                { id: 'cancel', label: 'Cancel', onClick: () => {} },
                { 
                  id: 'publish',
                  label: 'Publish', 
                  onClick: () => handleAsyncAction('Publish', setPublishLoading), 
                  variant: 'primary',
                  loading: publishLoading,
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Example 7: Disabled States */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            7. Disabled States
          </h2>
          <p className="text-sm text-gray-600">
            Conditional enabling/disabling of actions
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-white space-y-4">
          <ActionPanel
            actions={[
              { id: 'lock', label: 'Lock', onClick: () => {}, icon: Lock },
              { id: 'unlock', label: 'Unlock', onClick: () => {}, icon: Unlock, disabled: true },
              { id: 'save', label: 'Save', onClick: () => {}, variant: 'primary', icon: Save, disabled: true },
            ]}
          />
        </div>
      </section>

      {/* ================================================================ */}
      {/* Example 8: useActionPanel Hook */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            8. useActionPanel Hook
          </h2>
          <p className="text-sm text-gray-600">
            Manage action panel state with custom hook
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-white">
          <ActionPanelHookExample />
        </div>
      </section>

      {/* ================================================================ */}
      {/* Example 9: Real-World Usage */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            9. Real-World Usage Examples
          </h2>
          <p className="text-sm text-gray-600">
            How ActionPanel appears in actual application contexts
          </p>
        </div>

        <div className="space-y-6">
          {/* Dialog Footer */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Create New Study</h3>
              <p className="text-sm text-gray-600 mb-4">Enter study details below...</p>
              {/* Form fields would go here */}
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t">
              <ActionPanel
                actions={[
                  { id: 'cancel', label: 'Cancel', onClick: () => console.log('Cancel') },
                  { id: 'create', label: 'Create Study', onClick: () => console.log('Create'), variant: 'primary', icon: Plus },
                ]}
              />
            </div>
          </div>

          {/* Page Header */}
          <div className="border rounded-lg bg-white p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Study ONCOLOGY-2024-001</h3>
              <p className="text-sm text-gray-600">Phase III Clinical Trial</p>
            </div>
            <ActionPanel
              layout="split"
              primaryActions={[
                { id: 'publish', label: 'Publish', onClick: () => console.log('Publish'), variant: 'primary', icon: Send },
              ]}
              secondaryActions={[
                { id: 'edit', label: 'Edit', onClick: () => console.log('Edit'), icon: Edit },
                { id: 'export', label: 'Export', onClick: () => console.log('Export'), icon: Download },
                { id: 'settings', label: 'Settings', onClick: () => console.log('Settings'), icon: Settings },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// Hook Example Component
// ============================================================================

const ActionPanelHookExample: React.FC = () => {
  const { actions, setActionLoading, hideAction, showAction } = useActionPanel([
    { id: 'save', label: 'Save', onClick: async () => {
      setActionLoading('save', true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setActionLoading('save', false);
      console.log('Saved with hook!');
    }, variant: 'primary', icon: Save },
    { id: 'delete', label: 'Delete', onClick: () => console.log('Delete'), variant: 'danger', icon: Trash2 },
  ]);

  return (
    <div className="space-y-4">
      <ActionPanel actions={actions} />
      
      <div className="flex gap-2">
        <button
          onClick={() => hideAction('delete')}
          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          Hide Delete
        </button>
        <button
          onClick={() => showAction('delete')}
          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          Show Delete
        </button>
      </div>
    </div>
  );
};

export default ActionPanelExamples;
