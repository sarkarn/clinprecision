import React, { FC, useState, FormEvent, ChangeEvent } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { StudyDatabaseBuild } from '../types/study/DatabaseBuild.types';

interface CancelBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  build: StudyDatabaseBuild & {
    studyName?: string;
  };
}

/**
 * Modal for cancelling a study database build
 * Requires cancellation reason for audit trail
 */
const CancelBuildModal: FC<CancelBuildModalProps> = ({ isOpen, onClose, onConfirm, build }) => {
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validate reason
    if (!cancellationReason.trim()) {
      setError('Cancellation reason is required');
      return;
    }

    if (cancellationReason.trim().length < 10) {
      setError('Please provide a more detailed reason (minimum 10 characters)');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onConfirm(cancellationReason.trim());
      handleClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to cancel build');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (): void => {
    setCancellationReason('');
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Cancel Database Build
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Build info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{build?.studyName}</p>
                  <p className="text-gray-600 mt-1">Request ID: {build?.buildRequestId}</p>
                  <p className="text-gray-600">Status: {build?.buildStatus}</p>
                </div>
              </div>

              {/* Warning message */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Impact Warning
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Current build progress will be lost</li>
                        <li>Partial database changes may need cleanup</li>
                        <li>This action will be logged for audit trail</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancellation reason */}
              <div className="mt-4">
                <label htmlFor="cancellation-reason" className="block text-sm font-medium text-gray-700">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="cancellation-reason"
                  rows={4}
                  value={cancellationReason}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    setCancellationReason(e.target.value);
                    setError('');
                  }}
                  disabled={isSubmitting}
                  placeholder="Please provide a detailed reason for cancelling this build (minimum 10 characters)..."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {cancellationReason.length} / 500 characters (minimum 10 required)
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting || !cancellationReason.trim() || cancellationReason.trim().length < 10}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Cancelling...
                  </>
                ) : (
                  'Cancel Build'
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keep Building
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CancelBuildModal;
