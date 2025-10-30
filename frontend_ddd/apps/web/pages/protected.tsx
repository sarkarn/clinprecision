import React from 'react';
import ProtectedRoute from '../src/routes/ProtectedRoute';
import Home from '../src/routes/Home';

const ProtectedPage = () => (
  <ProtectedRoute requiredRole={undefined}>
    <Home />
  </ProtectedRoute>
);

export default ProtectedPage;
