import React, { useState, useEffect } from 'react';
import StudyService from '../../services/StudyService';
import ApiService from '../../services/ApiService';

export default function StudyApiDebug() {
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState([]);

    const addDebugLog = (message, data = null) => {
        const timestamp = new Date().toLocaleTimeString();
        setDebugInfo(prev => [...prev, { timestamp, message, data }]);
        console.log(`[DEBUG ${timestamp}] ${message}`, data);
    };

    const testApiConnection = async () => {
        setLoading(true);
        setError(null);
        setDebugInfo([]);
        setStudies([]);

        addDebugLog('Starting API connection test...');

        try {
            // Test 1: Direct API service call
            addDebugLog('Testing direct ApiService.get()...');
            const directResponse = await ApiService.get('/study-design-ws/api/studies');
            addDebugLog('Direct API response received', {
                status: directResponse.status,
                dataType: typeof directResponse.data,
                isArray: Array.isArray(directResponse.data),
                dataLength: directResponse.data?.length,
                firstItem: directResponse.data?.[0]
            });

            // Test 2: StudyService.getStudies()
            addDebugLog('Testing StudyService.getStudies()...');
            const studiesData = await StudyService.getStudies();
            addDebugLog('StudyService response received', {
                dataType: typeof studiesData,
                isArray: Array.isArray(studiesData),
                dataLength: studiesData?.length,
                firstItem: studiesData?.[0]
            });

            setStudies(studiesData);
            addDebugLog('API test completed successfully');

        } catch (err) {
            addDebugLog('API test failed', {
                errorMessage: err.message,
                errorStatus: err.response?.status,
                errorData: err.response?.data
            });
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testBackendServices = async () => {
        addDebugLog('Testing individual backend services...');

        const services = [
            { name: 'Study Design Service', path: '/study-design-ws/api/studies' },
            { name: 'Admin Service', path: '/admin-ws/api/sites' },
            { name: 'Data Capture Service', path: '/datacapture-ws/api/patients' }
        ];

        for (const service of services) {
            try {
                addDebugLog(`Testing ${service.name} at ${service.path}...`);
                const response = await ApiService.get(service.path);
                addDebugLog(`✅ ${service.name} - Success`, {
                    status: response.status,
                    dataLength: response.data?.length
                });
            } catch (err) {
                addDebugLog(`❌ ${service.name} - Failed`, {
                    status: err.response?.status,
                    message: err.message
                });
            }
        }
    };

    useEffect(() => {
        addDebugLog('Component mounted, ready for testing');
    }, []);

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Study API Debug Tool</h2>

            <div className="space-y-4 mb-6">
                <button
                    onClick={testApiConnection}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Testing...' : 'Test Study API Connection'}
                </button>

                <button
                    onClick={testBackendServices}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-2"
                >
                    Test All Backend Services
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Error Detected</h3>
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {studies.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-medium text-green-800 mb-2">Studies Found ({studies.length})</h3>
                    <div className="space-y-2">
                        {studies.map((study, index) => (
                            <div key={study.id} className="bg-white p-2 rounded border">
                                <strong>Study {index + 1}:</strong> {study.title || study.name || 'Untitled'}
                                <span className="text-gray-500 ml-2">(ID: {study.id})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Debug Log</h3>
                <div className="max-h-96 overflow-y-auto space-y-1">
                    {debugInfo.map((log, index) => (
                        <div key={index} className="text-sm">
                            <span className="text-gray-500">[{log.timestamp}]</span>
                            <span className="ml-2">{log.message}</span>
                            {log.data && (
                                <details className="ml-4">
                                    <summary className="text-blue-600 cursor-pointer">Data</summary>
                                    <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                                        {JSON.stringify(log.data, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}