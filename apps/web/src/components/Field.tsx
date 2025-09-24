import { PropsWithChildren } from 'react';

type FieldProps = PropsWithChildren<{ label: string; help?: string; width?: number | string }>;

export function Field({ label, help, width, children }: FieldProps) {
    return (
        <div style={{ minWidth: 220, width }}>
            <label className="label" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
            {children}
            {help && <div style={{ fontSize: 12, opacity: .7, marginTop: 4 }}>{help}</div>}
        </div>
    );
}
