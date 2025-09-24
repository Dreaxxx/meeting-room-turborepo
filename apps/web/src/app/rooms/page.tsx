'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Room, CreateRoomDto } from '../lib/types';

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState<number>(4);

    const load = () => api.rooms.list().then(setRooms);
    useEffect(() => { load().catch(console.error); }, []);

    const submit = async () => {
        try {
            const dto: CreateRoomDto = { name, capacity };
            await api.rooms.create(dto);
            setName(''); setCapacity(4);
            await load();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="grid" style={{ gap: 24 }}>
            <div className="card">
                <div className="h1">Create room</div>
                <div className="row">
                    <div>
                        <label className="label">Name</label>
                        <input className="input" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="label">Capacity</label>
                        <input className="input" type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} />
                    </div>
                    <button className="btn" onClick={submit}>Create</button>
                </div>
            </div>

            <div className="card">
                <div className="h1">Rooms</div>
                <div className="grid">
                    {rooms.map(r => (
                        <div key={r.id} className="card">
                            <div><b>{r.name}</b></div>
                            <div>Capacity: {r.capacity}</div>
                        </div>
                    ))}
                    {!rooms.length && <div>Aucune salle</div>}
                </div>
            </div>
        </div>
    );
}
