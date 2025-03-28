import LoginScreen from "./screens/LoginScreen";
import MainNavigator from "./navigator/MainNavigator";
import { NavigationIndependentTree } from "@react-navigation/native";
import { useState } from "react";

export default function App() {
  const [isLoggedIn, setLoggedIn] = useState(false);

  return (
    <NavigationIndependentTree>
      {isLoggedIn ? (
        <MainNavigator />
      ) : (
        <LoginScreen onLoginSuccess={() => setLoggedIn(true)} />
      )}
    </NavigationIndependentTree>
  );
}
