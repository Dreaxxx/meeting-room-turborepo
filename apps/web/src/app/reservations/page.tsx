'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Room, CreateReservationDto, Reservation } from '../lib/types';
import { AxiosError } from 'axios';

export default function ReservationsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [title, setTitle] = useState('');
    const [roomId, setRoomId] = useState('');
    const [startsAt, setStartsAt] = useState('');
    const [endsAt, setEndsAt] = useState('');
    const [message, setMessage] = useState('');

    const loadReservations = () => api.reservations.list().then(setReservations);
    useEffect(() => { loadReservations().catch(console.error); }, []);

    useEffect(() => {
        api.rooms.list().then(rs => { setRooms(rs); if (rs[0]) setRoomId(rs[0].id); }).catch(console.error);
    }, []);

    const submit = async () => {
        setMessage('');
        try {
            const dto: CreateReservationDto = { roomId, title, startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString() };
            await api.reservations.create(dto);
            setMessage('✅ Réservation créée');
        } catch (e: unknown) {
            if (e instanceof AxiosError && e.response) {
                setMessage(`❌ ${e.response.data.message || e.message}`);
                return;
            }
            if (e instanceof Error) {
                setMessage(`❌ ${e.message}`);
                return;
            }
            setMessage('❌ Erreur inconnue');
        }
    };

    return (
        <div className="card">
            <div className="h1">Create reservation</div>
            <div className="grid grid-2">
                <div>
                    <label className="label">Room</label>
                    <select className="input" value={roomId} onChange={e => setRoomId(e.target.value)}>
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="label">TGitre</label>
                    <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div>
                    <label className="label">Starts at</label>
                    <input className="input" type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} />
                </div>
                <div>
                    <label className="label">Ends at</label>
                    <input className="input" type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} />
                </div>
            </div>
            <div style={{ marginTop: 12 }} className="row">
                <button className="btn" onClick={submit}>Book</button>
                <span>{message}</span>
            </div>

            <div className="card">
                <div className="h1">Reservations de salles</div>
                <div className="grid">
                    {reservations.map(r => (
                        <div key={r.id} className="card">
                            <div><b>{r.title}</b></div>
                            <div>Salle: {r.roomId}</div>
                            <div>De: {new Date(r.startsAt).toLocaleString()}</div>
                            <div>À: {new Date(r.endsAt).toLocaleString()}</div>
                        </div>
                    ))}
                    {!rooms.length && <div>Aucune salle</div>}
                </div>
            </div>
        </div>
    );
}
