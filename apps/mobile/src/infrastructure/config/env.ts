import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const ENV = {
  SIGNALING_URL: (extra.signalingUrl as string) || 'http://localhost:3003',
  BABY_STATION_URL: (extra.babyStationUrl as string) || 'http://localhost:5175',
} as const;
