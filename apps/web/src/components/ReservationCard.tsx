import { Reservation } from '@/app/lib/types';

type ReservationCardProps = Reservation & {
  deleteReservation: (id: string) => void;
};

export default function ReservationCard({
  title,
  id,
  room,
  startsAt,
  endsAt,
  deleteReservation,
}: ReservationCardProps) {
  return (
    <div
      key={id}
      className="card"
      style={{ padding: 14, borderRadius: 12, border: '1px solid #eee' }}
    >
      <div style={{ fontWeight: 700 }}>{title}</div>
      <div style={{ opacity: 0.75 }}>Salle : {room?.name}</div>
      <div>De : {new Date(startsAt).toLocaleString()}</div>
      <div>À : {new Date(endsAt).toLocaleString()}</div>

      <div style={{ marginTop: 12 }} className="row">
        <button className="btn" onClick={() => deleteReservation(id)}>
          Supprimer
        </button>
      </div>
    </div>
  );
}
