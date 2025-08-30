import React from 'react';

const FIELD_TYPES = [
  { type: 'text', label: 'Text Field' },
  { type: 'number', label: 'Number Field' },
  { type: 'date', label: 'Date Field' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'radio', label: 'Radio Button' },
];

export default function FieldPalette({ onDragStart }) {
  return (
    <div className="p-3">
      <h4 className="font-medium mb-3 text-sm">Field Palette</h4>
      <ul className="space-y-2">
        {FIELD_TYPES.map((field) => (
          <li
            key={field.type}
            draggable
            onDragStart={() => onDragStart(field)}
            className="p-2 border rounded bg-gray-50 hover:bg-blue-50 cursor-move text-xs transition"
          >
            {field.label}
          </li>
        ))}
      </ul>
    </div>
  );
}