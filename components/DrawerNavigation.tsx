import React, { useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Button,
} from "react-native";
import { Input } from "react-native-elements";
import HomeScreen from "../screens/HomeScreen";
import Slider from "@react-native-community/slider";
import DropDownPicker from "react-native-dropdown-picker";

const Drawer = createDrawerNavigator();

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

export function MyDrawer() {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [opacity, setOpacity] = useState(1);
  const [openParametro, setOpenParametro] = useState(false);
  const [selectedParametro, setSelectedParametro] = useState(null);

  const handleSearch = (text) => {
    setSearchText(text);
    const filteredStations = stations.filter((station) =>
      station.title.toLowerCase().includes(text.toLowerCase())
    );
    setSuggestions(filteredStations);
  };

  const [parametros, setParametros] = useState([
    { label: "Chuva Acumulada (mm)", value: "Chuva Acumulada (mm)" },
    { label: "Chuva Instantanea (mm)", value: "Chuva Instantanea (mm)" },
    { label: "Chuva Deslizamento (mm)", value: "Chuva Deslizamento (mm)" },
    { label: "Rio m", value: "Rio m" },
    { label: "Temperatura", value: "Temperatura" },
  ]);

  const selectStation = (station) => {
    setSelectedStation(station);
    setSearchText(station.title);
    setSuggestions([]);
  };

  const applySelection = (navigation) => {
    navigation.navigate("HomeScreen", { selectedStation, opacity });
  };

  const [valoresPreDefinidos, setValoresPreDefinidos] = useState([
    { label: "Chuva Acumulada (mm)", value: "12,5 mm" },
    { label: "Chuva Instantanea (mm)", value: "15,5 mm" },
    { label: "Chuva Deslizamento (mm)", value: "2,5 mm" },
    { label: "Rio m", value: "8,2 m" },
    { label: "Temperatura", value: "25 C°" },
  ]);

  const removeSelection = () => {
    setSelectedStation(null);
    setSearchText("");
    setSuggestions([]);
    setSelectedParametro(null);
  };

  return (
    <Drawer.Navigator
      id={"my-drawer"}
      drawerContent={({ navigation }) => (
        <View style={styles.drawerContent}>
          <View style={styles.contentContainer}>
            <Input
              placeholder="Buscar Estação"
              value={searchText}
              onChangeText={handleSearch}
              style={styles.searchInput}
            />
            {searchText.length > 0 && (
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => selectStation(item)}>
                    <Text style={styles.suggestionItem}>{item.title}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
          <View style={styles.dropInfos}>
            <DropDownPicker
              open={openParametro}
              value={selectedParametro}
              items={parametros}
              setOpen={setOpenParametro}
              setValue={setSelectedParametro}
              setItems={setParametros}
              closeAfterSelecting={true}
              placeholder="Parâmetro"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={1000}
              onChangeValue={(value) => {
                const preDefinido = valoresPreDefinidos.find(
                  (item) => item.label === value
                );
                console.log(preDefinido);
              }}
            />
            <Input
              value={
                valoresPreDefinidos.find(
                  (item) => item.label === selectedParametro
                )?.value
              }
              clearButtonMode="always"
              placeholder="Parâmetro"
              style={styles.input}
            ></Input>
          </View>
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
        initialParams={{ selectedStation: null, opacity: 1 }}
        options={{
          headerBackground: () => (
            <View style={{ backgroundColor: "#143D60" }} />
          ),
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
    backgroundColor: "#143D60",
  },
  contentContainer: { marginBottom: 20 },
  footerContainer: { marginBottom: 5, alignItems: "center" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    color: "#fff",
    backgroundColor: "#143D60",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    color: "#fff",
  },
  drawerFooter: { alignItems: "center" },
  profilePhoto: { width: 200, height: 100, borderRadius: 50, marginBottom: 20 },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
  opacityContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  buttonTextAplicar: { color: "#fff", textAlign: "center", fontSize: 16 },
  opacityText: { color: "#000" },
  dropInfos: {
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    height: 180,
  },
  dropdown: {
    marginBottom: 16,
    borderColor: "#ccc",
    width: "100%",
  },
  dropdownContainer: {
    width: "100%",
  },
  input: {
    borderWidth: 1,
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
  buttonTextLimpar: { color: "#fff", textAlign: "center", fontSize: 16 },
  textFooter: { color: "#fff" },
});
