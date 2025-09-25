'use client';

import Card from '@/components/Card';
import ControlsBar from '@/components/ControlsBar';
import { Field } from '@/components/Field';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Room, CreateRoomDto } from '../lib/types';
import EmptyDiv from '@/components/EmptyDiv';
import { AxiosError } from 'axios';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState<number>(4);
  const [message, setMessage] = useState('');

  const load = () => api.rooms.list().then(setRooms);

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const submit = async () => {
    setMessage('');
    try {
      const dto: CreateRoomDto = { name, capacity };
      await api.rooms.create(dto);
      setMessage('✅ Salle créée');
      await load();
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

  return (
    <div className="grid" style={{ gap: 24 }}>
      <Card title="Créer une salle" right={null}>
        <ControlsBar>
          <Field label="Nom de la salle">
            <input
              data-testid="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label="Capacité">
            <input
              data-testid="capacity"
              className="input"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </Field>

          <button className="btn" onClick={submit} style={{ height: 38 }}>
            Créer
          </button>
          <span style={{ marginLeft: 12 }}>{message}</span>
        </ControlsBar>
      </Card>

      <Card title="Salles">
        <div className="grid" style={{ gap: 12 }}>
          {rooms.map((r) => (
            <div
              key={r.id}
              className="card"
              style={{ padding: 14, borderRadius: 12, border: '1px solid #eee' }}
            >
              <div style={{ fontWeight: 700 }}>{r.name}</div>
              <div style={{ opacity: 0.75 }}>Capacité : {r.capacity}</div>
            </div>
          ))}
          {!rooms.length && <EmptyDiv>Aucune salle</EmptyDiv>}
        </div>
      </Card>
    </div>
  );
}
