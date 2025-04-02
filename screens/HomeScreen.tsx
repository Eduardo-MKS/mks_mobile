import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import axios from "axios";
import { format, subHours } from "date-fns";

const RAINVIEWER_API = "https://tilecache.rainviewer.com/v2/radar/";
const TILE_FORMAT = "/256/{z}/{x}/{y}/2/1_1.png";
const ESTACOES_API = "https://api-dcsc.mks-unifique.ddns.net/api/estacoes";

interface Station {
  id: string;
  nome: string;
  description: string;
  latitude: number;
  longitude: number;
  chuvaAcumulada?: number;
  nivelRio?: number;
}

export default function HomeScreen({ route }) {
  const {
    selectedStation,
    opacity,
    timeRange = 168,
    selectedParametro = "Chuva Acumulada (mm)",
  } = route.params || {};

  const [region, setRegion] = useState({
    latitude: -27.2423,
    longitude: -50.2189,
    latitudeDelta: 3.5,
    longitudeDelta: 3.5,
  });

  const [rainLayer, setRainLayer] = useState<string | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
      } catch (error) {}
    };
    fetchRainViewer();
  }, []);

  const getLatestValue = (dataArray, propertyName) => {
    const validData = dataArray
      .filter(
        (item) =>
          item[propertyName] !== null && item[propertyName] !== undefined
      )
      .map((item) => ({
        value: parseFloat(item[propertyName]),
        timestamp: item.dataHora ? new Date(item.dataHora) : null,
      }))
      .filter((item) => !isNaN(item.value));

    if (validData.length === 0) return 0;

    if (validData[0].timestamp) {
      validData.sort((a, b) => b.timestamp - a.timestamp);
    }

    // Garantir que o valor não seja negativo
    const value = validData[0].value;
    return value >= 0 ? value : 0;
  };

  const calculateParameterValue = (data, parameterType) => {
    if (!data || !data.length) {
      return 0;
    }

    switch (parameterType) {
      case "Chuva Acumulada (mm)": {
        const possibleFields = [
          "precipitacao",
          "chuva",
          "rainfall",
          "rain",
          "precipitacaoAcumulada",
          "chuva_acumulada_mm",
        ];

        const precipField =
          possibleFields.find((field) =>
            data.some((item) => item[field] !== undefined)
          ) || "precipitacao";

        const validRainData = data
          .filter(
            (item) =>
              item[precipField] !== null && item[precipField] !== undefined
          )
          .map((item) => parseFloat(item[precipField]))
          .filter((value) => !isNaN(value));

        const totalRain = validRainData
          .filter((value) => value >= 0)
          .reduce((sum, value) => sum + value, 0);

        return totalRain;
      }

      case "Chuva Instantanea (mm)":
        return getLatestValue(data, "precipitacaoInstantanea");

      case "Chuva Deslizamento (mm)":
        return getLatestValue(data, "precipitacaoDeslizamento");

      case "Rio m": {
        const possibleRiverFields = [
          "nivelRio",
          "rio_nivel_m",
          "nivel_rio",
          "river_level",
          "waterlevel",
        ];

        const riverField = possibleRiverFields.find((field) =>
          data.some((item) => item[field] !== undefined)
        );

        if (riverField) {
          // Garantir que não retornamos valor negativo
          const value = getLatestValue(data, riverField);
          return value >= 0 ? value : 0;
        }
        return 0;
      }

      case "Temperatura":
        return getLatestValue(data, "temperatura");

      default:
        return 0;
    }
  };

  const fetchStationData = async (stationId: string) => {
    try {
      const endDate = new Date();
      const startDate = subHours(endDate, timeRange);
      const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm:ss");
      const formattedEndDate = format(endDate, "yyyy-MM-dd'T'HH:mm:ss");

      if (stationId === "DCSC-00042") {
        return { chuvaAcumulada: 0, nivelRio: 0 };
      }

      const url = `https://api-dcsc.mks-unifique.ddns.net/api/estacoes/dados?codigo=${stationId}&data_inicial=${formattedStartDate}&data_final=${formattedEndDate}`;
      const response = await axios.get(url);

      if (
        response.data &&
        response.data.dados &&
        response.data.dados.length > 0
      ) {
        // Calcula tanto dados de chuva quanto de nível do rio
        const chuvaAcumulada = calculateParameterValue(
          response.data.dados,
          "Chuva Acumulada (mm)"
        );

        // Calcula nível do rio apenas se o parâmetro selecionado for "Rio m"
        const nivelRio =
          selectedParametro === "Rio m"
            ? calculateParameterValue(response.data.dados, "Rio m")
            : 0;

        return { chuvaAcumulada, nivelRio };
      }

      return { chuvaAcumulada: 0, nivelRio: 0 };
    } catch (error) {
      return { chuvaAcumulada: 0, nivelRio: 0 };
    }
  };

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
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

        const updatedStations = await Promise.all(
          stationsArray.map(async (station) => {
            const data = await fetchStationData(station.id);
            return {
              ...station,
              chuvaAcumulada: data.chuvaAcumulada,
              nivelRio: data.nivelRio,
            };
          })
        );

        setStations(updatedStations);
      } catch (error) {
        setStations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [timeRange, selectedParametro]);

  const getUnitForParameter = (paramType) => {
    switch (paramType) {
      case "Chuva Acumulada (mm)":
      case "Chuva Instantanea (mm)":
      case "Chuva Deslizamento (mm)":
        return "mm";
      case "Rio m":
        return "m";
      case "Temperatura":
        return "°C";
      default:
        return "mm";
    }
  };

  const getShortParameterName = (paramType) => {
    switch (paramType) {
      case "Chuva Acumulada (mm)":
        return "Chuva";
      case "Chuva Instantanea (mm)":
        return "Inst.";
      case "Chuva Deslizamento (mm)":
        return "Desl.";
      case "Rio m":
        return "Rio";
      case "Temperatura":
        return "Temp";
      default:
        return "Valor";
    }
  };

  const getCurrentParameterValue = (station, paramType) => {
    switch (paramType) {
      case "Chuva Acumulada (mm)":
      case "Chuva Instantanea (mm)":
      case "Chuva Deslizamento (mm)":
        return station.chuvaAcumulada;
      case "Rio m":
        return station.nivelRio;
      case "Temperatura":
        return station.temperatura;
      default:
        return station.chuvaAcumulada;
    }
  };

  const unit = getUnitForParameter(selectedParametro);
  const paramShortName = getShortParameterName(selectedParametro);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        region={region}
      >
        {stations.map((station) => {
          const currentValue = getCurrentParameterValue(
            station,
            selectedParametro
          );
          const isDotBlue =
            (selectedParametro.includes("Chuva") &&
              (station.chuvaAcumulada || 0) > 0) ||
            (selectedParametro === "Rio m" && (station.nivelRio || 0) > 0);

          return (
            <Marker
              key={station.id}
              coordinate={{
                latitude: station.latitude,
                longitude: station.longitude,
              }}
              title={station.nome}
              description={`${station.description}\n${selectedParametro}: ${
                currentValue?.toFixed(2) || "0.00"
              } ${unit}`}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.markerContainer}>
                <Image
                  source={
                    isDotBlue
                      ? require("../assets/Blue_dot.png")
                      : require("../assets/green-dot2.png")
                  }
                  style={{ width: 25, height: 25 }}
                  resizeMode="contain"
                />
                {currentValue !== undefined && (
                  <View style={styles.dataContainer}>
                    <Text style={styles.dataLabel}>{paramShortName}</Text>
                    <Text style={styles.dataValue}>
                      {currentValue?.toFixed(2) || "0.00"} {unit}
                    </Text>
                  </View>
                )}
              </View>
            </Marker>
          );
        })}

        {rainLayer && (
          <UrlTile
            urlTemplate={rainLayer}
            zIndex={1}
            opacity={opacity || 0.5}
          />
        )}
      </MapView>
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {selectedParametro || "Chuva Acumulada"} ({timeRange || 168}h)
        </Text>
      </View>
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
  markerContainer: {
    alignItems: "center",
  },
  dataContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignItems: "center",
  },
  dataLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#444",
  },
  dataValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  loadingContainer: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loadingText: {
    color: "white",
    fontWeight: "bold",
  },
  infoContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  infoText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
