import { PropsWithChildren } from 'react';

export default function ControlsBar({ children }: PropsWithChildren) {
  return (
    <div
      className="row"
      style={{
        gap: 16,
        flexWrap: 'wrap',
        alignItems: 'flex-end',
      }}
    >
      {children}
    </div>
  );
}
