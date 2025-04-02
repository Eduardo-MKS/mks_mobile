import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, Text, Alert } from "react-native";
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
  const [debugInfo, setDebugInfo] = useState<string>("");

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
        setDebugInfo(
          (prev) => prev + "\nErro RainViewer: " + JSON.stringify(error)
        );
      }
    };
    fetchRainViewer();
  }, []);

  // Function to find the most recent valid value in data array
  const getLatestValue = (dataArray, propertyName) => {
    // Debug - log what we're looking for
    console.log(`Getting latest value for property: ${propertyName}`);
    console.log(`Data array has ${dataArray.length} items`);

    if (dataArray.length > 0) {
      console.log("Sample data item:", JSON.stringify(dataArray[0]));
    }

    // Filter valid data points and sort by date if available
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

    console.log(`Found ${validData.length} valid data points`);

    if (validData.length === 0) return 0;

    // If we have timestamps, sort by them and get the most recent
    if (validData[0].timestamp) {
      validData.sort((a, b) => b.timestamp - a.timestamp);
    }

    console.log(`Latest value: ${validData[0].value}`);
    return validData[0].value;
  };

  // This function handles each parameter type correctly

  // Esta função manipula cada tipo de parâmetro corretamente
  const calculateParameterValue = (data, parameterType) => {
    if (!data || !data.length) {
      console.log("Nenhum dado disponível para cálculo");
      return 0;
    }

    console.log(
      `Calculando ${parameterType} de ${data.length} pontos de dados`
    );

    // Verifique quais campos estão disponíveis no primeiro ponto de dados
    if (data.length > 0) {
      console.log("Campos disponíveis:", Object.keys(data[0]));
    }

    switch (parameterType) {
      case "Chuva Acumulada (mm)": {
        // Para chuva acumulada ao longo de timeRange horas
        // Tente diferentes nomes de campo possíveis para precipitação
        const possibleFields = [
          "precipitacao",
          "chuva",
          "rainfall",
          "rain",
          "precipitacaoAcumulada",
          "chuva_acumulada_mm", // Adicionado chuva_acumulada_mm
        ];

        // Encontre o primeiro campo que existe nos dados
        const precipField =
          possibleFields.find((field) =>
            data.some((item) => item[field] !== undefined)
          ) || "precipitacao"; // Padrão para precipitacao se nenhum for encontrado

        console.log(
          `Usando o campo "${precipField}" para dados de precipitação`
        );

        // Obtenha apenas os valores de precipitação que são números válidos
        const validRainData = data
          .filter(
            (item) =>
              item[precipField] !== null && item[precipField] !== undefined
          )
          .map((item) => parseFloat(item[precipField]))
          .filter((value) => !isNaN(value));

        console.log(
          `Encontrados ${validRainData.length} valores de precipitação válidos`
        );

        // Some todos os valores de precipitação dentro do intervalo de tempo
        // Certifique-se de incluir apenas valores positivos
        const totalRain = validRainData
          .filter((value) => value >= 0)
          .reduce((sum, value) => sum + value, 0);

        console.log(`Chuva acumulada total: ${totalRain}mm`);
        return totalRain;
      }

      case "Chuva Instantanea (mm)":
        // Para chuva instantânea, obtenha o valor mais recente
        return getLatestValue(data, "precipitacaoInstantanea");

      case "Chuva Deslizamento (mm)":
        // Para cálculo de risco de deslizamento
        return getLatestValue(data, "precipitacaoDeslizamento");

      case "Rio m":
        // Para nível do rio, obtenha a medição mais recente
        return getLatestValue(data, "nivelRio");

      case "Temperatura":
        // Para temperatura, obtenha a medição mais recente
        return getLatestValue(data, "temperatura");

      default:
        return 0;
    }
  };

  const fetchStationData = async (stationId: string) => {
    try {
      // Get current date and date based on selected time range
      const endDate = new Date();
      const startDate = subHours(endDate, timeRange);

      // Format dates in a way that is more likely to be accepted by the API
      // Try without timezone offset first
      const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm:ss");
      const formattedEndDate = format(endDate, "yyyy-MM-dd'T'HH:mm:ss");

      console.log(`Fetching data for station ${stationId}`);
      console.log(`Time range: ${timeRange} hours`);
      console.log(`Start date: ${formattedStartDate}`);
      console.log(`End date: ${formattedEndDate}`);

      // Special case for station 42
      if (stationId === "DCSC-00042") {
        console.log("Special case for station 42, returning 0");
        return 0;
      }

      const url = `https://api-dcsc.mks-unifique.ddns.net/api/estacoes/dados?codigo=${stationId}&data_inicial=${formattedStartDate}&data_final=${formattedEndDate}`;
      console.log(`API URL: ${url}`);

      const response = await axios.get(url);

      // Log response status
      console.log(`Station ${stationId} response status:`, response.status);

      // Check if we have data
      if (response.data && response.data.dados) {
        console.log(
          `Station ${stationId} received ${response.data.dados.length} data points`
        );

        // Log a sample of the data
        if (response.data.dados.length > 0) {
          console.log(`Sample data:`, JSON.stringify(response.data.dados[0]));
        }
      } else {
        console.log(`No data found in response for station ${stationId}`);
      }

      if (
        response.data &&
        response.data.dados &&
        response.data.dados.length > 0
      ) {
        const calculatedValue = calculateParameterValue(
          response.data.dados,
          selectedParametro
        );
        console.log(
          `Station ${stationId} calculated value: ${calculatedValue}`
        );
        return calculatedValue;
      }

      console.log(`No data for station ${stationId}`);
      return 0;
    } catch (error) {
      console.error(`Erro ao buscar dados para estação ${stationId}:`, error);
      setDebugInfo(
        (prev) => prev + `\nErro estação ${stationId}: ${error.message}`
      );
      return 0;
    }
  };

  // Re-fetch data when time range or parameter changes
  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      setDebugInfo("Iniciando busca de estações...");
      try {
        const response = await axios.get(ESTACOES_API);
        const stationsData = response.data.data;
        setDebugInfo(
          (prev) =>
            prev + `\nEncontradas ${Object.keys(stationsData).length} estações`
        );

        // Create initial stations array
        const stationsArray: Station[] = Object.keys(stationsData).map(
          (key) => ({
            id: key,
            nome: stationsData[key].nome,
            latitude: stationsData[key].latitude,
            longitude: stationsData[key].longitude,
            description: stationsData[key].rio || "Sem descrição",
          })
        );

        // For debugging, limit to a few stations initially
        // const debugStationsArray = stationsArray.slice(0, 3);
        // setDebugInfo(prev => prev + `\nTestando com ${debugStationsArray.length} estações`);

        // Fetch data for each station
        const updatedStations = await Promise.all(
          stationsArray.map(async (station) => {
            setDebugInfo(
              (prev) =>
                prev + `\nBuscando dados para ${station.nome} (${station.id})`
            );
            const value = await fetchStationData(station.id);
            setDebugInfo((prev) => prev + ` - Valor: ${value}`);
            return {
              ...station,
              chuvaAcumulada: value,
            };
          })
        );

        setStations(updatedStations);
        setDebugInfo(
          (prev) => prev + "\nDados de estações carregados com sucesso"
        );
      } catch (error) {
        console.error("Erro ao buscar estações:", error);
        setDebugInfo((prev) => prev + `\nErro geral: ${error.message}`);
        setStations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [timeRange, selectedParametro]); // Re-fetch when these change

  // Get the appropriate unit based on parameter type
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

  // Simplified display name for parameter
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

  // Function to show debug info in an alert
  const showDebugInfo = () => {
    Alert.alert("Debug Info", debugInfo);
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
        {stations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
            title={station.nome}
            description={`${station.description}\n${selectedParametro}: ${
              station.chuvaAcumulada?.toFixed(2) || "0.00"
            } ${unit}`}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.markerContainer}>
              <Image
                source={
                  // For rainfall parameters, use blue dot when > 0
                  selectedParametro.includes("Chuva") &&
                  (station.chuvaAcumulada || 0) > 0
                    ? require("../assets/Blue_dot.png")
                    : require("../assets/green-dot2.png")
                }
                style={{ width: 25, height: 25 }}
                resizeMode="contain"
              />
              {station.chuvaAcumulada !== undefined && (
                <View style={styles.dataContainer}>
                  <Text style={styles.dataLabel}>{paramShortName}</Text>
                  <Text style={styles.dataValue}>
                    {station.chuvaAcumulada?.toFixed(2) || "0.00"} {unit}
                  </Text>
                </View>
              )}
            </View>
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
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText} onPress={showDebugInfo}>
          {selectedParametro || "Chuva Acumulada"} ({timeRange || 168}h)
        </Text>
      </View>

      {/* Debug button - can be removed in production */}
      <View style={styles.debugButtonContainer}>
        <Text style={styles.debugButton} onPress={showDebugInfo}>
          Debug
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
  debugButtonContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  debugButton: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
