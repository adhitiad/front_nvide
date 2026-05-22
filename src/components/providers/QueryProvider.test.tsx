import { render, screen } from '@testing-library/react';
import QueryProvider from './QueryProvider';

describe('QueryProvider', () => {
  it('renders children correctly', () => {
    render(
      <QueryProvider>
        <div data-testid="child-element">Test Child</div>
      </QueryProvider>
    );
    
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });
});
