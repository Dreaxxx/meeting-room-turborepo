import { screen } from '@testing-library/react';
import RoomsPage from '@/app/rooms/page';
import { renderWithClient } from '@/test/msw/test-utils';

describe('RoomsPage', () => {
    it('display rooms list from API', async () => {
        renderWithClient(<RoomsPage />);

        expect(await screen.findByText('Orion')).toBeInTheDocument();
        expect(await screen.findByText('Vega')).toBeInTheDocument();

        expect(await screen.findByText(/4/i)).toBeInTheDocument();
        expect(await screen.findByText(/8/i)).toBeInTheDocument();
    });
});
