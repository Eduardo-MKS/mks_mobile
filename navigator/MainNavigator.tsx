import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import { MyDrawer } from "../components/DrawerNavigation";
import MeusDadosScreen from "../screens/MeusDadosScreen";
import AlarmesScreen from "../screens/AlarmesScreen";

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        // @ts-ignore
        id="main-tab-navigator"
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          tabBarStyle: { backgroundColor: "#000" },
          tabBarActiveTintColor: "#DDA853",
          tabBarInactiveTintColor: "#fff",
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Home") iconName = "map";
            else if (route.name === "Meus Dados") iconName = "person";
            else if (route.name === "Alarmes") iconName = "notifications";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={MyDrawer}
          options={{ headerShown: false }}
        />
        <Tab.Screen name="Meus Dados" component={MeusDadosScreen} />
        <Tab.Screen name="Alarmes" component={AlarmesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
