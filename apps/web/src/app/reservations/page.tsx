'use client';

import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import Card from '@/components/Card';
import { Field } from '@/components/Field';
import { api } from '../lib/api';
import { Room, Reservation, CreateReservationDto } from '../lib/types';
import RoomSelector from '@/components/RoomSelector';
import EmptyDiv from '@/components/EmptyDiv';
import ReservationCard from '@/components/ReservationCard';

export default function ReservationsPage() {
  const [, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [title, setTitle] = useState('');
  const [roomId, setRoomId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [message, setMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  const loadReservations = () => api.reservations.list().then(setReservations);

  useEffect(() => {
    loadReservations().catch(console.error);
  }, []);

  useEffect(() => {
    api.rooms
      .list()
      .then((rs) => {
        setRooms(rs);
        if (rs[0]) setRoomId(rs[0].id);
      })
      .catch(console.error);
  }, []);

  const submit = async () => {
    setMessage('');
    try {
      const dto: CreateReservationDto = {
        roomId,
        title,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      };
      await api.reservations.create(dto);
      setMessage('✅ Réservation créée');
      await loadReservations();
    } catch (e: unknown) {
      if (e instanceof AxiosError && e.response) {
        setMessage(`Error : ${e.response.data.message || e.message}`);
        return;
      }
      if (e instanceof Error) {
        setMessage(`Error : ❌ ${e.message}`);
        return;
      }
      setMessage('Error : ❌ Erreur inconnue');
    }
  };

  const deleteReservation = async (id: string) => {
    setDeleteMessage('');
    try {
      await api.reservations.delete(id);
      setDeleteMessage('✅ Réservation supprimée');
      await loadReservations();
    } catch (e: unknown) {
      if (e instanceof AxiosError && e.response) {
        setDeleteMessage(`Error : ${e.response.data.message || e.message}`);
        return;
      }
      if (e instanceof Error) {
        setDeleteMessage(`Error : ❌ ${e.message}`);
        return;
      }
      setDeleteMessage('Error : ❌ Erreur inconnue');
    }
  };

  return (
    <div className="grid" style={{ gap: 24 }}>
      <Card title="Créer une réservation">
        <div className="grid grid-2" style={{ gap: 16 }}>
          <RoomSelector value={roomId} onChange={setRoomId} label="Salle" />
          <Field label="Titre de la réservation">
            <input
              data-testid="title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="Débute à">
            <input
              data-testid="start"
              className="input"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </Field>
          <Field label="Termine à">
            <input
              data-testid="end"
              className="input"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </Field>
        </div>
        <div style={{ marginTop: 12 }} className="row">
          <button className="btn" onClick={submit}>
            Réserver
          </button>
          <span style={{ marginLeft: 12 }}>{message}</span>
        </div>
      </Card>

      <Card title="Réservations de salles">
        <div className="grid" style={{ gap: 12 }}>
          {reservations.map((r) => (
            <ReservationCard key={r.id} {...r} deleteReservation={deleteReservation} />
          ))}
          {deleteMessage && <span style={{ marginLeft: 12 }}>{deleteMessage}</span>}
          {!reservations.length && <EmptyDiv>Aucune réservation</EmptyDiv>}
        </div>
      </Card>
    </div>
  );
}
