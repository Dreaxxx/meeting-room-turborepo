export type Room = { id: string; name: string; capacity: number; };
export type CreateRoomDto = { name: string; capacity: number; };

export type Reservation = {
    id: string;
    title: string;
    roomId: string;
    startsAt: string;
    endsAt: string;
};
export type CreateReservationDto = {
    roomId: string;
    title: string;
    startsAt: string;
    endsAt: string;
};