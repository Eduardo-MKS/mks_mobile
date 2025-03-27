import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

const stations = [
  {
    id: 1,
    title: "Blumenau",
    description: "SDC-SC Blumenau.",
    latitude: -26.922445,
    longitude: -49.13543,
  },
  {
    id: 2,
    title: "Gaspar",
    description: "SDC-SC Gaspar",
    latitude: -26.926407,
    longitude: -48.964283,
  },
  {
    id: 3,
    title: "Ilhota",
    description: "SDC-SC Ilhota",
    latitude: -26.894432,
    longitude: -48.82478,
  },
  {
    id: 4,
    title: "Brusque",
    description: "SDC-SC Brusque",
    latitude: -27.100677,
    longitude: -48.917225,
  },
  {
    id: 5,
    title: "Ascurra",
    description: "SDC- SC Ascurra",
    latitude: -26.961292,
    longitude: -49.372902,
  },
];

export default function HomeScreen({ route }) {
  const { selectedStation } = route.params;
  const [region, setRegion] = useState({
    latitude: -27.2423,
    longitude: -50.2189,
    latitudeDelta: 3.5,
    longitudeDelta: 3.5,
  });

  useEffect(() => {
    if (selectedStation) {
      setRegion({
        latitude: selectedStation.latitude,
        longitude: selectedStation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
  }, [selectedStation]);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        region={region}
      >
        {stations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
            title={station.title}
            description={station.description}
          >
            <Image
              source={require("../assets/green-dot2.png")}
              style={{ width: 25, height: 25 }}
              resizeMode="contain"
            />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
