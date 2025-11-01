import { useState, useEffect } from 'react';
import ApiService from 'services/ApiService';

interface CodeListOption {
    id: string;
    value: string;
    label: string;
    description?: string;
}

interface UseCodeListOptions {
    filters?: Record<string, any>;
    transformData?: ((data: any[]) => any[]) | null;
}

interface UseCodeListResult {
    data: CodeListOption[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

/**
 * Hook for fetching code list data from ClinOps Service
 * Fetches from /api/v1/study-design/metadata/codelists/simple/{category}
 */
export const useCodeList = (
    category: string,
    options?: UseCodeListOptions
): UseCodeListResult => {
    const [data, setData] = useState<CodeListOption[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!category) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch from CodeList API
            const response = await ApiService.get(
                `/clinops-ws/api/v1/study-design/metadata/codelists/simple/${category}`
            );

            let codeListData = response.data || [];

            // Apply custom transformation if provided
            if (options?.transformData && typeof options.transformData === 'function') {
                codeListData = options.transformData(codeListData);
            }

            // Transform backend response to frontend format
            // CodeListDto fields: id, code, displayName, description, sortOrder, etc.
            const transformedData: CodeListOption[] = codeListData.map((item: any) => ({
                id: item.id?.toString() || item.code,
                value: item.code,
                label: item.displayName || item.label,
                description: item.description
            }));

            setData(transformedData);
        } catch (err: any) {
            console.error(`Error fetching code list for category ${category}:`, err);
            setError(err.message || 'Failed to fetch code list');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [category, JSON.stringify(options?.filters)]);

    const refresh = () => {
        fetchData();
    };

    return {
        data,
        loading,
        error,
        refresh
    };
};

export default useCodeList;
