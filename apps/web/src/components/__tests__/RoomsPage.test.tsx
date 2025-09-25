import { screen } from '@testing-library/react';
import RoomsPage from '@/app/rooms/page';
import { renderWithClient } from '@/test/msw/test-utils';
import userEvent from '@testing-library/user-event';

describe('RoomsPage', () => {
  it('display rooms list from API', async () => {
    renderWithClient(<RoomsPage />);

    expect(await screen.findByText('Orion')).toBeInTheDocument();
    expect(await screen.findByText('Vega')).toBeInTheDocument();

    expect(await screen.findByText(/4/i)).toBeInTheDocument();
    expect(await screen.findByText(/8/i)).toBeInTheDocument();
  });

  it('create a room', async () => {
    renderWithClient(<RoomsPage />);

    const user = userEvent.setup();

    await user.type(screen.getByTestId(/name/i), 'Lyra');
    await user.clear(screen.getByTestId(/capacity/i));
    await user.type(screen.getByTestId(/capacity/i), '6');

    await user.click(screen.getByRole('button', { name: /créer/i }));

    expect(await screen.findByText(/salle créée/i)).toBeInTheDocument();
  });
});
