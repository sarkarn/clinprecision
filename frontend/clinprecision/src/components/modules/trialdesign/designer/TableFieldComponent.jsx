import React, { useState } from 'react';
import { createTableGroup } from './models/CRFModels';

// Dialog component for configuring a new table
export const TableConfigDialog = ({ isOpen, onClose, onConfirm }) => {
    const [tableName, setTableName] = useState('New Table');
    const [columns, setColumns] = useState(3);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const tableGroup = createTableGroup({
            name: tableName,
            rows: 2, // Always set to 2 (header + 1 data row)
            columns
        });
        onConfirm(tableGroup);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Configure Table</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Table Name
                    </label>
                    <input
                        type="text"
                        value={tableName}
                        onChange={(e) => setTableName(e.target.value)}
                        className="border border-gray-300 rounded-md w-full px-3 py-2"
                        placeholder="Enter table name"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Columns
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={columns}
                            onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 1))}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">Table will have one header row and one data row</p>
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Create Table
                    </button>
                </div>
            </div>
        </div>
    );
};

// Table component for displaying in the canvas
export const TableComponent = ({
    tableGroup,
    table, // For backward compatibility
    onEditHeader,
    onAddRow,
    onRemoveRow,
    onAddColumn,
    onRemoveColumn,
    onSelectCell,
    onCellClick, // For backward compatibility
    selectedCell,
    fields,
    readOnly = false
}) => {
    // Support both tableGroup and table props for backward compatibility
    const actualTableGroup = tableGroup || table;

    if (!actualTableGroup || !actualTableGroup.tableConfig) return null;

    const { rows, columns, headers } = actualTableGroup.tableConfig;

    // Find a field in a specific cell
    const findFieldInCell = (rowIndex, colIndex) => {
        if (!fields) return null;
        return fields.find(field =>
            field.groupId === actualTableGroup.id &&
            field.tablePosition &&
            field.tablePosition.row === rowIndex &&
            field.tablePosition.column === colIndex
        );
    };

    return (
        <div className="w-full mb-4">
            <div className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded">
                <h3 className="font-medium">{actualTableGroup.name}</h3>
                {!readOnly && (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onAddColumn && onAddColumn(actualTableGroup.id)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                            title="Add column"
                        >
                            + Column
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            {headers.map((header, colIndex) => (
                                <th key={colIndex} className="border border-gray-300 p-2 min-w-[100px]">
                                    <input
                                        type="text"
                                        value={header}
                                        onChange={(e) => {
                                            if (onEditHeader) {
                                                onEditHeader(actualTableGroup.id, colIndex, e.target.value);
                                            }
                                        }}
                                        className={`w-full bg-transparent border-b border-dashed border-gray-400 p-1 text-center ${readOnly ? 'cursor-not-allowed' : ''}`}
                                        disabled={readOnly}
                                    />
                                </th>
                            ))}
                            <th className="border border-gray-300 p-1 w-10">
                                {!readOnly && (
                                    <button
                                        onClick={() => onRemoveColumn && onRemoveColumn(actualTableGroup.id)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Remove last column"
                                        disabled={columns <= 1}
                                    >
                                        -
                                    </button>
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {Array(columns).fill().map((_, colIndex) => {
                                const field = findFieldInCell(1, colIndex);
                                const isSelected = selectedCell &&
                                    selectedCell.groupId === actualTableGroup.id &&
                                    selectedCell.row === 1 &&
                                    selectedCell.column === colIndex;

                                return (
                                    <td
                                        key={colIndex}
                                        className={`border border-gray-300 p-2 min-h-[40px] ${isSelected ? 'bg-blue-50' : ''}`}
                                        onClick={() => {
                                            // Support both callback styles
                                            if (onSelectCell) {
                                                onSelectCell(actualTableGroup.id, 1, colIndex);
                                            }
                                            if (onCellClick) {
                                                onCellClick(1, colIndex);
                                            }
                                        }}
                                    >
                                        {field ? (
                                            <div className="text-sm p-1 bg-gray-50 rounded">
                                                {field.label} ({field.type})
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 text-xs text-center italic">
                                                Drop field here
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                            <td className="border border-gray-300 p-1 w-10">
                                {/* No remove row button needed for the fixed data row */}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// No default export, only named exports
