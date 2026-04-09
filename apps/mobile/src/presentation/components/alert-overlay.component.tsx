import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Pressable } from 'react-native';
import { semantic } from '@baby-monitor/design-tokens';

interface AlertOverlayProps {
  readonly visible: boolean;
  readonly onDismiss: () => void;
}

export function AlertOverlay({
  visible,
  onDismiss,
}: AlertOverlayProps): React.JSX.Element | null {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      opacity.stopAnimation();
      opacity.setValue(0);
    }
  }, [visible, opacity]);

  if (!visible) return null;

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss}>
      <Animated.View
        style={[
          styles.overlay,
          { opacity },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: semantic.alert.overlay,
  },
});
