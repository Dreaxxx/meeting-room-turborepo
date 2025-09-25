'use client';

import { useEffect, type ReactNode } from 'react';
import { bootstrapAuth } from './lib/auth';

export default function Providers({ children }: { children: ReactNode }) {
    useEffect(() => {
        bootstrapAuth();
    }, []);

    return <>{children}</>;
}
