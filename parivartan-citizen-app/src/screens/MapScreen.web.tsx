import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapScreenWeb() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Maps are disabled on Web</Text>
      <Text style={styles.body}>
        The native `react-native-maps` module is not supported in the browser. Open the app
        on a physical device/emulator to see the interactive map, or replace this screen with a
        web map implementation (Google Maps / Leaflet) if you need web support.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  },
  body: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center'
  }
});
