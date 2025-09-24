'use client';

import { useRooms } from '@/app/lib/hooks/useRooms';
import { Field } from './Field';
import EmptyDiv from './EmptyDiv';

type Props = {
  value: string;
  onChange: (val: string) => void;
  includeAll?: boolean;
  label?: string;
};

export default function RoomSelector({ value, onChange, includeAll, label = 'Salle' }: Props) {
  const { rooms, loading } = useRooms();

  console.log('rooms', rooms);

  return (
    <Field label={label}>
      <select
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      >
        {includeAll && <option value="">(Toutes)</option>}
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </Field>
  );
}
