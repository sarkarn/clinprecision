# ClinPrecision Platform

## Overview
ClinPrecision is a web-based platform designed to streamline clinical trial design and management. The platform features a dynamic CRF (Case Report Form) builder that allows researchers to create customized forms for clinical data collection.

## Features

### CRF Builder
- Create custom forms with a drag-and-drop interface
- Arrange fields side-by-side with flexible sizing options
- Resize fields to create optimized layouts
- Preview forms before deployment
- Support for various field types (text, number, date, checkbox, radio)

### Platform Capabilities
- Streamlined trial design workflow
- Responsive interface for desktop and mobile devices
- Real-time form previews
- Easy form management and organization

## Getting Started

### Prerequisites
- Node.js (v14.x or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/clinprecision.git
cd clinprecision
```

2. Install dependencies:
```bash
# For frontend
cd frontend/clinprecision
npm install

# For backend (if applicable)
cd ../../backend
npm install
```

3. Start the development server:
```bash
# Frontend
cd frontend/clinprecision
npm start

# Backend (if applicable)
cd ../../backend
npm start
```

## Usage

### Building a CRF

1. Navigate to the Trial Design section
2. Click "Create New CRF"
3. Drag fields from the palette on the left to the canvas
4. Configure field properties:
   - Set field labels
   - Toggle between half and full width
   - Resize fields using the resize handle
5. Preview your form using the Preview tab
6. Save your CRF when finished

### Managing Forms

1. Access your saved CRFs from the dashboard
2. Edit, duplicate, or delete forms as needed
3. Deploy forms to active trials

## Project Structure

```
clinprecision/
├── frontend/
│   ├── clinprecision/
│   │   ├── public/
│   │   └── src/
│   │       ├── components/
│   │       │   ├── modules/
│   │       │   │   └── trialdesign/
│   │       │   │       └── designer/
│   │       │   │           ├── CRFBuilder.jsx
│   │       │   │           ├── FieldPalette.jsx
│   │       │   │           └── FormCanvas.jsx
│   │       ├── App.js
│   │       └── index.js
└── backend/ (if applicable)
```

## Development

### Adding New Field Types

1. Update the `FIELD_TYPES` array in `FieldPalette.jsx`
2. Add rendering logic in `FormCanvas.jsx`
3. Update preview rendering in `CRFBuilder.jsx`

### Customizing Field Properties

Modify the field object structure in `CRFBuilder.jsx` to include additional properties.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React.js for the frontend framework
- Tailwind CSS for styling