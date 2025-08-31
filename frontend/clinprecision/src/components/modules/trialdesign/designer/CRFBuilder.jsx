import React, { useState, useRef, useEffect } from 'react';
import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';

const MIN_WIDTH = 700;
const MIN_CANVAS_HEIGHT = 400;

const CRFBuilder = ({ onSave, onCancel }) => {
  const [fields, setFields] = useState([]);
  const [crfName, setCrfName] = useState('');
  const [draggedField, setDraggedField] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // size represents the canvas size
  const [size, setSize] = useState({
    width: 1200,
    height: 600
  });

  const containerRef = useRef(null);
  const startPosRef = useRef(null);
  const startSizeRef = useRef(null);
  const [resizing, setResizing] = useState(false);

  // Palette drag start
  const handlePaletteDragStart = (field) => {
    setDraggedField(field);
  };

  // Drop on canvas from palette
  const handleDropField = (e) => {
    e.preventDefault();

    // Only process if we have a field from the palette
    // This prevents conflicts with field reordering drops
    if (draggedField && draggingIndex === null) {
      setFields(prev => [...prev, {
        ...draggedField,
        label: draggedField.label,
        width: 'half', // Default to half-width for side-by-side
        widthPercent: 50, // Store explicit percentage for resizing
        height: 'auto' // Default height is auto
      }]);
      setDraggedField(null);
    }
  };

  const handleDragOverField = (e) => {
    e.preventDefault();
  };

  const handleLabelChange = (idx, newLabel) =>
    setFields(f => f.map((fld, i) => i === idx ? { ...fld, label: newLabel } : fld));

  const handleRemoveField = (idx) =>
    setFields(f => f.filter((_, i) => i !== idx));

  const handleMoveField = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    setFields(f => {
      const clone = [...f];
      const [moved] = clone.splice(fromIdx, 1);
      clone.splice(toIdx, 0, moved);
      return clone;
    });
  };

  // Toggle field width between full and half
  const toggleFieldWidth = (idx) => {
    setFields(fields.map((field, i) => {
      if (i === idx) {
        const newWidth = field.width === 'full' ? 'half' : 'full';
        const newWidthPercent = newWidth === 'half' ? 50 : 100;
        return { ...field, width: newWidth, widthPercent: newWidthPercent };
      }
      return field;
    }));
  };

  // Update field size with specific dimensions
  const updateFieldSize = (idx, widthPercent, height) => {
    setFields(fields.map((field, i) => {
      if (i === idx) {
        // Update width classification based on percentage
        let width = 'custom';
        if (widthPercent === 100) width = 'full';
        else if (widthPercent === 50) width = 'half';
        else if (widthPercent === 33) width = 'third';

        return {
          ...field,
          width,
          widthPercent,
          height
        };
      }
      return field;
    }));
  };

  // Resize functionality for the canvas
  const startResize = (e) => {
    e.preventDefault();
    setResizing(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = { width: size.width, height: size.height };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);
  };

  const handleMouseMove = (e) => {
    if (!resizing) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    const newW = Math.max(MIN_WIDTH, startSizeRef.current.width + dx);
    const newH = Math.max(MIN_CANVAS_HEIGHT, startSizeRef.current.height + dy);
    setSize({ width: newW, height: newH });
  };

  const stopResize = () => {
    setResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResize);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
    };
  }, [resizing]);

  // Save form
  const handleSaveForm = () => {
    if (!crfName.trim()) return alert('Please enter a CRF name.');
    if (fields.length === 0) return alert('Please add at least one field.');
    onSave({
      name: crfName,
      type: 'custom',
      description: `Custom CRF with ${fields.length} fields`,
      fields
    });
    setCrfName('');
    setFields([]);
  };

  // Form Preview component
  const FormPreview = () => {
    return (
      <div className="h-full w-full overflow-auto p-6 bg-white">
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg border p-6">
          <h3 className="text-lg font-semibold border-b pb-3 mb-4">{crfName || "CRF Preview"}</h3>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No fields added yet. Add fields to see the preview.
            </div>
          ) : (
            <div className="flex flex-wrap -mx-2">
              {fields.map((field, idx) => {
                // Get field width style for preview
                const widthStyle = field.widthPercent ?
                  `${field.widthPercent}%` :
                  (field.width === 'half' ? '50%' : '100%');

                // Get field height style for preview
                const heightStyle = typeof field.height === 'number' ?
                  `${field.height}px` : 'auto';

                return (
                  <div
                    key={idx}
                    className="px-2 mb-4"
                    style={{ width: widthStyle }}
                  >
                    <div
                      className="mb-2"
                      style={{
                        minHeight: heightStyle !== 'auto' ? heightStyle : 'auto'
                      }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>

                      {field.type === 'text' && (
                        <input
                          type="text"
                          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}

                      {field.type === 'number' && (
                        <input
                          type="number"
                          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}

                      {field.type === 'date' && (
                        <input
                          type="date"
                          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}

                      {field.type === 'checkbox' && (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Option</span>
                        </div>
                      )}

                      {field.type === 'radio' && (
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name={`radio_${idx}`}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Option</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="w-full pt-4 border-t flex justify-end space-x-3">
                <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded">
                  Cancel
                </button>
                <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded">
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-block bg-white shadow rounded-lg border overflow-visible"
      style={{
        width: `${size.width}px`,
        marginLeft: '-60px'
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">CRF Builder</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPreview(true)}
              className={`px-3 py-1 text-sm rounded ${showPreview
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'}`}
            >
              Preview
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Enter CRF Name"
            value={crfName}
            onChange={e => setCrfName(e.target.value)}
            className="border rounded px-3 py-2 w-1/2 text-sm"
          />
        </div>
      </div>

      {/* Workspace */}
      <div
        className="flex gap-4 px-4 py-3"
        style={{
          height: `${size.height}px`,
          boxSizing: 'content-box'
        }}
      >
        {showPreview ? (
          <FormPreview />
        ) : (
          <>
            {/* Palette */}
            <div className="w-1/5 min-w-[180px] h-full overflow-y-auto rounded border bg-white">
              <FieldPalette onDragStart={handlePaletteDragStart} />
            </div>

            {/* Canvas */}
            <div className="flex-1 h-full overflow-hidden rounded border bg-white">
              <FormCanvas
                fields={fields}
                onDropField={handleDropField}
                onDragOverField={handleDragOverField}
                onLabelChange={handleLabelChange}
                onRemoveField={handleRemoveField}
                onMoveField={handleMoveField}
                draggingIndex={draggingIndex}
                setDraggingIndex={setDraggingIndex}
                toggleFieldWidth={toggleFieldWidth}
                updateFieldSize={updateFieldSize}
              />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t flex justify-end gap-3 bg-white">
        <button
          onClick={onCancel}
          className="bg-gray-400 text-white text-sm px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveForm}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded"
        >
          Save CRF
        </button>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        className="absolute bottom-[48px] right-0 w-6 h-6 cursor-se-resize"
        style={{
          transform: 'translateY(50%)',
          background: 'linear-gradient(135deg, transparent 50%, rgba(37,99,235,0.55) 50%)'
        }}
        title="Resize canvas"
      />
    </div>
  );
};

export default CRFBuilder;