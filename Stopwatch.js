import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Stopwatch = ({ isRunning }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{formatTime(time)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', padding: 10 },
  timer: { fontSize: 30, fontWeight: 'bold', color: '#6200EE' },
});

export default Stopwatch;
