import React, { useRef, useState, useEffect } from 'react';

export default function FormCanvas({
  fields,
  onDropField,
  onDragOverField,
  onLabelChange,
  onRemoveField,
  onMoveField,
  draggingIndex,
  setDraggingIndex,
  toggleFieldWidth,
  updateFieldSize
}) {
  const dragOverIndex = useRef(null);
  const [resizing, setResizing] = useState(null); // Track which field is being resized
  const startSizeRef = useRef(null);
  const startPosRef = useRef(null);

  // Drag-and-drop field handling
  const handleDragStart = (idx) => {
    if (resizing !== null) return; // Don't allow drag when resizing
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
    e.stopPropagation(); // Prevent bubbling to parent drop handlers

    if (draggingIndex !== null) {
      onMoveField(draggingIndex, index);
      setDraggingIndex(null);
    }
  };

  // Field resizing functionality
  const startResize = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(idx);
    startPosRef.current = { x: e.clientX, y: e.clientY };

    // Get current width percentage
    const fieldWidth = fields[idx].width === 'half' ? 50 : 100;
    const fieldHeight = fields[idx].height || 'auto';
    startSizeRef.current = { width: fieldWidth, height: fieldHeight };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);
  };

  const handleMouseMove = (e) => {
    if (resizing === null) return;

    // Calculate horizontal resize
    const deltaX = e.clientX - startPosRef.current.x;
    const containerWidth = document.querySelector('.flex-wrap').clientWidth;
    const percentageDelta = (deltaX / containerWidth) * 100;

    // Calculate vertical resize
    const deltaY = e.clientY - startPosRef.current.y;

    // Calculate new width as percentage (clamped between 25% and 100%)
    let newWidthPercent = Math.min(100, Math.max(25, startSizeRef.current.width + percentageDelta));

    // Snap to 50% or 100%
    if (newWidthPercent > 75) {
      newWidthPercent = 100;
    } else if (newWidthPercent > 35 && newWidthPercent < 65) {
      newWidthPercent = 50;
    } else if (newWidthPercent <= 35) {
      newWidthPercent = 33;
    }

    // Calculate new height in pixels
    let newHeight = startSizeRef.current.height;
    if (typeof newHeight === 'number') {
      newHeight = Math.max(60, newHeight + deltaY);
    } else if (deltaY > 20) {
      // Convert from 'auto' to pixels once we've dragged enough
      newHeight = 60 + deltaY;
    }

    // Update field size
    updateFieldSize(resizing, newWidthPercent, newHeight);
  };

  const stopResize = () => {
    setResizing(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResize);
  };

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
    };
  }, [resizing]);

  // Calculate width style based on percentage
  const getWidthStyle = (field) => {
    if (field.widthPercent) {
      return `${field.widthPercent}%`;
    }
    return field.width === 'half' ? '50%' : '100%';
  };

  // Calculate height style
  const getHeightStyle = (field) => {
    return typeof field.height === 'number' ? `${field.height}px` : 'auto';
  };

  return (
    <div
      className="h-full flex flex-col p-4 bg-gray-50"
      onDrop={onDropField}
      onDragOver={onDragOverField}
    >
      <h4 className="font-medium mb-3 text-sm">Form Canvas</h4>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {fields.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-8 border border-dashed border-gray-300 rounded">
            Drag fields here
          </div>
        )}

        <div className="flex flex-wrap -mx-2">
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
                  }`}
                style={{
                  height: getHeightStyle(field),
                  transition: resizing === idx ? 'none' : 'height 0.2s ease'
                }}
                draggable={resizing === null}
                onDragStart={() => handleDragStart(idx)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, idx)}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500 lowercase">{field.type}:</span>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => onLabelChange(idx, e.target.value)}
                      className="border-b border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    {toggleFieldWidth && (
                      <button
                        onClick={() => toggleFieldWidth(idx)}
                        className="text-blue-500 hover:text-blue-700 text-xs px-1"
                        title={`Toggle to ${field.width === 'half' ? 'full' : 'half'} width`}
                      >
                        {field.width === 'half' ? '½' : 'Full'}
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveField(idx)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="pl-1">
                  {field.type === 'text' && <input disabled placeholder="Text input" className="border p-1 rounded w-full opacity-50" />}
                  {field.type === 'number' && <input disabled type="number" placeholder="0" className="border p-1 rounded w-full opacity-50" />}
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

                {/* Resize handle - bottom right corner */}
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-10"
                  onMouseDown={(e) => startResize(e, idx)}
                  style={{
                    background: 'linear-gradient(135deg, transparent 50%, rgba(59, 130, 246, 0.4) 50%)',
                    borderBottomRightRadius: '0.25rem'
                  }}
                  title="Resize field"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}