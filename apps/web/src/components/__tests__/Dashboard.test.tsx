import { screen } from '@testing-library/react';
import Dashboard from '@/app/page';
import { renderWithClient } from '@/test/msw/test-utils';

describe('Dashboard', () => {
    it('render every sections', async () => {
        renderWithClient(<Dashboard />);

        expect(await screen.findByText(/Tableau de bord/i)).toBeInTheDocument();
        expect(await screen.findByText(/Top 3 des salles réservées/i)).toBeInTheDocument();
        expect(await screen.findByText(/Granularité/i)).toBeInTheDocument();
    });
});
