import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import segmentsData from '../../assets/n1_segments.json';
import { findNearestSegment } from '../utils/locationUtils';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.7;

const SpeedScreen = () => {
  const [currentSpeed, setCurrentSpeed] = useState(0); // km/h
  const [matchedLimit, setMatchedLimit] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let subscription;
    let isMounted = true;

    const startTracking = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (!isMounted) return;

        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (location) => {
            if (!isMounted) return;
            const { speed, latitude, longitude } = location.coords;

            // Speed from GPS is in m/s, convert to km/h. speed can be -1 on Android if invalid.
            const speedKmh = (speed && speed > 0) ? speed * 3.6 : 0;
            setCurrentSpeed(Math.round(speedKmh));

            const userLocation = { latitude, longitude };
            const segment = findNearestSegment(userLocation, segmentsData);

            if (segment) {
              setMatchedLimit(segment.limit);
            } else {
              setMatchedLimit(null);
            }
          }
        );

        if (isMounted) {
            subscription = sub;
        } else {
            sub.remove();
        }
      } catch (error) {
        if (isMounted) setErrorMsg('Error starting location tracking: ' + error.message);
      }
    };

    startTracking();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const getCircleBorderColor = () => {
    if (!matchedLimit) return '#e0e0e0'; // Gray if no limit found
    if (currentSpeed > matchedLimit) return '#ff4444'; // Red if speeding
    return '#4caf50'; // Green if safe
  };

  return (
    <View style={styles.container}>
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <View style={[styles.circle, { borderColor: getCircleBorderColor() }]}>
        <Text style={styles.limitLabel}>LIMIT</Text>
        {matchedLimit ? (
          <Text style={styles.limitText}>{matchedLimit}</Text>
        ) : (
          <Text style={styles.noLimitText}>--</Text>
        )}
      </View>

      <View style={styles.speedContainer}>
        <Text style={styles.speedText}>{currentSpeed}</Text>
        <Text style={styles.unitText}>km/h</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  limitText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#333',
  },
  noLimitText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#ccc',
  },
  limitLabel: {
    fontSize: 18,
    color: '#666',
    position: 'absolute',
    top: 40,
  },
  speedContainer: {
    alignItems: 'center',
  },
  speedText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
  },
  unitText: {
    fontSize: 24,
    color: '#666',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default SpeedScreen;
