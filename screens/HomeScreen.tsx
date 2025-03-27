import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";

const RAINVIEWER_API = "https://tilecache.rainviewer.com/v2/radar/";
const TILE_FORMAT = "/256/{z}/{x}/{y}/2/1_1.png";

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
  {
    id: 6,
    title: "Rio do Campo",
    description: "SDC-SC Rio do Campo",
    latitude: -26.895851,
    longitude: -50.15508,
  },
  {
    id: 7,
    title: "Itaiópolis",
    description: "SDC-SC Itaiópolis",
    latitude: -26.571453,
    longitude: -49.822426,
  },
];

export default function HomeScreen({ route }) {
  const { selectedStation, opacity } = route.params || {};
  const [region, setRegion] = useState({
    latitude: -27.2423,
    longitude: -50.2189,
    latitudeDelta: 3.5,
    longitudeDelta: 3.5,
  });
  const [rainLayer, setRainLayer] = useState(null);

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

  useEffect(() => {
    const fetchRainViewer = async () => {
      try {
        const response = await fetch(
          "https://api.rainviewer.com/public/maps.json"
        );
        const data = await response.json();
        const latestFrame = data.at(-1); // Última imagem disponível
        setRainLayer(`${RAINVIEWER_API}${latestFrame}${TILE_FORMAT}`);
      } catch (error) {
        console.error("Erro ao buscar dados do RainViewer:", error);
      }
    };
    fetchRainViewer();
  }, []);

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
        {rainLayer && (
          <UrlTile
            urlTemplate={rainLayer}
            zIndex={1}
            opacity={opacity || 0.5}
          />
        )}
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
