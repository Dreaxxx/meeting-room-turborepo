type KPIProps = {
    label: string;
    value: string | number;
    subtle?: string;
};

export function KPI({ label, value, subtle }: KPIProps) {
    return (
        <div
            className="card"
            style={{
                padding: 16,
                borderRadius: 12,
                background: 'linear-gradient(180deg, #fff, #fafafa)',
                border: '1px solid #eee',
            }}
        >
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.4, opacity: .65 }}>
                {label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{value}</div>
            {subtle && <div style={{ fontSize: 12, opacity: .6, marginTop: 4 }}>{subtle}</div>}
        </div>
    );
}
