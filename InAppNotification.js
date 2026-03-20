import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

export default function InAppNotification({ message, onDismiss }) {
  const fadeAnim = new Animated.Value(1);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200, // Faster close animation
      useNativeDriver: true,
    }).start(() => onDismiss());
  };

  useEffect(() => {
    const timer = setTimeout(handleClose, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.notification, { opacity: fadeAnim }]}>
      <View style={styles.contentContainer}>
        <Text style={styles.text}>{message}</Text>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={handleClose}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} // Makes it easier to tap
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  notification: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    flex: 1, // Takes remaining space
    paddingRight: 10, // Prevents text from touching close button
  },
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});