'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Room } from './lib/types';
import { api } from './lib/api';
import Card from '@/components/Card';
import ControlsBar from '@/components/ControlsBar';
import { Field } from '@/components/Field';
import RoomSelector from '@/components/RoomSelector';
import EmptyDiv from '@/components/EmptyDiv';
import { KPI } from '@/components/KPI';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function Dashboard() {
  const [, setRooms] = useState<Room[]>([]);
  const [avg, setAvg] = useState<number>(0);
  const [top, setTop] = useState<{ roomId: string; count: number; room?: Room | null }[]>([]);
  const [roomId, setRoomId] = useState<string>('');
  const [gran, setGran] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    api.rooms.list().then(setRooms).catch(console.error);
  }, []);

  useEffect(() => {
    const from = new Date();
    from.setDate(from.getDate() - 14);

    const params = new URLSearchParams({ granularity: gran });
    if (roomId) params.set('roomId', roomId);

    api.stats
      .avgDuration(params)
      .then((r) => setAvg(r.avgMinutes ?? 0))
      .catch(console.error);

    const topParams = new URLSearchParams({
      from: from.toISOString(),
      to: new Date().toISOString(),
      limit: '3',
    });
    api.stats.topRooms(topParams).then(setTop).catch(console.error);
  }, [roomId, gran]);

  return (
    <div className="grid" style={{ gap: 24 }}>
      <Card
        title="Tableau de bord"
        right={<KPI label="Durée moyenne de réunion" value={`${Math.round(avg)} min`} />}
      >
        <ControlsBar>
          <RoomSelector value={roomId} onChange={setRoomId} includeAll />
          <Field label="Granularité">
            <select
              className="input"
              value={gran}
              onChange={(e) => setGran(e.target.value as 'daily' | 'weekly' | 'monthly')}
            >
              <option value="daily">Journalier</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuel</option>
            </select>
          </Field>
        </ControlsBar>
      </Card>

      <Card title="Top 3 des salles réservées">
        <div className="grid grid-2" style={{ gap: 16 }}>
          {top.map((t) => (
            <div
              key={t.roomId}
              className="card"
              style={{ padding: 16, borderRadius: 12, border: '1px solid #eee' }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.room?.name ?? t.roomId}</div>
              <div style={{ opacity: 0.75 }}>
                Réservations: <b>{t.count}</b>
              </div>
            </div>
          ))}
          {!top.length && <EmptyDiv>Aucune réservation</EmptyDiv>}
        </div>
      </Card>
    </div>
  );
}
