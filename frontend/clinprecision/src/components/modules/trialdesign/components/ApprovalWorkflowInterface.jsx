import React, { useState } from 'react';
import {
    CheckCircle, Clock, AlertTriangle,
    MessageSquare, XCircle, ThumbsUp, ThumbsDown,
    FileText, Activity
} from 'lucide-react';
import { Button } from '../components/UIComponents';

/**
 * Approval Workflow Interface Component
 * Enhanced workflow management for protocol revision approvals
 */
const ApprovalWorkflowInterface = ({
    revisions,
    currentUser,
    onApprove,
    onReject,
    onRequestChanges,
    onAddComment,
    isVisible,
    onClose
}) => {
    const [selectedRevision, setSelectedRevision] = useState(null);
    const [workflowFilter, setWorkflowFilter] = useState('all'); // 'all', 'pending', 'in-review', 'approved', 'rejected'
    const [sortBy, setSortBy] = useState('priority'); // 'priority', 'date', 'type', 'impact'
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [comment, setComment] = useState('');

    // Mock approval workflow data
    const getWorkflowData = () => ({
        approvalSteps: [
            {
                id: 'medical-review',
                name: 'Medical Review',
                description: 'Clinical and scientific review by medical team',
                required: true,
                order: 1,
                approvers: ['Dr. Sarah Johnson', 'Dr. Michael Chen'],
                status: 'COMPLETED',
                completedBy: 'Dr. Sarah Johnson',
                completedDate: '2024-01-15T10:30:00Z',
                comments: 'Changes appear scientifically sound and align with current guidelines.'
            },
            {
                id: 'regulatory-review',
                name: 'Regulatory Review',
                description: 'Regulatory compliance and submission requirements',
                required: true,
                order: 2,
                approvers: ['Lisa Rodriguez, RAC', 'Tom Wilson, RAC'],
                status: 'IN_PROGRESS',
                completedBy: null,
                completedDate: null,
                comments: 'Under review for regulatory compliance.'
            },
            {
                id: 'statistical-review',
                name: 'Statistical Review',
                description: 'Statistical methodology and analysis plan review',
                required: true,
                order: 3,
                approvers: ['Dr. James Wilson', 'Dr. Emily Davis'],
                status: 'PENDING',
                completedBy: null,
                completedDate: null,
                comments: null
            },
            {
                id: 'ethics-review',
                name: 'Ethics Committee Review',
                description: 'Ethical implications and patient safety review',
                required: true,
                order: 4,
                approvers: ['Ethics Committee Chair', 'Patient Advocate'],
                status: 'PENDING',
                completedBy: null,
                completedDate: null,
                comments: null
            },
            {
                id: 'final-approval',
                name: 'Final Approval',
                description: 'Principal investigator final sign-off',
                required: true,
                order: 5,
                approvers: ['Dr. Sarah Johnson (PI)'],
                status: 'PENDING',
                completedBy: null,
                completedDate: null,
                comments: null
            }
        ],
        comments: [
            {
                id: 'comment-1',
                author: 'Dr. Sarah Johnson',
                role: 'Principal Investigator',
                content: 'The proposed changes to the primary endpoint are well-justified and align with recent FDA guidance. I support moving forward with this amendment.',
                timestamp: '2024-01-15T10:30:00Z',
                type: 'APPROVAL'
            },
            {
                id: 'comment-2',
                author: 'Lisa Rodriguez',
                role: 'Regulatory Affairs',
                content: 'Need to verify submission requirements with regulatory authorities. Will complete review by end of week.',
                timestamp: '2024-01-16T14:20:00Z',
                type: 'INFO'
            },
            {
                id: 'comment-3',
                author: 'Dr. Michael Chen',
                role: 'Co-Investigator',
                content: 'Please ensure that the sample size calculations account for the new co-primary endpoint. Statistical team should review power analysis.',
                timestamp: '2024-01-17T09:15:00Z',
                type: 'CONCERN'
            }
        ]
    });

    // Enhanced revision data with workflow information
    const getEnhancedRevisions = () => {
        return revisions.map(revision => ({
            ...revision,
            workflow: getWorkflowData(),
            priority: getPriority(revision),
            estimatedCompletion: getEstimatedCompletion(revision),
            bottlenecks: getBottlenecks(revision)
        }));
    };

    // Calculate revision priority
    const getPriority = (revision) => {
        const impactWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const typeWeight = {
            SUBSTANTIAL_AMENDMENT: 3,
            MINOR_AMENDMENT: 2,
            ADMINISTRATIVE_CHANGE: 1
        };

        const impactScore = impactWeight[revision.estimatedImpact] || 1;
        const typeScore = typeWeight[revision.type] || 1;
        const ageScore = getAgeScore(revision.requestedDate);

        const totalScore = impactScore + typeScore + ageScore;

        if (totalScore >= 7) return 'HIGH';
        if (totalScore >= 5) return 'MEDIUM';
        return 'LOW';
    };

    // Get age-based priority score
    const getAgeScore = (dateString) => {
        const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
        if (days > 14) return 3;
        if (days > 7) return 2;
        return 1;
    };

    // Estimate completion time
    const getEstimatedCompletion = (revision) => {
        const baseTime = {
            SUBSTANTIAL_AMENDMENT: 21,
            MINOR_AMENDMENT: 14,
            ADMINISTRATIVE_CHANGE: 7
        };

        const baseDays = baseTime[revision.type] || 14;
        const requestDate = new Date(revision.requestedDate);
        const estimated = new Date(requestDate.getTime() + (baseDays * 24 * 60 * 60 * 1000));

        return estimated.toISOString();
    };

    // Identify workflow bottlenecks
    const getBottlenecks = (revision) => {
        const bottlenecks = [];
        const workflow = getWorkflowData();

        workflow.approvalSteps.forEach(step => {
            if (step.status === 'IN_PROGRESS') {
                const daysSinceStarted = 7; // Mock calculation
                if (daysSinceStarted > 5) {
                    bottlenecks.push({
                        step: step.name,
                        reason: 'Extended review time',
                        daysOverdue: daysSinceStarted - 5
                    });
                }
            }
        });

        return bottlenecks;
    };

    // Filter and sort revisions
    const getFilteredRevisions = () => {
        let filtered = getEnhancedRevisions();

        if (workflowFilter !== 'all') {
            filtered = filtered.filter(revision => {
                const statusMap = {
                    pending: 'DRAFT',
                    'in-review': 'PROTOCOL_REVIEW',
                    approved: 'APPROVED',
                    rejected: 'REJECTED'
                };
                return revision.status === statusMap[workflowFilter];
            });
        }

        // Sort revisions
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'priority':
                    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'date':
                    return new Date(b.requestedDate) - new Date(a.requestedDate);
                case 'type':
                    return a.type.localeCompare(b.type);
                case 'impact':
                    const impactOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                    return impactOrder[b.estimatedImpact] - impactOrder[a.estimatedImpact];
                default:
                    return 0;
            }
        });

        return filtered;
    };

    // Get step status color
    const getStepStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'PENDING':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'LOW':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get comment type icon
    const getCommentTypeIcon = (type) => {
        switch (type) {
            case 'APPROVAL':
                return <ThumbsUp className="h-4 w-4 text-green-600" />;
            case 'CONCERN':
                return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case 'REJECTION':
                return <ThumbsDown className="h-4 w-4 text-red-600" />;
            default:
                return <MessageSquare className="h-4 w-4 text-blue-600" />;
        }
    };

    // Handle comment submission
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        onAddComment(selectedRevision.id, {
            content: comment,
            type: 'INFO'
        });

        setComment('');
        setShowCommentForm(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">Approval Workflow</h3>
                            <p className="text-gray-600 mt-1">
                                Manage protocol revision approvals and review process
                            </p>
                        </div>
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>

                    {/* Workflow Stats */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-blue-900">
                                        {revisions.filter(r => r.status === 'PROTOCOL_REVIEW').length}
                                    </div>
                                    <div className="text-sm text-blue-700">In Review</div>
                                </div>
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-yellow-900">
                                        {revisions.filter(r => r.status === 'DRAFT').length}
                                    </div>
                                    <div className="text-sm text-yellow-700">Pending Submission</div>
                                </div>
                                <FileText className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-green-900">
                                        {revisions.filter(r => r.status === 'APPROVED').length}
                                    </div>
                                    <div className="text-sm text-green-700">Approved</div>
                                </div>
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-red-900">
                                        {getEnhancedRevisions().filter(r => r.bottlenecks.length > 0).length}
                                    </div>
                                    <div className="text-sm text-red-700">With Bottlenecks</div>
                                </div>
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">Filter:</label>
                                <select
                                    value={workflowFilter}
                                    onChange={(e) => setWorkflowFilter(e.target.value)}
                                    className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Revisions</option>
                                    <option value="pending">Pending Submission</option>
                                    <option value="in-review">In Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="priority">Priority</option>
                                    <option value="date">Date</option>
                                    <option value="type">Type</option>
                                    <option value="impact">Impact</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex h-[calc(90vh-200px)]">
                    {/* Revision List */}
                    <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                        <div className="p-4">
                            <h4 className="font-medium text-gray-900 mb-4">Revisions</h4>
                            <div className="space-y-3">
                                {getFilteredRevisions().map((revision) => (
                                    <div
                                        key={revision.id}
                                        className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${selectedRevision?.id === revision.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 bg-white'
                                            }`}
                                        onClick={() => setSelectedRevision(revision)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h5 className="font-medium text-gray-900 text-sm">{revision.title}</h5>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(revision.priority)}`}>
                                                {revision.priority}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{revision.description}</p>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>v{revision.targetVersion}</span>
                                            <span>{new Date(revision.requestedDate).toLocaleDateString()}</span>
                                        </div>

                                        {/* Bottlenecks indicator */}
                                        {revision.bottlenecks.length > 0 && (
                                            <div className="mt-2 flex items-center space-x-1">
                                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                                <span className="text-xs text-red-600">
                                                    {revision.bottlenecks.length} bottleneck{revision.bottlenecks.length > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Revision Details */}
                    <div className="flex-1 overflow-y-auto">
                        {selectedRevision ? (
                            <div className="p-6 space-y-6">
                                {/* Revision Header */}
                                <div className="border-b border-gray-200 pb-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{selectedRevision.title}</h3>
                                            <p className="text-gray-600 mt-1">{selectedRevision.description}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(selectedRevision.priority)}`}>
                                                {selectedRevision.priority} Priority
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">Target Version:</span> v{selectedRevision.targetVersion}
                                        </div>
                                        <div>
                                            <span className="font-medium">Requested by:</span> {selectedRevision.requestedBy}
                                        </div>
                                        <div>
                                            <span className="font-medium">Estimated completion:</span> {new Date(selectedRevision.estimatedCompletion).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Workflow Progress */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-4">Approval Progress</h4>
                                    <div className="space-y-4">
                                        {selectedRevision.workflow.approvalSteps.map((step, index) => (
                                            <div key={step.id} className="flex items-start space-x-4">
                                                {/* Step indicator */}
                                                <div className="flex-shrink-0 mt-1">
                                                    {step.status === 'COMPLETED' ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    ) : step.status === 'IN_PROGRESS' ? (
                                                        <Clock className="h-5 w-5 text-blue-500" />
                                                    ) : (
                                                        <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                                                    )}
                                                </div>

                                                {/* Step content */}
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h5 className="font-medium text-gray-900">{step.name}</h5>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStepStatusColor(step.status)}`}>
                                                            {step.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>

                                                    <div className="mt-2 text-xs text-gray-500">
                                                        <span>Approvers: {step.approvers.join(', ')}</span>
                                                    </div>

                                                    {step.completedBy && (
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            <span>Completed by {step.completedBy} on {new Date(step.completedDate).toLocaleDateString()}</span>
                                                        </div>
                                                    )}

                                                    {step.comments && (
                                                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                                                            {step.comments}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-medium text-gray-900">Comments & Discussion</h4>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowCommentForm(!showCommentForm)}
                                        >
                                            <MessageSquare className="h-4 w-4 mr-1" />
                                            Add Comment
                                        </Button>
                                    </div>

                                    {/* Comment form */}
                                    {showCommentForm && (
                                        <form onSubmit={handleCommentSubmit} className="mb-4 p-4 border border-gray-200 rounded-lg">
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="Add your comment..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                rows={3}
                                                required
                                            />
                                            <div className="mt-2 flex justify-end space-x-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowCommentForm(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" size="sm">
                                                    Add Comment
                                                </Button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Comments list */}
                                    <div className="space-y-4">
                                        {selectedRevision.workflow.comments.map((comment) => (
                                            <div key={comment.id} className="flex space-x-3">
                                                <div className="flex-shrink-0">
                                                    {getCommentTypeIcon(comment.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <h6 className="font-medium text-gray-900">{comment.author}</h6>
                                                        <span className="text-sm text-gray-500">{comment.role}</span>
                                                        <span className="text-sm text-gray-400">•</span>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(comment.timestamp).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {selectedRevision.status === 'PROTOCOL_REVIEW' && (
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex space-x-3">
                                            <Button
                                                onClick={() => onApprove(selectedRevision.id)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => onRequestChanges(selectedRevision.id)}
                                            >
                                                <AlertTriangle className="h-4 w-4 mr-2" />
                                                Request Changes
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => onReject(selectedRevision.id)}
                                                className="border-red-300 text-red-700 hover:bg-red-50"
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Revision</h3>
                                <p className="text-gray-600">
                                    Choose a revision from the list to view its approval workflow
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalWorkflowInterface;