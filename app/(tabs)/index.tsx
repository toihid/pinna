import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function MapScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null; // ✅ typed here

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLoc) => {
          const { latitude, longitude } = newLoc.coords;
          setLocation({ latitude, longitude });

          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }
      );
    })();

    return () => {
      subscription?.remove(); // ✅ safe cleanup
    };
  }, []);

  if (!location) {
    return (
      <View style={styles.container}>
        <MapView style={styles.map} provider="google" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        showsUserLocation={true}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title="You are here" />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
