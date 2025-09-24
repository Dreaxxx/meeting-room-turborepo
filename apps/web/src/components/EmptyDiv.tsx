type EmptyProps = { children?: React.ReactNode; icon?: React.ReactNode };

export default function EmptyDiv({ children = 'Aucune donnée', icon }: EmptyProps) {
    return (
        <div
            style={{
                padding: 24,
                border: '1px dashed #e5e7eb',
                borderRadius: 12,
                background: '#fcfcfd',
                textAlign: 'center',
                color: '#6b7280',
            }}
        >
            {icon && <div style={{ marginBottom: 8 }}>{icon}</div>}
            {children}
        </div>
    );
}
