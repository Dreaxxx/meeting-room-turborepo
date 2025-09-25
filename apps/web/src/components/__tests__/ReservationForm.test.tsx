import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReservationsPage from '@/app/reservations/page';
import { renderWithClient } from '@/test/msw/test-utils';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';

describe('ReservationForm', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/rooms', () =>
        HttpResponse.json([
          { id: 'A', name: 'Orion', capacity: 4 },
          { id: 'B', name: 'Vega', capacity: 8 },
        ]),
      ),
      http.get('/api/reservations', () =>
        HttpResponse.json([
          {
            id: 'r1',
            title: 'Team Meeting 3',
            room: { id: 'A', name: 'Orion', capacity: 4 },
            startsAt: '2025-09-24T14:00:00.000Z',
            endsAt: '2025-09-24T18:00:00.000Z',
          },
        ]),
      ),
    );
  });

  it('validate fields and create a reservation', async () => {
    server.use(
      http.post('/api/reservations', async () =>
        HttpResponse.json(
          {
            id: 'new-id',
            title: 'Réunion projet',
            roomId: 'B',
            startsAt: '2025-09-26T10:00:00.000Z',
            endsAt: '2025-09-26T11:00:00.000Z',
          },
          { status: 201 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<ReservationsPage />);

    await screen.findByRole('option', { name: 'Vega' });

    await user.selectOptions(screen.getByTestId(/room/i), 'B');
    await user.type(screen.getByTestId(/title/i), 'Réunion projet');

    const start = screen.getByTestId(/start/i);
    const end = screen.getByTestId(/end/i);
    await user.clear(start);
    await user.type(start, '2025-09-26T10:00');
    await user.clear(end);
    await user.type(end, '2025-09-26T11:00');

    await user.click(screen.getByRole('button', { name: /réserver/i }));

    expect(await screen.findByText(/réservation créée/i)).toBeInTheDocument();
  });

  it('display an error if end is before start', async () => {
    server.use(
      http.post('/api/reservations', async () =>
        HttpResponse.json({ message: 'endsAt must be after startsAt' }, { status: 400 }),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<ReservationsPage />);

    await screen.findByRole('option', { name: 'Orion' });

    await user.selectOptions(screen.getByTestId(/room/i), 'A');
    await user.type(screen.getByTestId(/title/i), 'Oops');

    const start = screen.getByTestId(/start/i);
    const end = screen.getByTestId(/end/i);
    await user.clear(start);
    await user.type(start, '2025-09-26T12:00');
    await user.clear(end);
    await user.type(end, '2025-09-26T09:00');

    await user.click(screen.getByRole('button', { name: /réserver/i }));

    expect(await screen.findByText(/endsAt.*after.*startsAt/i)).toBeInTheDocument();
    expect(screen.queryByText(/réservation créée/i)).not.toBeInTheDocument();
  });

  it('display an error if room is full', async () => {
    server.use(
      http.post('/api/reservations', async () =>
        HttpResponse.json({ message: 'Room is full' }, { status: 400 }),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<ReservationsPage />);

    await screen.findByRole('option', { name: 'Orion' });

    await user.selectOptions(screen.getByTestId(/room/i), 'A');
    await user.type(screen.getByTestId(/title/i), 'Oops');

    const start = screen.getByTestId(/start/i);
    const end = screen.getByTestId(/end/i);
    await user.clear(start);
    await user.type(start, '2025-09-26T10:00');
    await user.clear(end);
    await user.type(end, '2025-09-26T11:00');

    await user.click(screen.getByRole('button', { name: /réserver/i }));

    expect(await screen.findByText(/Room is full/i)).toBeInTheDocument();
    expect(screen.queryByText(/réservation créée/i)).not.toBeInTheDocument();
  });

  it('should delete a reservation', async () => {
    renderWithClient(<ReservationsPage />);

    expect(await screen.findByText('Team Meeting 3')).toBeInTheDocument();

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /supprimer/i }));

    expect(await screen.findByText(/réservation supprimée/i)).toBeInTheDocument();
  });
});
