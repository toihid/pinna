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
  onSaved,
}: {
  photo: CameraCapturedPicture;
  handleRetakePhoto: () => void;
  lat: number;
  lng: number;
  title: string;
  description: string;
  onSaved?: () => void;
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    try {
      if (!title.trim() || !description.trim()) {
        Alert.alert("Error", "Please enter title and description");
        return;
      }

      const formData = new FormData();
      formData.append("image", {
        uri: photo.uri,
        type: "image/jpeg",
        name: "photo.jpg",
      } as any);
      formData.append("lat", lat.toString());
      formData.append("lng", lng.toString());
      formData.append("title", title);
      formData.append("description", description);

      const response = await fetch(`https://pinna-api.onrender.com/save`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();
      Alert.alert("Success", "Place saved with title: " + data.title);
      handleRetakePhoto();
      if (onSaved) onSaved();
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
        <Image style={styles.previewContainer} source={{ uri: photo.uri }} />
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
  containerReview: { flex: 1, alignItems: "center", justifyContent: "center" },
  box: {
    width: "95%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: { width: "100%", height: "85%", borderRadius: 15 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  buttonSave: {
    borderRadius: 10,
    padding: 5,
    borderWidth: 2,
    borderColor: "deepskyblue",
    alignItems: "center",
  },
  buttonDelete: {
    borderRadius: 10,
    padding: 5,
    borderWidth: 2,
    borderColor: "red",
    alignItems: "center",
  },
});

export default PhotoPreviewSection;
