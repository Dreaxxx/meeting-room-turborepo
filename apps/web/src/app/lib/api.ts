import { http } from './central';
import type {
    Room, CreateRoomDto,
    Reservation, CreateReservationDto,
} from './types';

const data = <T>(p: Promise<{ data: T }>) => p.then(r => r.data);

export const api = {
    rooms: {
        list: () => data<Room[]>(http.get('/rooms')),
        get: (id: string) => data<Room>(http.get(`/rooms/${id}`)),
        create: (dto: CreateRoomDto) => data<Room>(http.post('/rooms', dto)),
    },
    reservations: {
        list: () => data<Reservation[]>(http.get('/reservations')),
        get: (id: string) => data<Reservation>(http.get(`/reservations/${id}`)),
        create: (dto: CreateReservationDto) => data<Reservation>(http.post('/reservations', dto)),
        patch: (id: string, dto: Partial<CreateReservationDto>) => data<Reservation>(http.patch(`/reservations/${id}`, dto)),
        delete: (id: string) => data<void>(http.delete(`/reservations/${id}`)),
    },
    stats: {
        topRooms: (params: URLSearchParams) =>
            data<{ roomId: string; count: number; room?: Room | null }[]>(
                http.get(`/stats/top-rooms?${params.toString()}`)
            ),
        avgDuration: (params: URLSearchParams) =>
            data<{ avgMinutes: number }>(http.get(`/stats/avg-meeting-duration?${params.toString()}`)),
    },
};
