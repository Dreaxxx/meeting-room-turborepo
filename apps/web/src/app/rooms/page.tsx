'use client';

import Card from '@/components/Card';
import ControlsBar from '@/components/ControlsBar';
import { Field } from '@/components/Field';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Room, CreateRoomDto } from '../lib/types';
import EmptyDiv from '@/components/EmptyDiv';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState<number>(4);

  const load = () => api.rooms.list().then(setRooms);

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const submit = async () => {
    try {
      const dto: CreateRoomDto = { name, capacity };
      await api.rooms.create(dto);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid" style={{ gap: 24 }}>
      <Card title="Créer une salle" right={null}>
        <ControlsBar>
          <Field label="Nom de la salle">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <Field label="Capacité">
            <input
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
