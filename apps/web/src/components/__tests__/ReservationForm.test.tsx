import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReservationsPage from '@/app/reservations/page';
import { renderWithClient } from '@/test/msw/test-utils';

describe('ReservationForm', () => {
    it('valide les champs et POST la réservation', async () => {
        const user = userEvent.setup();

        renderWithClient(<ReservationsPage />);

        // Remplit le formulaire
        await user.type(screen.getByTestId(/title/i), 'Réunion projet');
        await user.selectOptions(screen.getByTestId(/room/i), 'Vega');
        await user.type(screen.getByTestId(/start/i), '2025-09-24T10:00');
        await user.type(screen.getByTestId(/end/i), '2025-09-24T11:00');

        // Submit
        await user.click(screen.getByRole('button', { name: /Réserver/i }));

        // Attendre que l’API (MSW) réponde
        expect(await screen.findByText(/Réservation créée/i)).toBeInTheDocument();
    });

    it('affiche une erreur si fin <= debut', async () => {
        const user = userEvent.setup();
        renderWithClient(<ReservationsPage />);

        await user.type(screen.getByTestId(/title/i), 'Oops');
        await user.selectOptions(screen.getByTestId(/room/i), 'Orion');
        await user.type(screen.getByTestId(/start/i), '2025-09-24T12:00');
        await user.type(screen.getByTestId(/end/i), '2025-09-24T09:00');
        await user.click(screen.getByRole('button', { name: /Réserver/i }));

        expect(await screen.findByText(/Error :/)).toBeInTheDocument();
    });
});
