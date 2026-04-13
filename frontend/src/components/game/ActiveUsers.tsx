interface Props {
  count: number;
  isConnected: boolean;
}

export function ActiveUsers({ count, isConnected }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: isConnected ? '#22c55e' : '#ef4444',
          boxShadow: isConnected ? '0 0 6px #22c55e' : undefined,
        }}
      />
      {isConnected ? `${count} player${count !== 1 ? 's' : ''} online` : 'Reconnecting...'}
    </div>
  );
}
