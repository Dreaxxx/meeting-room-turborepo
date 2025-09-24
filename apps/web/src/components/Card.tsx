import { PropsWithChildren } from 'react';

type CardProps = PropsWithChildren<{
    title?: string;
    right?: React.ReactNode;
    padding?: number;
}>;

export default function Card({ title, right, children, padding = 16 }: CardProps) {
    return (
        <div className="card" style={{ borderRadius: 12, padding, boxShadow: '0 4px 12px rgba(0,0,0,.06)' }}>
            {(title || right) && (
                <div className="row" style={{ alignItems: 'center', marginBottom: 12 }}>
                    {title && <div className="h1" style={{ margin: 0 }}>{title}</div>}
                    {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
                </div>
            )}
            {children}
        </div>
    );
}
