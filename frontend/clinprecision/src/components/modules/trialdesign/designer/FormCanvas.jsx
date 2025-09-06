import React, { useRef, useState, useEffect } from 'react';
import { TableComponent } from './TableFieldComponent';

export default function FormCanvas({
  fields,
  fieldGroups,
  onDropField,
  onDragOverField,
  onLabelChange,
  onRemoveField,
  onMoveField,
  draggingIndex,
  setDraggingIndex,
  toggleFieldWidth,
  updateFieldSize,
  onSelectField,
  onTableCellClick,
  onTableAddRow,
  onTableAddColumn,
  onTableRemoveRow,
  onTableRemoveColumn,
  onTableEditHeader
}) {
  const dragOverIndex = useRef(null);
  const [resizing, setResizing] = useState(null);
  const [resizeMode, setResizeMode] = useState(null);
  const startSizeRef = useRef(null);
  const startPosRef = useRef(null);
  const [showSizeIndicator, setShowSizeIndicator] = useState(false);
  const [indicatorValue, setIndicatorValue] = useState("");
  const indicatorTimeoutRef = useRef(null);

  // Drag-and-drop field handling
  const handleDragStart = (idx) => {
    if (resizing !== null) return;
    setDraggingIndex(idx);
  };

  const handleDragEnter = (idx) => {
    dragOverIndex.current = idx;
  };

  const handleDragEnd = () => {
    if (
      draggingIndex !== null &&
      dragOverIndex.current !== null &&
      draggingIndex !== dragOverIndex.current
    ) {
      onMoveField(draggingIndex, dragOverIndex.current);
    }
    setDraggingIndex(null);
    dragOverIndex.current = null;
  };

  // Field drop for reordering
  const handleDrop = (e, index) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggingIndex !== null) {
      onMoveField(draggingIndex, index);
      setDraggingIndex(null);
    }
  };

  // Show size indicator with value
  const displaySizeIndicator = (value) => {
    setIndicatorValue(value);
    setShowSizeIndicator(true);

    if (indicatorTimeoutRef.current) {
      clearTimeout(indicatorTimeoutRef.current);
    }

    indicatorTimeoutRef.current = setTimeout(() => {
      setShowSizeIndicator(false);
    }, 1500);
  };

  // Field resizing functionality
  const startResize = (e, idx, mode = 'both') => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(idx);
    setResizeMode(mode);
    startPosRef.current = { x: e.clientX, y: e.clientY };

    const fieldWidth = fields[idx].widthPercent || (fields[idx].width === 'half' ? 50 : 100);
    const fieldHeight = fields[idx].height || 'auto';
    startSizeRef.current = { width: fieldWidth, height: fieldHeight };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);

    displaySizeIndicator(`${fieldWidth}%`);
  };

  const handleMouseMove = (e) => {
    if (resizing === null) return;

    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;

    if (resizeMode === 'width' || resizeMode === 'both') {
      const containerEl = document.querySelector('.flex-wrap');
      const containerWidth = containerEl ? containerEl.clientWidth : 800;

      const horizontalSensitivity = 0.75;
      const percentageDelta = (deltaX / containerWidth) * 100 * horizontalSensitivity;

      let newWidthPercent = Math.min(100, Math.max(25, startSizeRef.current.width + percentageDelta));

      if (newWidthPercent > 75) {
        newWidthPercent = 100;
      } else if (newWidthPercent > 35 && newWidthPercent < 65) {
        newWidthPercent = 50;
      } else if (newWidthPercent <= 35) {
        newWidthPercent = 33;
      }

      updateFieldSize(resizing, newWidthPercent, fields[resizing].height);

      displaySizeIndicator(`${Math.round(newWidthPercent)}%`);
    }

    if (resizeMode === 'height' || resizeMode === 'both') {
      let newHeight = startSizeRef.current.height;
      if (typeof newHeight === 'number') {
        newHeight = Math.max(60, newHeight + deltaY);
      } else if (deltaY > 20) {
        newHeight = 60 + deltaY;
      }

      updateFieldSize(resizing, fields[resizing].widthPercent, newHeight);
    }
  };

  const stopResize = () => {
    setResizing(null);
    setResizeMode(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResize);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
      }
    };
  }, [resizing]);

  const getWidthStyle = (field) => {
    if (field.widthPercent) {
      return `${field.widthPercent}%`;
    }
    return field.width === 'half' ? '50%' : '100%';
  };

  const getHeightStyle = (field) => {
    return typeof field.height === 'number' ? `${field.height}px` : 'auto';
  };

  // Render the field with its metadata badge if applicable
  const renderFieldContent = (field) => {
    const hasMetadata = field.metadata && (
      field.metadata.variableName ||
      field.metadata.sdtmMapping ||
      field.metadata.required
    );

    // Render table field
    if (field.type === 'table') {
      // Find the table group
      const tableGroup = fieldGroups?.find(group =>
        group.type === 'table' && group.id === field.groupId
      );

      if (tableGroup) {
        return (
          <>
            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-500 lowercase">table:</span>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => onLabelChange(field.index, e.target.value)}
                  className="border-b border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onRemoveField(field.index)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="pl-1">
              <TableComponent
                tableGroup={tableGroup}
                fields={fields.filter(f => f.groupId === tableGroup.id)}
                onEditHeader={onTableEditHeader}
                onSelectCell={(groupId, rowIndex, colIndex) => onTableCellClick && onTableCellClick(field.index, rowIndex, colIndex)}
                selectedCell={null}
                onAddRow={onTableAddRow}
                onAddColumn={onTableAddColumn}
                onRemoveRow={onTableRemoveRow}
                onRemoveColumn={onTableRemoveColumn}
                readOnly={false}
              />
            </div>

            {/* Metadata badges */}
            {hasMetadata && (
              <div className="absolute top-0 right-0 flex -mt-2 -mr-2 z-10">
                {field.metadata.required && (
                  <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full mr-1">
                    Required
                  </span>
                )}
                {field.metadata.variableName && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                    {field.metadata.variableName}
                  </span>
                )}
              </div>
            )}
          </>
        );
      }
    }

    return (
      <>
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-500 lowercase">{field.type}:</span>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onLabelChange(field.index, e.target.value)}
              className="border-b border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5"
            />
          </div>
          <div className="flex items-center gap-1">
            {toggleFieldWidth && (
              <button
                onClick={() => toggleFieldWidth(field.index)}
                className="text-blue-500 hover:text-blue-700 text-xs px-1"
                title={`Toggle to ${field.width === 'half' ? 'full' : 'half'} width`}
              >
                {field.width === 'half' ? '½' : 'Full'}
              </button>
            )}
            <button
              onClick={() => onRemoveField(field.index)}
              className="text-red-500 hover:text-red-700"
              title="Remove"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="pl-1">
          {field.type === 'text' && <input disabled placeholder="Text input" className="border p-1 rounded w-full opacity-50" />}
          {field.type === 'number' && (
            <div className="flex items-center">
              <input disabled type="number" placeholder="0" className="border p-1 rounded w-full opacity-50" />
              {field.metadata?.units && (
                <span className="ml-1 text-gray-500">{field.metadata.units}</span>
              )}
            </div>
          )}
          {field.type === 'date' && <input disabled type="date" className="border p-1 rounded w-full opacity-50" />}
          {field.type === 'checkbox' && (
            <label className="flex items-center gap-1 text-gray-500">
              <input disabled type="checkbox" className="opacity-50" />
              Checkbox
            </label>
          )}
          {field.type === 'radio' && (
            <label className="flex items-center gap-1 text-gray-500">
              <input disabled type="radio" className="opacity-50" />
              Option
            </label>
          )}
        </div>

        {/* Metadata badges */}
        {hasMetadata && (
          <div className="absolute top-0 right-0 flex -mt-2 -mr-2 z-10">
            {field.metadata.required && (
              <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full mr-1">
                Required
              </span>
            )}
            {field.metadata.variableName && (
              <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                {field.metadata.variableName}
              </span>
            )}
          </div>
        )}

        {/* Add quality control icons */}
        {hasMetadata && (field.metadata.sdvRequired || field.metadata.medicalReview || field.metadata.dataReview || field.metadata.criticalDataPoint) && (
          <div className="absolute top-6 right-0 flex -mr-2 z-10">
            {field.metadata.sdvRequired && (
              <span className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full mr-1" title="Source Data Verification Required">
                SDV
              </span>
            )}
            {field.metadata.medicalReview && (
              <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full mr-1" title="Medical Review Required">
                MRev
              </span>
            )}
            {field.metadata.dataReview && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-full mr-1" title="Data Review Required">
                DRev
              </span>
            )}
            {field.metadata.criticalDataPoint && (
              <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full" title="Critical Data Point">
                Critical
              </span>
            )}
          </div>
        )}

        {/* Description tooltip */}
        {field.metadata?.description && (
          <div className="absolute bottom-0 left-0 ml-1 mb-1">
            <span className="text-gray-400 text-xs hover:text-blue-500 cursor-help" title={field.metadata.description}>
              ℹ️
            </span>
          </div>
        )}
      </>
    );
  };

  return (
    <div
      className="h-full flex flex-col p-4 bg-gray-50"
      onDrop={onDropField}
      onDragOver={onDragOverField}
    >
      <h4 className="font-medium mb-3 text-sm">Form Canvas</h4>
      {/* Make the content area scrollable */}
      <div className="flex-1 overflow-y-auto">
        {fields.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-8 border border-dashed border-gray-300 rounded">
            Drag fields here
          </div>
        )}

        <div className="flex flex-wrap -mx-2">
          {/* Size indicator overlay */}
          {showSizeIndicator && (
            <div className="fixed top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium z-20 shadow-md">
              {indicatorValue}
            </div>
          )}

          {fields.map((field, idx) => (
            <div
              key={idx}
              className="px-2 mb-3"
              style={{
                width: getWidthStyle(field),
                transition: resizing === idx ? 'none' : 'width 0.2s ease'
              }}
              onDragOver={(e) => {
                e.preventDefault();
                handleDragEnter(idx);
              }}
            >
              <div
                className={`relative p-3 border rounded bg-white shadow-sm text-xs ${draggingIndex === idx ? 'opacity-50' : ''
                  } ${draggingIndex === idx ? 'border-blue-500' : ''}`}
                style={{
                  height: getHeightStyle(field),
                  transition: resizing === idx ? 'none' : 'height 0.2s ease'
                }}
                draggable={resizing === null}
                onDragStart={() => handleDragStart(idx)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, idx)}
                onClick={() => onSelectField(idx)} // Select field for metadata editing
              >
                {renderFieldContent({ ...field, index: idx })}

                {/* Right edge resize handle */}
                <div
                  className="absolute top-0 right-0 w-3 h-full cursor-ew-resize z-10 group"
                  onMouseDown={(e) => startResize(e, idx, 'width')}
                  title="Resize width"
                >
                  <div className="invisible group-hover:visible absolute right-0 top-1/2 -translate-y-1/2 w-2 h-10 bg-blue-400 opacity-50 rounded" />
                </div>

                {/* Bottom edge resize handle */}
                <div
                  className="absolute bottom-0 left-0 w-full h-3 cursor-ns-resize z-10 group"
                  onMouseDown={(e) => startResize(e, idx, 'height')}
                  title="Resize height"
                >
                  <div className="invisible group-hover:visible absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-2 bg-blue-400 opacity-50 rounded" />
                </div>

                {/* Corner resize handle */}
                <div
                  className="absolute bottom-0 right-0 w-10 h-10 cursor-nwse-resize z-10"
                  onMouseDown={(e) => startResize(e, idx, 'both')}
                  style={{
                    background: 'linear-gradient(135deg, transparent 70%, rgba(59, 130, 246, 0.4) 70%)',
                    borderBottomRightRadius: '0.25rem'
                  }}
                  title="Resize field"
                />

                {/* Width percentage indicator */}
                {resizing === idx && resizeMode.includes('width') && (
                  <div className="absolute top-0 left-0 bg-blue-600 text-white px-1 text-xs rounded-bl rounded-tr">
                    {Math.round(field.widthPercent || (field.width === 'half' ? 50 : 100))}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}