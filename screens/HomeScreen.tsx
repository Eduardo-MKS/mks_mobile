import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import axios from "axios";

const RAINVIEWER_API = "https://tilecache.rainviewer.com/v2/radar/";
const TILE_FORMAT = "/256/{z}/{x}/{y}/2/1_1.png";
const ESTACOES_API = "https://api-dcsc.mks-unifique.ddns.net/api/estacoes";

interface Station {
  id: string;
  nome: string;
  description: string;
  latitude: number;
  longitude: number;
}

export default function HomeScreen({ route }) {
  const { selectedStation, opacity } = route.params || {};

  const [region, setRegion] = useState({
    latitude: -27.2423,
    longitude: -50.2189,
    latitudeDelta: 3.5,
    longitudeDelta: 3.5,
  });

  const [rainLayer, setRainLayer] = useState<string | null>(null);
  const [stations, setStations] = useState<Station[]>([]);

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
        const latestFrame = data.at(-1);
        setRainLayer(`${RAINVIEWER_API}${latestFrame}${TILE_FORMAT}`);
      } catch (error) {
        console.error("Erro ao buscar dados do RainViewer:", error);
      }
    };
    fetchRainViewer();
  }, []);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get(ESTACOES_API);
        const stationsData = response.data.data;
        const stationsArray: Station[] = Object.keys(stationsData).map(
          (key) => ({
            id: key,
            nome: stationsData[key].nome,
            latitude: stationsData[key].latitude,
            longitude: stationsData[key].longitude,
            description: stationsData[key].rio || "Sem descrição",
          })
        );

        setStations(stationsArray);
      } catch (error) {
        console.error("Erro ao buscar estações:", error);
        setStations([]);
      }
    };
    fetchStations();
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
            title={station.nome}
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
