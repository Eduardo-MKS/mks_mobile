import React, { useState, useEffect, useRef } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Platform,
} from "react-native";
import { Input } from "react-native-elements";
import HomeScreen from "../screens/HomeScreen";
import Slider from "@react-native-community/slider";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import DropDownPicker from "react-native-dropdown-picker";

const Drawer = createDrawerNavigator();
const ESTACOES_API = "https://api-dcsc.mks-unifique.ddns.net/api/estacoes";

export function MyDrawer() {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [opacity, setOpacity] = useState(1);
  const [openParametro, setOpenParametro] = useState(false);
  const [selectedParametro, setSelectedParametro] = useState(null);
  const [stations, setStations] = useState([]);
  const [openTipos, setOpenTipos] = useState(false);
  const [selectedTipos, setSelectedTipos] = useState(null);
  const [isOpenInfo, setIsOpenInfo] = useState(false);
  const [isOpenRadar, setIsOpenRadar] = useState(false);
  const [isOpenSatelite, setIsOpenSatelite] = useState(false);
  const [timeRange, setTimeRange] = useState(168); // Default 168 hours (7 days)
  const searchInputRef = useRef(null);

  const [valoresPreDefinidos, setValoresPreDefinidos] = useState([
    { label: "Chuva Acumulada (mm)", value: "12,5 mm" },
    { label: "Chuva Instantanea (mm)", value: "15,5 mm" },
    { label: "Chuva Deslizamento (mm)", value: "2,5 mm" },
    { label: "Rio m", value: "8,2 m" },
    { label: "Temperatura", value: "25 C°" },
  ]);

  const [tipos, setTipos] = useState([
    { label: "5 minutos", value: "5 minutos" },
    { label: "10 minutos", value: "10 minutos" },
    { label: "15 minutos", value: "15 minutos" },
    { label: "30 minutos", value: "30 minutos" },
  ]);

  const [parametros, setParametros] = useState([
    { label: "Chuva Acumulada (mm)", value: "Chuva Acumulada (mm)" },
    { label: "Chuva Instantanea (mm)", value: "Chuva Instantanea (mm)" },
    { label: "Chuva Deslizamento (mm)", value: "Chuva Deslizamento (mm)" },
    { label: "Rio m", value: "Rio m" },
    { label: "Temperatura", value: "Temperatura" },
  ]);

  const [periodos, setPeriodos] = useState([
    { label: "Últimas 24 horas", value: 24 },
    { label: "Últimas 48 horas", value: 48 },
    { label: "Últimos 3 dias", value: 72 },
    { label: "Últimos 5 dias", value: 120 },
    { label: "Últimos 7 dias", value: 168 },
  ]);
  const [openPeriodos, setOpenPeriodos] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState(168);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get(ESTACOES_API);
        const stationsData = response.data.data;

        const stationsArray = Object.keys(stationsData).map((key) => ({
          id: key,
          title: stationsData[key].nome,
          latitude: stationsData[key].latitude,
          longitude: stationsData[key].longitude,
          description: stationsData[key].rio || "Sem descrição",
        }));

        setStations(stationsArray);
      } catch (error) {
        console.error("Erro ao buscar estações:", error);
        setStations([]);
      }
    };
    fetchStations();
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    const filteredStations = stations.filter((station) =>
      station.title.toLowerCase().includes(text.toLowerCase())
    );
    setSuggestions(filteredStations);
  };

  const selectStation = (station) => {
    setSelectedStation(station);
    setSearchText(station.title);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const applySelection = (navigation) => {
    navigation.navigate("HomeScreen", {
      selectedStation,
      opacity,
      timeRange: selectedPeriodo || timeRange,
      selectedParametro: selectedParametro || "Chuva Acumulada (mm)",
    });
  };

  const removeSelection = () => {
    setSelectedStation(null);
    setSearchText("");
    setSuggestions([]);
    setSelectedParametro(null);
    setSelectedTipos(null);
    setSelectedPeriodo(168);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const toggleOpenInfo = () => {
    setIsOpenInfo(!isOpenInfo);
  };

  const toggleOpenRadar = () => {
    setIsOpenRadar(!isOpenRadar);
  };

  const toggleOpenSatelite = () => {
    setIsOpenSatelite(!isOpenSatelite);
  };

  return (
    <Drawer.Navigator
      // @ts-ignore
      id={"my-drawer"}
      drawerContent={({ navigation }) => (
        <View style={styles.drawerContent}>
          <View style={styles.contentContainer}>
            <View style={styles.searchContainer}>
              <Input
                ref={searchInputRef}
                placeholder="Buscar Estação"
                value={searchText}
                onChangeText={handleSearch}
                style={styles.searchInput}
              />
              {searchText.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => selectStation(item)}>
                        <Text style={styles.suggestionItem}>{item.title}</Text>
                      </TouchableOpacity>
                    )}
                    style={styles.suggestionsList}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              )}
            </View>
          </View>

          <View style={styles.infoContainer}>
            <TouchableOpacity
              style={styles.infoHeader}
              onPress={toggleOpenInfo}
            >
              <Icon
                name="information-outline"
                size={20}
                color="#DDA853"
                style={styles.infoIcon}
              />
              <Text style={styles.radarTitle}>Informações</Text>
            </TouchableOpacity>
            {isOpenInfo && (
              <View style={styles.infoContainerDropdown}>
                <DropDownPicker
                  open={openParametro}
                  value={selectedParametro}
                  items={parametros}
                  setOpen={setOpenParametro}
                  setValue={setSelectedParametro}
                  setItems={setParametros}
                  closeAfterSelecting={true}
                  placeholder="Parâmetro"
                  zIndex={3000}
                  onChangeValue={(value) => {
                    const preDefinido = valoresPreDefinidos.find(
                      (item) => item.label === value
                    );
                    console.log(preDefinido);
                  }}
                />

                <DropDownPicker
                  open={openPeriodos}
                  value={selectedPeriodo}
                  items={periodos}
                  setOpen={setOpenPeriodos}
                  setValue={setSelectedPeriodo}
                  setItems={setPeriodos}
                  closeAfterSelecting={true}
                  placeholder="Período"
                  zIndex={2000}
                  style={styles.dropDownTime}
                />
              </View>
            )}
          </View>

          <View style={styles.rainContainer}>
            <TouchableOpacity
              style={styles.radarHeader}
              onPress={toggleOpenRadar}
            >
              <Icon
                name="radar"
                size={20}
                color="#DDA853"
                style={styles.radarIcon}
              />
              <Text style={styles.radarTitle}>Radar</Text>
            </TouchableOpacity>

            {isOpenRadar && (
              <View style={styles.opacityContainer}>
                <Text style={styles.opacityText}>
                  Opacidade: {Math.round(opacity * 100)}%
                </Text>
                <Slider
                  value={opacity}
                  onValueChange={setOpacity}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.01}
                />
              </View>
            )}
          </View>

          <View style={styles.rainContainer}>
            <TouchableOpacity
              style={styles.radarHeader}
              onPress={toggleOpenSatelite}
            >
              <Icon
                name="satellite-uplink"
                size={20}
                color="#DDA853"
                style={styles.radarIcon}
              />
              <Text style={styles.radarTitle}>Satelite</Text>
            </TouchableOpacity>

            {isOpenSatelite && (
              <View style={styles.opacityContainer}>
                <Text style={styles.opacityText}>Satelite em Andamento...</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => applySelection(navigation)}
              style={styles.buttonAplicar}
            >
              <Text style={styles.buttonTextAplicar}>APLICAR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonLimpar}
              onPress={removeSelection}
            >
              <Text style={styles.buttonTextLimpar}>LIMPAR</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <Image
              source={require("../assets/logoazul.png")}
              style={styles.profilePhoto}
            />
            <Text style={styles.textFooter}>Desenvolvido por Mks</Text>
          </View>
        </View>
      )}
    >
      <Drawer.Screen
        name="HomeScreen"
        component={HomeScreen}
        initialParams={{
          selectedStation: null,
          opacity: 1,
          timeRange: 168,
          selectedParametro: "Chuva Acumulada (mm)",
        }}
        options={{
          headerBackground: () => <View style={styles.drawerHeader} />,
          headerTintColor: "#DDA853",
          headerTitleStyle: {
            color: "#fff",
            fontSize: 20,
            fontWeight: "bold",
          },
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#000",
  },

  contentContainer: {
    marginBottom: 20,
  },

  footerContainer: {
    marginBottom: 5,
    alignItems: "center",
  },

  buttonContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    color: "#fff",
    backgroundColor: "#000",
  },

  searchContainer: {
    position: "relative",
    zIndex: 5000,
  },

  suggestionsContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 5000,
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
    color: "#fff",
  },

  drawerFooter: {
    alignItems: "center",
  },

  profilePhoto: {
    width: 200,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },

  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    color: "#000",
  },

  drawerHeader: {
    backgroundColor: "#000",
    height: "100%",
  },

  dropDownTipe: {
    marginTop: 10,
  },

  dropDownTime: {
    marginTop: 10,
    marginBottom: 10,
  },

  infoContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    margin: 10,
  },

  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },

  rainContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    margin: 10,
  },

  radarHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },

  infoIcon: {
    marginRight: 10,
  },

  radarIcon: {
    marginRight: 10,
  },

  radarTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  opacityContainer: {
    padding: 10,
    borderRadius: 5,
  },

  buttonTextAplicar: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },

  opacityText: {
    color: "#000",
  },

  dropInfos: {
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    height: 180,
  },

  infoContainerDropdown: {
    padding: 10,
    borderRadius: 5,
  },

  input: {
    borderColor: "#000",
    color: "#000",
    fontStyle: "italic",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    width: "100%",
  },

  buttonAplicar: {
    backgroundColor: "#DDA853",
    padding: 10,
    borderRadius: 5,
  },

  buttonLimpar: {
    backgroundColor: "#DDA853",
    padding: 10,
    borderRadius: 5,
  },

  buttonTextLimpar: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },

  textFooter: {
    color: "#fff",
  },

  suggestionsList: {
    maxHeight: 200,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
