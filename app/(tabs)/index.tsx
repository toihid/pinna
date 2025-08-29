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
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<any>(null);

  // Handle location
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

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

    return () => subscription?.remove();
  }, []);

  // Handle hardware back button on Android
  useEffect(() => {
    const backAction = () => {
      if (modalVisible) {
        setModalVisible(false);
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

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setPinnedLocation({ latitude, longitude });
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
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="You are here"
        />
        {pinnedLocation && (
          <Marker
            coordinate={{
              latitude: pinnedLocation.latitude,
              longitude: pinnedLocation.longitude,
            }}
            title="Pinned Location"
            pinColor="blue"
          />
        )}
      </MapView>

      {pinnedLocation && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View>
                  <Text style={styles.modalTitle}>Pinned Location</Text>
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
                </View>

                {/*
                <Text>Latitude: {pinnedLocation.latitude}</Text>
                <Text>Longitude: {pinnedLocation.longitude}</Text>
                <Text>Title: {title}</Text>
                <Text>Desc: {description}</Text>
                */}

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
                    lat={pinnedLocation.latitude}
                    lng={pinnedLocation.longitude}
                    title={title}
                    description={description}
                  />
                </View>
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
    justifyContent: "flex-start",
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
