import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import axios from "axios";
import { format, subHours } from "date-fns";
import { ProgressBar } from "react-native-paper";

import { Icon } from "react-native-elements";

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

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rainFrames, setRainFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [rainLayer, setRainLayer] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

  const [animationSpeed, setAnimationSpeed] = useState(1500);

  const animationIntervalRef = useRef(null);

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Função para buscar os frames do RainViewer
  const fetchRainViewerFrames = async () => {
    try {
      const response = await fetch(
        "https://api.rainviewer.com/public/maps.json"
      );
      const data = await response.json();

      const now = new Date();
      const twoHoursAgo = subHours(now, 2);

      const twoHoursAgoTimestamp = Math.floor(twoHoursAgo.getTime() / 1000);

      const relevantFrames = data.filter(
        (frameTime) => frameTime >= twoHoursAgoTimestamp
      );

      const formattedFrames = relevantFrames.map((frameTime) => ({
        time: frameTime,
        url: `${RAINVIEWER_API}${frameTime}${TILE_FORMAT}`,
      }));

      setRainFrames(formattedFrames);

      if (formattedFrames.length > 0) {
        setCurrentFrameIndex(formattedFrames.length - 1);
        setRainLayer(formattedFrames[formattedFrames.length - 1].url);

        setLastUpdated(format(now, "dd/MM/yyyy HH:mm"));
      }
    } catch (error) {
      console.error("Erro ao buscar dados do RainViewer:", error);
    }
  };

  // Função para acelerar a animação
  const speedUpAnimation = () => {
    if (animationSpeed > 500) {
      const newSpeed = Math.max(500, animationSpeed - 500);
      setAnimationSpeed(newSpeed);

      if (isPlaying) {
        restartAnimation();
      }
    }
  };

  const slowDownAnimation = () => {
    const newSpeed = animationSpeed + 500;
    setAnimationSpeed(newSpeed);

    if (isPlaying) {
      restartAnimation();
    }
  };

  const restartAnimation = () => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }

    if (rainFrames.length > 0) {
      animationIntervalRef.current = setInterval(() => {
        setCurrentFrameIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % rainFrames.length;
          setRainLayer(rainFrames[nextIndex].url);
          setProgress(nextIndex / (rainFrames.length - 1));
          return nextIndex;
        });
      }, animationSpeed);
    }
  };

  // Função para iniciar ou pausar a animação
  const handlePlayPause = () => {
    if (isPlaying) {
      // Pausar a animação
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    } else {
      setCurrentFrameIndex(0);
      if (rainFrames.length > 0) {
        setRainLayer(rainFrames[0].url);

        animationIntervalRef.current = setInterval(() => {
          setCurrentFrameIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % rainFrames.length;
            setRainLayer(rainFrames[nextIndex].url);
            setProgress(nextIndex / (rainFrames.length - 1));
            return nextIndex;
          });
        }, animationSpeed);
      }
    }

    setIsPlaying(!isPlaying);
  };

  const nextFrame = () => {
    if (rainFrames.length > 0) {
      const nextIndex = (currentFrameIndex + 1) % rainFrames.length;
      setCurrentFrameIndex(nextIndex);
      setRainLayer(rainFrames[nextIndex].url);
      setProgress(nextIndex / (rainFrames.length - 1));
    }
  };

  const prevFrame = () => {
    if (rainFrames.length > 0) {
      const prevIndex =
        (currentFrameIndex - 1 + rainFrames.length) % rainFrames.length;
      setCurrentFrameIndex(prevIndex);
      setRainLayer(rainFrames[prevIndex].url);
      setProgress(prevIndex / (rainFrames.length - 1));
    }
  };

  useEffect(() => {
    fetchRainViewerFrames();

    const refreshInterval = setInterval(fetchRainViewerFrames, 10 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
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

  const fetchStationData = async (stationId) => {
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
        const chuvaAcumulada = calculateParameterValue(
          response.data.dados,
          "Chuva Acumulada (mm)"
        );

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

        const stationsArray = Object.keys(stationsData).map((key) => ({
          id: key,
          nome: stationsData[key].nome,
          latitude: stationsData[key].latitude,
          longitude: stationsData[key].longitude,
          description: stationsData[key].rio || "Sem descrição",
        }));

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

  const getFrameTimestamp = () => {
    if (rainFrames.length === 0 || currentFrameIndex >= rainFrames.length) {
      return lastUpdated;
    }

    const frameTime = new Date(rainFrames[currentFrameIndex].time * 1000);
    return format(frameTime, "dd/MM/yyyy HH:mm");
  };

  const getTimeWindowInfo = () => {
    if (rainFrames.length === 0) {
      return "Sem dados";
    }

    const now = new Date();
    const twoHoursAgo = subHours(now, 2);

    return `${format(twoHoursAgo, "HH:mm")} - ${format(now, "HH:mm")}`;
  };

  const getSpeedText = () => {
    return `Velocidade: ${animationSpeed / 1000}s`;
  };

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

      <View style={styles.playerContainer}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeWindowInfo}>{getTimeWindowInfo()}</Text>
          <Text style={styles.timeText}>{getFrameTimestamp()}</Text>
        </View>

        <View style={styles.speedControlContainer}>
          <Text style={styles.speedText}>{getSpeedText()}</Text>
          <View style={styles.speedButtonsContainer}>
            <TouchableOpacity
              onPress={slowDownAnimation}
              style={styles.speedButton}
            >
              <Icon name="remove" size={14} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={speedUpAnimation}
              style={styles.speedButton}
            >
              <Icon name="add" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            style={styles.progressBar}
            color="#DDA853"
          />
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={prevFrame} style={styles.controlButton}>
            <Icon name="chevron-left" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            <Icon
              name={isPlaying ? "pause-circle-outline" : "play-circle-outline"}
              size={28}
              color="#DDA853"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={nextFrame} style={styles.controlButton}>
            <Icon name="chevron-right" size={20} color="white" />
          </TouchableOpacity>
        </View>
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
  playerContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    width: 180,
    flexDirection: "column",
    alignItems: "center",
  },
  timeContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  timeWindowInfo: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 2,
  },
  timeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  speedControlContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  speedText: {
    color: "white",
    fontSize: 9,
  },
  speedButtonsContainer: {
    flexDirection: "row",
  },
  speedButton: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    color: "#000",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  controlButton: {
    padding: 5,
  },
  playButton: {
    padding: 5,
  },
});
