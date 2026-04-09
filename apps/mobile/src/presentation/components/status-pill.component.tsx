import React from 'react';
import { View, Text } from 'react-native';
import type { ConnectionState } from '@babycam/shared-types';
import { semantic } from '@babycam/design-tokens';
import { commonStyles } from '../theme';

interface StatusPillProps {
  readonly state: ConnectionState;
}

const STATUS_CONFIG: Record<ConnectionState, { label: string; color: string }> = {
  idle: { label: 'Iniciando', color: semantic.text.muted },
  waiting: { label: 'Aguardando...', color: semantic.status.reconnecting },
  connecting: { label: 'Conectando...', color: semantic.status.reconnecting },
  connected: { label: 'Conectado', color: semantic.status.connected },
  reconnecting: { label: 'Reconectando...', color: semantic.status.reconnecting },
  disconnected: { label: 'Desconectado', color: semantic.status.disconnected },
};

export function StatusPill({ state }: StatusPillProps): React.JSX.Element {
  const config = STATUS_CONFIG[state];

  return (
    <View style={commonStyles.statusPill}>
      <View style={[commonStyles.statusDot, { backgroundColor: config.color }]} />
      <Text style={[commonStyles.statusText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}
