import { http, HttpResponse } from 'msw';

// helpers de réponse
const json = (data: any, init?: number | ResponseInit) =>
    HttpResponse.json(data, typeof init === 'number' ? { status: init } : init);

// Mettez des wildcards '*/path' pour matcher quel que soit le host/baseURL
export const handlers = [
    // Rooms list
    http.get('*/rooms', () =>
        json([{ id: 'A', name: 'Orion', capacity: 4 }, { id: 'B', name: 'Vega', capacity: 8 }])
    ),

    // Top rooms
    http.get('*/stats/top-rooms', ({ request }) => {
        const url = new URL(request.url);
        const limit = Number(url.searchParams.get('limit') ?? '3');
        const data = [
            { roomId: 'A', count: 5, room: { id: 'A', name: 'Orion', capacity: 4 } },
            { roomId: 'B', count: 3, room: { id: 'B', name: 'Vega', capacity: 8 } },
            { roomId: 'C', count: 2, room: { id: 'C', name: 'Rigel', capacity: 6 } },
        ].slice(0, limit);
        return json(data);
    }),

    // Avg meeting duration
    http.get('*/stats/avg-meeting-duration', () =>
        json({ avgMinutes: 42 })
    ),

    // Create reservation
    http.post('*/reservations', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return json({ id: 'new-id', ...body }, 201);
    }),
];
