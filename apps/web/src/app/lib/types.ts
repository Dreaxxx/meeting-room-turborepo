export type Room = { id: string; name: string; capacity: number };
export type CreateRoomDto = { name: string; capacity: number };

export type Reservation = {
  id: string;
  title: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
  room?: Room | null;
};

export type CreateReservationDto = {
  roomId: string;
  title: string;
  startsAt: string;
  endsAt: string;
};

export type CustomCfgConfig = { config: { retryCount?: number; startedAt?: number } };
export type ErrorResponseData = { message?: string; error?: string };
