import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

type PlaceType = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
};

export default function TabTwoScreen() {
  const [places, setPlaces] = useState<PlaceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const mapRef = useRef<MapView>(null);

  // Calculate distance in km
  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Open Google Maps / Apple Maps for directions
  const openGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open Google Maps:", err)
    );
  };

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetch("https://pinna-api.onrender.com/places");
        const data = await response.json();
        setPlaces(data);
      } catch (err) {
        console.error("Failed to fetch places:", err);
      } finally {
        setLoading(false);
      }
    };

    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      } catch (err) {
        console.error("Failed to get user location:", err);
      }
    };

    getUserLocation();
    fetchPlaces();
  }, []);

  const sortedPlaces = userLocation
    ? [...places].sort(
        (a, b) =>
          getDistance(
            userLocation.lat,
            userLocation.lng,
            a.latitude,
            a.longitude
          ) -
          getDistance(
            userLocation.lat,
            userLocation.lng,
            b.latitude,
            b.longitude
          )
      )
    : places;

  const initialRegion =
    userLocation && places.length > 0
      ? {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : places.length > 0
      ? {
          latitude: places[0].latitude,
          longitude: places[0].longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : {
          latitude: 57.7,
          longitude: 11.95,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

  const handlePlacePress = (place: PlaceType) => {
    setSelectedPlaceId(place.id);

    // Zoom in closer on selected place
    mapRef.current?.animateToRegion(
      {
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  };

  return (
    <ThemedView style={styles.container}>
      {places.length > 0 && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          mapType="standard"
        >
          {places.map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              pinColor={place.id === selectedPlaceId ? "#FF0000" : "#FF6B6B"}
            >
              <Callout
                tooltip
                onPress={() => openGoogleMaps(place.latitude, place.longitude)}
              >
                <View style={styles.callout}>
                  <ThemedText style={styles.calloutText}>
                    {place.title}
                  </ThemedText>
                  <ThemedText style={styles.calloutDirection}>
                    Get Directions
                  </ThemedText>
                </View>
              </Callout>
            </Marker>
          ))}
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.lat,
                longitude: userLocation.lng,
              }}
              title="You"
              pinColor="#007AFF"
            />
          )}
        </MapView>
      )}

      <ScrollView style={styles.placeList}>
        {loading ? (
          <ThemedText>Loading places...</ThemedText>
        ) : sortedPlaces.length === 0 ? (
          <ThemedText>No places found.</ThemedText>
        ) : (
          sortedPlaces.map((place) => {
            const distance = userLocation
              ? getDistance(
                  userLocation.lat,
                  userLocation.lng,
                  place.latitude,
                  place.longitude
                )
              : null;

            return (
              <TouchableOpacity
                key={place.id}
                onPress={() => handlePlacePress(place)}
              >
                <View
                  style={[
                    styles.placeCard,
                    place.id === selectedPlaceId && {
                      borderColor: "#FF0000",
                      borderWidth: 2,
                    },
                  ]}
                >
                  <View style={styles.placeHeader}>
                    <IconSymbol
                      name="mappin.circle"
                      size={30}
                      color={
                        place.id === selectedPlaceId ? "#FF0000" : "#FF6B6B"
                      }
                      style={{ marginRight: 8 }}
                    />
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.placeTitle}
                    >
                      {place.title}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.placeCoords}>
                    Lat: {place.latitude.toFixed(6)}, Lng:{" "}
                    {place.longitude.toFixed(6)}
                  </ThemedText>
                  {distance !== null && (
                    <ThemedText style={styles.placeDistance}>
                      Distance: {distance.toFixed(2)} km
                    </ThemedText>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </ThemedView>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  headerText: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 20,
    fontWeight: "bold",
  },
  map: {
    width: "100%",
    height: height * 0.35,
    borderRadius: 12,
    marginBottom: 16,
  },
  callout: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 6,
    borderColor: "#FF6B6B",
    borderWidth: 1,
    alignItems: "center",
  },
  calloutText: {
    fontWeight: "bold",
    color: "#333",
  },
  calloutDirection: {
    fontWeight: "600",
    color: "#007AFF",
    marginTop: 2,
  },
  placeList: {
    flex: 1,
  },
  placeCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  placeTitle: {
    fontSize: 16,
    color: "#333333",
  },
  placeCoords: {
    fontSize: 14,
    color: "#666666",
  },
  placeDistance: {
    fontSize: 14,
    color: "#FF6B6B",
    marginTop: 4,
    fontWeight: "600",
  },
});
