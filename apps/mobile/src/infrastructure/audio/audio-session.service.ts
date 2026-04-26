import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

// Configures the OS audio session so the parent phone keeps playing the
// baby's audio (and stays able to record for talk-back) while the screen
// is locked or the app is in the background.
//
// On iOS this combines with UIBackgroundModes=['audio'] from Info.plist
// to keep the AVAudioSession active. On Android it sets the right
// stream type and disables ducking.
export async function enableBackgroundAudio(): Promise<void> {
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    allowsRecordingIOS: true,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    shouldDuckAndroid: false,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    playThroughEarpieceAndroid: false,
  });
}

export async function disableBackgroundAudio(): Promise<void> {
  await Audio.setAudioModeAsync({
    staysActiveInBackground: false,
    allowsRecordingIOS: false,
    playsInSilentModeIOS: false,
    interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
    shouldDuckAndroid: true,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    playThroughEarpieceAndroid: false,
  });
}
