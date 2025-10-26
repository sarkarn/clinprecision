import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  // Basic smoke test - just verify app renders
  expect(document.body).toBeInTheDocument();
});
