import { AntDesign, Fontisto } from "@expo/vector-icons";
import { CameraCapturedPicture } from "expo-camera";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const PhotoPreviewSection = ({
  photo,
  handleRetakePhoto,
  lat,
  lng,
  title,
  description,
}: {
  photo: CameraCapturedPicture;
  handleRetakePhoto: () => void;
  lat: number;
  lng: number;
  title: string;
  description: string;
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    try {
      if (!title.trim()) {
        Alert.alert("Error", "Please enter title");
        return; // stop execution
      }
      if (!description.trim()) {
        Alert.alert("Error", "Please enter description");
        return; // stop execution
      }
      //const response = await fetch("https://pinna-api.onrender.com/upload", {
      const response = await fetch("http://192.168.0.101:3000/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: photo.base64,
          lat: lat,
          lng: lng,
          title: title,
          description: description,
        }),
      });

      const data = await response.json();
      Alert.alert("Success", "Place saved with title: " + data.title);
      handleRetakePhoto();
      // clear preview after upload
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.containerReview}>
      <View style={styles.box}>
        <Image
          style={styles.previewContainer}
          source={{ uri: "data:image/jpg;base64," + photo.base64 }}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.buttonDelete}
          onPress={handleRetakePhoto}
        >
          <Fontisto name="trash" size={36} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSave}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <AntDesign name="save" size={36} color="black" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerReview: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    marginTop: 30,
  },
  box: {
    borderRadius: 15,
    width: "95%",
    justifyContent: "center",
    alignItems: "center",
    height: 150,
  },
  previewContainer: {
    width: "100%",
    height: "85%",
    borderRadius: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  button: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "red",
  },
  buttonSave: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "deepskyblue",
    padding: 5,
  },
  buttonDelete: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "red",
    padding: 5,
  },
});

export default PhotoPreviewSection;
