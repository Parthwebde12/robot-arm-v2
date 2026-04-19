import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { RobotConnection } from '../api/RobotConnection';

// Animated D-Pad Button
const DPadButton = ({ icon, onPressIn, onPressOut, direction }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.85, useNativeDriver: true, speed: 20 }).start();
    onPressIn && onPressIn();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4 }).start();
    onPressOut && onPressOut();
  };

  return (
    <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.dpadButton, styles[`dpad${direction}`], { transform: [{ scale }] }]}>
        <Ionicons name={icon} size={28} color="#fff" />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Animated Action Button
const ActionButton = ({ icon, label, onPressIn, onPressOut, color = "#00f3ff" }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 20 }),
      Animated.timing(glowOpacity, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
    onPressIn && onPressIn();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4 }),
      Animated.timing(glowOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true })
    ]).start();
    onPressOut && onPressOut();
  };

  return (
    <TouchableOpacity activeOpacity={1} style={styles.actionButton} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.actionIconBg, { borderColor: color, transform: [{ scale }], shadowOpacity: glowOpacity }]}>
        <Ionicons name={icon} size={24} color={color} />
      </Animated.View>
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export const ControlPad = () => {
  const handleMove = (joint, direction) => RobotConnection.moveJoint(joint, direction);
  const handleStop = () => RobotConnection.stopAll();
  const handleGripper = (state) => RobotConnection.setGripper(state);

  // Decorative pulsing pivot
  const pivotGlow = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pivotGlow, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pivotGlow, { toValue: 0.3, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container} pointerEvents="box-none">
      
      {/* Left Pad - Base and Shoulder (D-PAD) */}
      <BlurView intensity={60} tint="dark" style={styles.panelLeft}>
        <Text style={styles.panelTitle}>BASE / SHOULDER</Text>
        
        <View style={styles.dpadContainer}>
          <View style={styles.dpadRow}>
            <DPadButton direction="Up" icon="caret-up" onPressIn={() => handleMove('shoulder', 'forward')} onPressOut={handleStop} />
          </View>
          <View style={styles.dpadRow}>
            <DPadButton direction="Left" icon="caret-back" onPressIn={() => handleMove('base', 'left')} onPressOut={handleStop} />
            <View style={styles.dpadCenter}>
              <Animated.View style={[styles.dpadPivot, { opacity: pivotGlow }]} />
            </View>
            <DPadButton direction="Right" icon="caret-forward" onPressIn={() => handleMove('base', 'right')} onPressOut={handleStop} />
          </View>
          <View style={styles.dpadRow}>
            <DPadButton direction="Down" icon="caret-down" onPressIn={() => handleMove('shoulder', 'backward')} onPressOut={handleStop} />
          </View>
        </View>
      </BlurView>

      {/* Right Pad - Elbow and Gripper (Action Buttons) */}
      <BlurView intensity={60} tint="dark" style={styles.panelRight}>
        <Text style={styles.panelTitle}>MANIPULATOR</Text>
        
        <View style={styles.actionGrid}>
          <ActionButton icon="arrow-up-outline" label="ELBOW UP" onPressIn={() => handleMove('elbow', 'up')} onPressOut={handleStop} />
          <ActionButton icon="arrow-down-outline" label="ELBOW DOWN" onPressIn={() => handleMove('elbow', 'down')} onPressOut={handleStop} />
          <ActionButton icon="radio-button-off" label="OPEN GRIP" color="#00ffaa" onPressIn={() => handleGripper('open')} />
          <ActionButton icon="radio-button-on" label="CLOSE GRIP" color="#ff3366" onPressIn={() => handleGripper('close')} />
        </View>
      </BlurView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  panelLeft: {
    backgroundColor: 'rgba(5, 10, 15, 0.4)',
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 243, 255, 0.25)',
    overflow: 'hidden',
    alignItems: 'center',
    width: '30%',  //change the size of panel from here
  },
  panelRight: {
    backgroundColor: 'rgba(5, 10, 15, 0.4)',
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 243, 255, 0.25)',
    overflow: 'hidden',
    alignItems: 'center',
    width: '30%', //change the size of both panel from here
  },
  panelTitle: {
    color: '#00f3ff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 20,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 243, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  
  /* D-PAD STYLES */
  dpadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  dpadUp: { borderTopLeftRadius: 15, borderTopRightRadius: 15, borderBottomWidth: 0 },
  dpadDown: { borderBottomLeftRadius: 15, borderBottomRightRadius: 15, borderTopWidth: 0 },
  dpadLeft: { borderTopLeftRadius: 15, borderBottomLeftRadius: 15, borderRightWidth: 0 },
  dpadRight: { borderTopRightRadius: 15, borderBottomRightRadius: 15, borderLeftWidth: 0 },
  dpadCenter: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadPivot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00f3ff',
    shadowColor: '#00f3ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },

  /* ACTION BUTTON STYLES */
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  actionButton: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 5,
  },
  actionIconBg: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
  },
  actionLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
