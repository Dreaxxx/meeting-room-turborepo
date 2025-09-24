'use client';

import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import { Room } from './lib/types';
import { api } from './lib/api';
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
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
    const params = new URLSearchParams({
      granularity: gran,
    });

    if (roomId) params.set('roomId', roomId);

    api.stats.avgDuration(params).then((r: any) => setAvg(r.avgMinutes ?? 0)).catch(console.error);
    const topParams = new URLSearchParams({ from: from.toISOString(), to: new Date().toISOString(), limit: '3' });
    api.stats.topRooms(topParams).then(setTop).catch(console.error);
  }, [roomId, gran]);

  return (
    <div className="grid" style={{ gap: 24 }}>
      <div className="card">
        <div className="row">
          <div>
            <label className="label">Room</label>
            <select className="input" value={roomId} onChange={e => setRoomId(e.target.value)}>
              <option value="">(Toutes)</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Granularity</label>
            <select className="input" value={gran} onChange={e => setGran(e.target.value as any)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div>Avg meeting duration: <b>{Math.round(avg)} min</b></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="h1">Top 3 rooms</div>
        <div className="grid grid-2">
          {top.map(t => (
            <div key={t.roomId} className="card">
              <div><b>{t.room?.name ?? t.roomId}</b></div>
              <div>Réservations: {t.count}</div>
            </div>
          ))}
          {!top.length && <div>Aucune réservation</div>}
        </div>
      </div>
    </div>
  );
}
