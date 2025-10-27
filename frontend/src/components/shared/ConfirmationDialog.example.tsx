/**
 * ConfirmationDialog Usage Examples
 * 
 * This file demonstrates various use cases for the ConfirmationDialog component
 * with different severity levels and configurations.
 */

import React from 'react';
import { ConfirmationDialog, useConfirmationDialog } from './ConfirmationDialog';

// ============================================================================
// Example 1: Delete Confirmation (Error Severity)
// ============================================================================
export const DeleteStudyExample: React.FC = () => {
  const deleteDialog = useConfirmationDialog();

  const handleDelete = async () => {
    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Study deleted successfully');
      deleteDialog.closeDialog();
    } catch (error) {
      deleteDialog.setError('Failed to delete study. Please try again.');
    }
  };

  return (
    <>
      <button
        onClick={deleteDialog.openDialog}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Delete Study
      </button>

      <ConfirmationDialog
        open={deleteDialog.open}
        loading={deleteDialog.loading}
        error={deleteDialog.error}
        title="Delete Study"
        message="Are you sure you want to delete this study? This action cannot be undone and will permanently remove all associated data."
        severity="error"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteDialog.executeAction(handleDelete)}
        onCancel={deleteDialog.closeDialog}
      />
    </>
  );
};

// ============================================================================
// Example 2: Approval Confirmation (Success Severity)
// ============================================================================
export const ApproveProtocolExample: React.FC = () => {
  const approvalDialog = useConfirmationDialog();

  const handleApprove = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Protocol approved successfully');
      approvalDialog.closeDialog();
    } catch (error) {
      approvalDialog.setError('Failed to approve protocol.');
    }
  };

  return (
    <>
      <button
        onClick={approvalDialog.openDialog}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Approve Protocol
      </button>

      <ConfirmationDialog
        open={approvalDialog.open}
        loading={approvalDialog.loading}
        error={approvalDialog.error}
        title="Approve Protocol"
        message="By approving this protocol, you confirm that you have reviewed all changes and they meet regulatory requirements."
        severity="success"
        confirmText="Approve"
        cancelText="Cancel"
        onConfirm={() => approvalDialog.executeAction(handleApprove)}
        onCancel={approvalDialog.closeDialog}
        maxWidth="md"
      />
    </>
  );
};

// ============================================================================
// Example 3: Warning Dialog with Additional Content
// ============================================================================
export const PublishStudyExample: React.FC = () => {
  const publishDialog = useConfirmationDialog();
  const [acknowledged, setAcknowledged] = React.useState(false);

  const handlePublish = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Study published successfully');
      publishDialog.closeDialog();
      setAcknowledged(false);
    } catch (error) {
      publishDialog.setError('Failed to publish study.');
    }
  };

  return (
    <>
      <button
        onClick={publishDialog.openDialog}
        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
      >
        Publish Study
      </button>

      <ConfirmationDialog
        open={publishDialog.open}
        loading={publishDialog.loading}
        error={publishDialog.error}
        title="Publish Study"
        message="Publishing will make this study visible to all enrolled sites. Ensure all configurations are final."
        severity="warning"
        confirmText="Publish"
        cancelText="Cancel"
        onConfirm={() => publishDialog.executeAction(handlePublish)}
        onCancel={() => {
          publishDialog.closeDialog();
          setAcknowledged(false);
        }}
        confirmDisabled={!acknowledged}
        maxWidth="lg"
      >
        <div className="mt-4 space-y-3">
          <div className="bg-yellow-50 p-4 rounded-md">
            <h4 className="font-semibold text-yellow-900 mb-2">Pre-publish Checklist:</h4>
            <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
              <li>All required forms are complete</li>
              <li>Site assignments are finalized</li>
              <li>Ethics approvals are uploaded</li>
              <li>Study timeline is confirmed</li>
            </ul>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            />
            <span className="text-sm text-gray-700">
              I confirm that all pre-publish requirements have been met
            </span>
          </label>
        </div>
      </ConfirmationDialog>
    </>
  );
};

// ============================================================================
// Example 4: Info Dialog (Simple Confirmation)
// ============================================================================
export const ExportDataExample: React.FC = () => {
  const exportDialog = useConfirmationDialog();

  const handleExport = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Data exported successfully');
      exportDialog.closeDialog();
    } catch (error) {
      exportDialog.setError('Export failed. Please try again.');
    }
  };

  return (
    <>
      <button
        onClick={exportDialog.openDialog}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Export Data
      </button>

      <ConfirmationDialog
        open={exportDialog.open}
        loading={exportDialog.loading}
        error={exportDialog.error}
        title="Export Study Data"
        message="This will generate a CSV export of all study data. The file will be downloaded to your device."
        severity="info"
        confirmText="Export"
        cancelText="Cancel"
        onConfirm={() => exportDialog.executeAction(handleExport)}
        onCancel={exportDialog.closeDialog}
        showCloseButton={true}
      />
    </>
  );
};

// ============================================================================
// Example 5: Synchronous Confirmation (No Loading State)
// ============================================================================
export const DiscardChangesExample: React.FC = () => {
  const discardDialog = useConfirmationDialog();

  const handleDiscard = () => {
    console.log('Changes discarded');
    // Navigate away or reset form
    discardDialog.closeDialog();
  };

  return (
    <>
      <button
        onClick={discardDialog.openDialog}
        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
      >
        Discard Changes
      </button>

      <ConfirmationDialog
        open={discardDialog.open}
        loading={false}
        title="Discard Changes"
        message="You have unsaved changes. Are you sure you want to discard them?"
        severity="warning"
        confirmText="Discard"
        cancelText="Keep Editing"
        onConfirm={handleDiscard}
        onCancel={discardDialog.closeDialog}
        maxWidth="sm"
      />
    </>
  );
};

// ============================================================================
// Example 6: Custom Backdrop/Escape Behavior
// ============================================================================
export const CriticalActionExample: React.FC = () => {
  const criticalDialog = useConfirmationDialog();

  const handleCriticalAction = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Critical action completed');
      criticalDialog.closeDialog();
    } catch (error) {
      criticalDialog.setError('Critical action failed.');
    }
  };

  return (
    <>
      <button
        onClick={criticalDialog.openDialog}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Execute Critical Action
      </button>

      <ConfirmationDialog
        open={criticalDialog.open}
        loading={criticalDialog.loading}
        error={criticalDialog.error}
        title="Critical Action Required"
        message="This action requires explicit confirmation. You cannot dismiss this dialog by clicking outside or pressing Escape."
        severity="error"
        confirmText="I Understand, Proceed"
        cancelText="Cancel"
        onConfirm={() => criticalDialog.executeAction(handleCriticalAction)}
        onCancel={criticalDialog.closeDialog}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
        showCloseButton={false}
        maxWidth="md"
      />
    </>
  );
};
