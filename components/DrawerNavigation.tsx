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
];

export function MyDrawer() {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [opacity, setOpacity] = useState(1);

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
  };

  const applySelection = (navigation) => {
    navigation.navigate("HomeScreen", { selectedStation, opacity });
  };

  const removeSelection = () => {
    setSelectedStation(null);
    setSearchText("");
    setSuggestions([]);
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
          <View style={styles.opacityContainer}>
            <Text>Opacidade: {Math.round(opacity * 100)}%</Text>
            <Slider
              value={opacity}
              onValueChange={setOpacity}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
            />
          </View>
          <View style={styles.footerContainer}>
            <View style={styles.buttonContainer}>
              <Button
                title="Aplicar"
                onPress={() => applySelection(navigation)}
              />
              <Button title="Remover" onPress={removeSelection} />
            </View>
            <View style={styles.drawerFooter}>
              <Image
                source={require("../assets/logoazul.png")}
                style={styles.profilePhoto}
              />
              <Text>Desenvolvido por Mks</Text>
            </View>
          </View>
        </View>
      )}
    >
      <Drawer.Screen
        name="HomeScreen"
        component={HomeScreen}
        initialParams={{ selectedStation: null, opacity: 1 }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: { flex: 1, padding: 16, justifyContent: "center" },
  contentContainer: { marginBottom: 20 },
  footerContainer: { marginBottom: 20 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  drawerFooter: { alignItems: "center" },
  profilePhoto: { width: 200, height: 100, borderRadius: 50, marginBottom: 20 },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  opacityContainer: { marginBottom: 20 },
});
