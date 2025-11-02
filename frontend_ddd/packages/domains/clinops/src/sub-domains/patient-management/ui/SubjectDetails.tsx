import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  getSubjectById, 
  updateSubjectStatus 
} from 'services/SubjectService';
import { getPatientVisits } from 'services/VisitService';
import ProtocolDeviationService from 'services/quality/ProtocolDeviationService';
import { startVisit } from 'services/data-capture/DataEntryService';
import { useAuth } from '@domains/identity-access/src/ui/login/AuthContext';
import PatientStatusBadge from '../../../shared/PatientStatusBadge';
import StatusChangeModal from '../components/StatusChangeModal';
import StatusHistoryTimeline from '../components/StatusHistoryTimeline';
import UnscheduledVisitModal from '../components/UnscheduledVisitModal';
import DeviationModal from '../../protocol-deviation/ui/DeviationModal';
import DeviationList from '../../protocol-deviation/ui/DeviationList';

const StatusChangeModalComponent: any = StatusChangeModal;
const StatusHistoryTimelineComponent: any = StatusHistoryTimeline;
const UnscheduledVisitModalComponent: any = UnscheduledVisitModal;
const DeviationModalComponent: any = DeviationModal;
const DeviationListComponent: any = DeviationList;

// Interface definitions
interface Subject {
  id: number;
  subjectId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  studyName?: string;
  studyId?: number;
  treatmentArmName?: string;
  enrollmentDate?: string;
  aggregateUuid?: string;
  createdAt?: string;
  lastModifiedAt?: string;
  siteId?: number;
  studySiteId?: number;
  status?: string;
}

interface Visit {
  id: number;
  visitName: string;
  visitWindowStart?: string;
  visitWindowEnd?: string;
  actualVisitDate?: string;
  status?: string;
  completionPercentage?: number;
  complianceStatus?: string;
  daysOverdue?: number;
}

interface StatusChangeResult {
  createVisit?: boolean;
  visitType?: string;
}

// Helper function to normalize visit status from backend to frontend
const normalizeVisitStatus = (backendStatus: string | undefined): string => {
  if (!backendStatus) return 'not_started';
  
  const statusMap: { [key: string]: string } = {
    'COMPLETED': 'complete',
    'IN_PROGRESS': 'incomplete',
    'SCHEDULED': 'not_started',
    'NOT_STARTED': 'not_started',
    // Add any other status mappings as needed
  };
  
  return statusMap[backendStatus.toUpperCase()] || backendStatus.toLowerCase();
};

// Helper function to get CSS classes for compliance badges
const getComplianceBadgeClass = (complianceStatus: string | undefined): string => {
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
  
  switch (complianceStatus?.toUpperCase()) {
    case 'COMPLIANT':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'UPCOMING':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'APPROACHING':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'OVERDUE':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'PROTOCOL_VIOLATION':
      return `${baseClasses} bg-purple-100 text-purple-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

// Helper function to get human-readable compliance labels
const getComplianceLabel = (complianceStatus: string | undefined): string => {
  if (!complianceStatus) return 'Unknown';
  
  const labelMap: { [key: string]: string } = {
    'COMPLIANT': 'Compliant',
    'UPCOMING': 'Upcoming',
    'APPROACHING': 'Approaching',
    'OVERDUE': 'Overdue',
    'PROTOCOL_VIOLATION': 'Protocol Violation'
  };
  
  return labelMap[complianceStatus.toUpperCase()] || complianceStatus;
};

const SubjectDetails: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Subject state
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitType, setVisitType] = useState<string>('');
  const [showDeviationModal, setShowDeviationModal] = useState(false);
  
  // Visit management state
  const [visits, setVisits] = useState<Visit[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [complianceFilter, setComplianceFilter] = useState<string>('all');
  
  // Protocol deviation state
  const [deviations, setDeviations] = useState<any[]>([]);
  const [deviationsLoading, setDeviationsLoading] = useState(true);

  // Fetch subject details
  useEffect(() => {
    fetchSubjectDetails();
  }, [id]);

  // Fetch visits when subject is loaded
  useEffect(() => {
    if (subject) {
      fetchVisits();
      fetchDeviations();
    }
  }, [subject]);

  const fetchSubjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!id) {
        throw new Error('Subject identifier is missing from the route');
      }

      const data = await getSubjectById(id) as any;
      setSubject(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load subject details');
    } finally {
      setLoading(false);
    }
  };

  const fetchVisits = async () => {
    try {
      setVisitsLoading(true);
      const data = await getPatientVisits(Number(id)) as any;
      setVisits(data || []);
    } catch (err: any) {
      console.error('Failed to load visits:', err);
      setVisits([]);
    } finally {
      setVisitsLoading(false);
    }
  };

  const fetchDeviations = async () => {
    try {
      setDeviationsLoading(true);
      const data = await ProtocolDeviationService.getPatientDeviations(Number(id)) as any;
      setDeviations(data || []);
    } catch (err: any) {
      console.error('Failed to load deviations:', err);
      setDeviations([]);
    } finally {
      setDeviationsLoading(false);
    }
  };

  const handleStatusChanged = async (result: StatusChangeResult) => {
    setShowStatusModal(false);
    await fetchSubjectDetails();
    
    // If status change requires creating a visit, show visit modal
    if (result.createVisit && result.visitType) {
      setVisitType(result.visitType);
      setShowVisitModal(true);
    }
  };

  const handleVisitCreated = async () => {
    setShowVisitModal(false);
    await fetchVisits();
  };

  const handleDeviationCreated = async () => {
    setShowDeviationModal(false);
    await fetchDeviations();
  };

  const handleStartVisit = async (visitId: number) => {
    try {
      const userId = String(user?.userId ?? user?.userNumericId ?? user?.email ?? 'system');
      await startVisit(visitId, userId) as any;
      await fetchVisits();
      // Navigate to visit details or form entry
      navigate(`/datacapture/visits/${visitId}`);
    } catch (err: any) {
      console.error('Failed to start visit:', err);
      alert('Failed to start visit. Please try again.');
    }
  };

  // Filter visits based on compliance status
  const filteredVisits = visits.filter((visit: Visit) => {
    if (complianceFilter === 'all') return true;
    if (complianceFilter === 'overdue') return visit.complianceStatus === 'OVERDUE';
    if (complianceFilter === 'due_soon') return visit.complianceStatus === 'APPROACHING';
    if (complianceFilter === 'compliant') return visit.complianceStatus === 'COMPLIANT';
    return true;
  });

  // Calculate visit progress summary
  const visitProgressSummary = {
    total: visits.length,
    completed: visits.filter((v: Visit) => normalizeVisitStatus(v.status) === 'complete').length,
    inProgress: visits.filter((v: Visit) => normalizeVisitStatus(v.status) === 'incomplete').length,
    notStarted: visits.filter((v: Visit) => normalizeVisitStatus(v.status) === 'not_started').length,
    overdue: visits.filter((v: Visit) => v.complianceStatus === 'OVERDUE').length
  };

  // Count active deviations
  const activeDeviations = deviations.filter((d: any) => 
    d.status !== 'RESOLVED' && d.status !== 'CLOSED'
  ).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading subject details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchSubjectDetails}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Subject not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {subject.firstName} {subject.lastName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Subject ID: {subject.subjectId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PatientStatusBadge status={subject.status} />
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Change Status
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              View History
            </button>
          </div>
        </div>
      </div>

      {/* Subject Information */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Subject Information</h2>
        </div>
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{subject.email || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{subject.phone || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Study</dt>
              <dd className="mt-1 text-sm text-gray-900">{subject.studyName || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Treatment Arm</dt>
              <dd className="mt-1 text-sm text-gray-900">{subject.treatmentArmName || 'Blinded'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Enrollment Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {subject.enrollmentDate ? new Date(subject.enrollmentDate).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* System Details */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">System Details</h2>
        </div>
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Aggregate UUID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{subject.aggregateUuid || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {subject.createdAt ? new Date(subject.createdAt).toLocaleString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Modified</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {subject.lastModifiedAt ? new Date(subject.lastModifiedAt).toLocaleString() : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Visit Management Section */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Visit Management</h2>
            <button
              onClick={() => {
                setVisitType('unscheduled');
                setShowVisitModal(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Visit
            </button>
          </div>
        </div>

        {/* Visit Progress Summary */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{visitProgressSummary.total}</div>
              <div className="text-sm text-gray-500">Total Visits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{visitProgressSummary.completed}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{visitProgressSummary.inProgress}</div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{visitProgressSummary.notStarted}</div>
              <div className="text-sm text-gray-500">Not Started</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{visitProgressSummary.overdue}</div>
              <div className="text-sm text-gray-500">Overdue</div>
            </div>
          </div>
        </div>

        {/* Compliance Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setComplianceFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                complianceFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Visits
            </button>
            <button
              onClick={() => setComplianceFilter('overdue')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                complianceFilter === 'overdue'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Overdue ({visits.filter(v => v.complianceStatus === 'OVERDUE').length})
            </button>
            <button
              onClick={() => setComplianceFilter('due_soon')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                complianceFilter === 'due_soon'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Due Soon ({visits.filter(v => v.complianceStatus === 'APPROACHING').length})
            </button>
            <button
              onClick={() => setComplianceFilter('compliant')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                complianceFilter === 'compliant'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Compliant ({visits.filter(v => v.complianceStatus === 'COMPLIANT').length})
            </button>
          </div>
        </div>

        {/* Visit List */}
        <div className="px-6 py-5">
          {visitsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading visits...</div>
          ) : filteredVisits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {complianceFilter === 'all' ? 'No visits found' : 'No visits match the selected filter'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visit Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Window Start
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Window End
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Compliance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVisits.map((visit) => {
                    const visitStatus = normalizeVisitStatus(visit.status);
                    return (
                      <tr key={visit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{visit.visitName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {visit.visitWindowStart 
                              ? new Date(visit.visitWindowStart).toLocaleDateString()
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {visit.visitWindowEnd 
                              ? new Date(visit.visitWindowEnd).toLocaleDateString()
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            visitStatus === 'complete' 
                              ? 'bg-green-100 text-green-800'
                              : visitStatus === 'incomplete'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {visitStatus === 'complete' ? 'Complete' : 
                             visitStatus === 'incomplete' ? 'In Progress' : 'Not Started'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-gray-900">
                              {visit.completionPercentage || 0}%
                            </div>
                            <div className="ml-3 w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${visit.completionPercentage || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getComplianceBadgeClass(visit.complianceStatus)}>
                            {getComplianceLabel(visit.complianceStatus)}
                          </span>
                          {visit.daysOverdue && visit.daysOverdue > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              {visit.daysOverdue} days overdue
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {visitStatus === 'not_started' ? (
                            <button
                              onClick={() => handleStartVisit(visit.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Start Visit
                            </button>
                          ) : visitStatus === 'incomplete' ? (
                            <Link
                              to={`/datacapture/visits/${visit.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Continue Visit
                            </Link>
                          ) : (
                            <Link
                              to={`/datacapture/visits/${visit.id}`}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              View Visit
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Protocol Deviations Section */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium text-gray-900">Protocol Deviations</h2>
              {activeDeviations > 0 && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  {activeDeviations} Active
                </span>
              )}
            </div>
            <button
              onClick={() => setShowDeviationModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Report Deviation
            </button>
          </div>
        </div>
        <div className="px-6 py-5">
          {deviationsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading deviations...</div>
          ) : (
            <DeviationList 
              deviations={deviations}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showStatusModal && (
        <StatusChangeModal
          isOpen={showStatusModal}
          patientId={subject.id}
          patientName={`${subject.firstName || ''} ${subject.lastName || ''}`.trim() || subject.subjectId}
          currentStatus={subject.status || 'UNKNOWN'}
          onClose={() => setShowStatusModal(false)}
          onStatusChanged={handleStatusChanged}
        />
      )}

      {showHistory && (
        <StatusHistoryTimeline
          patientId={subject.id}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showVisitModal && (
        <UnscheduledVisitModal
          isOpen={showVisitModal}
          patientId={subject.id}
          patientName={`${subject.firstName || ''} ${subject.lastName || ''}`.trim() || subject.subjectId}
          studyId={subject.studyId || 0}
          siteId={subject.siteId || 0}
          visitType={visitType}
          onClose={() => setShowVisitModal(false)}
          onVisitCreated={handleVisitCreated}
        />
      )}

      {showDeviationModal && (
        <DeviationModal
          isOpen={showDeviationModal}
          context={{
            patientId: subject.id,
            studySiteId: subject.studySiteId || subject.siteId || 0
          }}
          onClose={() => setShowDeviationModal(false)}
          onDeviationCreated={handleDeviationCreated}
        />
      )}
    </div>
  );
};

export default SubjectDetails;
