import React, { useRef, useState } from 'react';

export default function FormCanvas({
  fields,
  onDropField,
  onDragOverField,
  onLabelChange,
  onRemoveField,
  onMoveField,
  draggingIndex,
  setDraggingIndex,
  toggleFieldWidth
}) {
  const dragOverIndex = useRef(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleDragStart = (idx) => {
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
              style={{ width: field.width === 'half' ? '50%' : '100%' }}
              onDragOver={(e) => {
                e.preventDefault();
                handleDragEnter(idx);
              }}
            >
              <div
                className={`p-3 border rounded bg-white shadow-sm text-xs ${draggingIndex === idx ? 'opacity-50' : ''
                  }`}
                draggable
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}