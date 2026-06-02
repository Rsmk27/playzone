import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders the PlayZone heading on the home page', () => {
    render(<App />);
    const headingElements = screen.getAllByText(/PlayZone/i);
    expect(headingElements.length).toBeGreaterThan(0);
    expect(headingElements[0]).toBeInTheDocument();
  });
});
