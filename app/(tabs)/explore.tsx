import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Collapsible } from "@/components/Collapsible";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

type PhotoType = {
  _id: string;
  image: string; // base64 string from MongoDB
  filename?: string;
};

export default function TabTwoScreen() {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        //const response = await fetch("https://pinna-api.onrender.com/photos");
        const response = await fetch("http://192.168.0.101:3000/photos"); // Replace with your LAN IP
        const data = await response.json();
        setPhotos(data);
      } catch (err) {
        console.error("Failed to fetch photos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>

      <Collapsible title="Uploaded Photos">
        {loading ? (
          <ThemedText>Loading photos...</ThemedText>
        ) : photos.length === 0 ? (
          <ThemedText>No photos uploaded yet.</ThemedText>
        ) : (
          <View style={styles.photoGrid}>
            {photos.map((photo) => (
              <View key={photo._id} style={styles.photoBox}>
                <Image
                  source={{ uri: "data:image/jpg;base64," + photo.image }}
                  style={styles.photo}
                />
                {photo.filename && (
                  <Text style={styles.filename}>{photo.filename}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Collapsible>

      {/* Other existing collapsibles */}
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the{" "}
          <ThemedText type="defaultSemiBold">@2x</ThemedText> and{" "}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes.
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  photoBox: {
    alignItems: "center",
    margin: 5,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  filename: {
    marginTop: 4,
    color: "black",
    fontSize: 12,
    textAlign: "center",
  },
});
