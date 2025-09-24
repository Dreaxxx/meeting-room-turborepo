'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Room } from '../../lib/types';

export function useRooms() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.rooms.list();
            setRooms(data);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        reload().catch(console.error);
    }, [reload]);

    return { rooms, loading, error, reload, setRooms };
}
