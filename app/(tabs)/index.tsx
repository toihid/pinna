import CameraModalComponent from "@/components/CameraModalComponent";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Modal,
} from "react-native";
import MapView, { MapPressEvent, Marker } from "react-native-maps";

export default function MapScreen() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const mapRef = useRef<MapView>(null);

  const [pinnedLocation, setPinnedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedPin, setSelectedPin] = useState<any>(null); // Predefined pin selected
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<any>(null);
  const [predefinedPins, setPredefinedPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = async () => {
    console.log("tiggered");
    try {
      //const response = await fetch("https://pinna-api.onrender.com/photos");
      const response = await fetch("http://192.168.0.101:3000/places"); // Replace with your LAN IP
      const data = await response.json();
      setPredefinedPins(data);
    } catch (err) {
      console.error("Failed to fetch places:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPhotos();
  }, []);

  // Predefined pins (Gothenburg)
  const predefinedPins222 = [
    {
      id: 1,
      title: "Hisings Kärra School",
      description: "Local school in Hisings Kärra",
      latitude: 57.79241,
      longitude: 11.99581,
    },
    {
      id: 2,
      title: "Kärra Library",
      description: "Community library in Hisings Kärra",
      latitude: 57.79214,
      longitude: 11.99644,
    },
    {
      id: 3,
      title: "Kärra Sports Hall",
      description:
        "Sports facility in Hisings Kärra (Kärra Sim- och Sporthall)",
      latitude: 57.79196,
      longitude: 11.99605,
    },
  ];

  // Handle location
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let hasAnimated = false;

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

          // Only animate the very first time
          if (!hasAnimated && mapRef.current) {
            mapRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
            hasAnimated = true;
          }
        }
      );
    })();

    return () => subscription?.remove();
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (modalVisible) {
        setModalVisible(false);
        setPinnedLocation(null);
        setSelectedPin(null);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [modalVisible]);

  // User taps map
  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Check if tapped location matches a predefined pin (within a small threshold)
    const threshold = 0.0005; // adjust for map zoom/accuracy
    const foundPin = predefinedPins.find(
      (pin) =>
        Math.abs(pin.latitude - latitude) < threshold &&
        Math.abs(pin.longitude - longitude) < threshold
    );

    if (foundPin) {
      // A predefined pin was tapped — select it instead of creating a new one
      setSelectedPin(foundPin);
      setPinnedLocation(null); // optional: clear any custom pin
      setModalVisible(true); // open modal for that pin
    } else {
      // Not a predefined pin — create a new pinned location
      setPinnedLocation({ latitude, longitude });
      setSelectedPin(null);
      setModalVisible(true);
    }
  };

  // Predefined pin tap
  const handlePredefinedPinPress = (pin: any) => {
    setSelectedPin(pin);
    setPinnedLocation(null);
    setModalVisible(true);
  };

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
        onPress={handleMapPress}
      >
        {/* Current user location */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="You are here"
        />

        {/* Predefined pins */}
        {predefinedPins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            title={pin.title}
            description={pin.description}
            pinColor="blue"
            onPress={() => handlePredefinedPinPress(pin)}
          />
        ))}

        {/* User-pinned marker */}
        {pinnedLocation && (
          <Marker
            coordinate={{
              latitude: pinnedLocation.latitude,
              longitude: pinnedLocation.longitude,
            }}
            title="New Location"
            pinColor="green"
          />
        )}
      </MapView>

      {/* Modal */}
      {modalVisible && (
        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {selectedPin ? selectedPin.title : "New Location"}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      marginLeft: 10,
                      position: "absolute",
                      right: -25,
                      top: -30,
                      backgroundColor: "grey",
                      width: 50,
                      height: 50,
                      borderWidth: 2,
                      borderColor: "white",
                      borderRadius: 25,
                    },
                  ]}
                  onPress={() => {
                    setModalVisible(false);
                    setPinnedLocation(null);
                    setSelectedPin(null);
                    setTitle("");
                    setDescription("");
                    setPhoto(null);
                  }}
                >
                  <Text
                    style={{ color: "red", fontSize: 20, fontWeight: "bold" }}
                  >
                    X
                  </Text>
                </TouchableOpacity>

                {selectedPin ? (
                  // Display predefined pin data (read-only)
                  <View style={{ marginTop: 10 }}>
                    <Text>{selectedPin.description}</Text>
                  </View>
                ) : (
                  // Input fields for user-pinned location
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter title"
                      value={title}
                      onChangeText={setTitle}
                    />
                    <TextInput
                      style={styles.textarea}
                      placeholder="Enter description"
                      value={description}
                      onChangeText={setDescription}
                      multiline
                    />
                    <View style={{ height: 200, marginVertical: 10 }}>
                      <CameraModalComponent
                        onPhotoTaken={setPhoto}
                        lat={pinnedLocation!.latitude}
                        lng={pinnedLocation!.longitude}
                        title={title}
                        description={description}
                        onSaved={fetchPhotos}
                      />
                    </View>
                  </>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    marginTop: 50,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
    height: 40,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    height: 80,
    textAlignVertical: "top",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
