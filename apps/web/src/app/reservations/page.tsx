'use client';

import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import Card from '@/components/Card';
import { Field } from '@/components/Field';
import { api } from '../lib/api';
import { Room, Reservation, CreateReservationDto } from '../lib/types';
import RoomSelector from '@/components/RoomSelector';
import EmptyDiv from '@/components/EmptyDiv';

export default function ReservationsPage() {
    const [, setRooms] = useState<Room[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [title, setTitle] = useState('');
    const [roomId, setRoomId] = useState('');
    const [startsAt, setStartsAt] = useState('');
    const [endsAt, setEndsAt] = useState('');
    const [message, setMessage] = useState('');

    const loadReservations = () => api.reservations.list().then(setReservations);

    useEffect(() => {
        loadReservations().catch(console.error);
    }, []);

    useEffect(() => {
        api.rooms.list()
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
        <div className="grid" style={{ gap: 24 }}>
            <Card title="Créer une réservation">
                <div className="grid grid-2" style={{ gap: 16 }}>
                    <RoomSelector value={roomId} onChange={setRoomId} label="Salle" />
                    <Field label="Titre de la salle">
                        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </Field>
                    <Field label="Débute à">
                        <input
                            className="input"
                            type="datetime-local"
                            value={startsAt}
                            onChange={(e) => setStartsAt(e.target.value)}
                        />
                    </Field>
                    <Field label="Termine à">
                        <input
                            className="input"
                            type="datetime-local"
                            value={endsAt}
                            onChange={(e) => setEndsAt(e.target.value)}
                        />
                    </Field>
                </div>
                <div style={{ marginTop: 12 }} className="row">
                    <button className="btn" onClick={submit}>Réserver</button>
                    <span style={{ marginLeft: 12 }}>{message}</span>
                </div>
            </Card>

            <Card title="Réservations de salles">
                <div className="grid" style={{ gap: 12 }}>
                    {reservations.map((r) => (
                        <div key={r.id} className="card" style={{ padding: 14, borderRadius: 12, border: '1px solid #eee' }}>
                            <div style={{ fontWeight: 700 }}>{r.title}</div>
                            <div style={{ opacity: .75 }}>Salle : {r.room?.name}</div>
                            <div>De : {new Date(r.startsAt).toLocaleString()}</div>
                            <div>À : {new Date(r.endsAt).toLocaleString()}</div>
                        </div>
                    ))}
                    {!reservations.length && <EmptyDiv>Aucune réservation</EmptyDiv>}
                </div>
            </Card>
        </div>
    );
}
