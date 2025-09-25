import { Room } from '@/app/lib/types';
import { http, HttpResponse } from 'msw';

type CustomData =
  | string
  | number
  | boolean
  | { roomId: string; count: number; room?: Room | null }[]
  | { id: string; name: string; capacity: number }[]
  | { id: string; [key: string]: unknown }
  | { [key: string]: unknown }
  | null
  | undefined;

const json = (data: CustomData, init?: number | ResponseInit) =>
  HttpResponse.json(data, typeof init === 'number' ? { status: init } : init);

export const handlers = [
  http.get('/api/rooms', () =>
    json([
      { id: 'A', name: 'Orion', capacity: 4 },
      { id: 'B', name: 'Vega', capacity: 8 },
    ]),
  ),

  http.post('/api/rooms', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return json({ id: 'new-id', ...body }, 201);
  }),

  http.get('/api/stats/top-rooms', ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '3');
    const data: { roomId: string; count: number; room?: Room | null }[] = [
      { roomId: 'A', count: 5, room: { id: 'A', name: 'Orion', capacity: 4 } },
      { roomId: 'B', count: 3, room: { id: 'B', name: 'Vega', capacity: 8 } },
      { roomId: 'C', count: 2, room: { id: 'C', name: 'Rigel', capacity: 6 } },
    ].slice(0, limit);
    return json(data);
  }),

  http.get('/api/stats/avg-meeting-duration', () => json({ avgMinutes: 42 })),

  http.post('/api/reservations', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return json({ id: 'new-id', ...body }, 201);
  }),

  http.delete('/api/reservations/:id', () => json(null, 204)),
];
