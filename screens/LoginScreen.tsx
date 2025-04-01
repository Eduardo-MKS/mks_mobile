import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

const USER_DATA = { username: "admin", password: "1234" };

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === USER_DATA.username && password === USER_DATA.password) {
      onLoginSuccess();
    } else {
      Alert.alert("Erro", "Usuário ou senha inválido");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profilePhotoContainer}>
        <Image
          source={require("../assets/logoazul.png")}
          style={styles.profilePhoto}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="person" size={20} color="#fff" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Usuário"
          placeholderTextColor="#bbb"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed"
          size={20}
          color="#fff"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#bbb"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        onPress={() =>
          Alert.alert("Redefinir senha", "Função em desenvolvimento...")
        }
      >
        <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          Alert.alert("Cadastrar usuário", "Função em desenvolvimento...")
        }
      >
        <Text style={styles.cadastrarUsua}>Cadastre-Se</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonLogin} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>Ou faça login com</Text>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="google" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="facebook" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EEDC",
    alignItems: "center",
    justifyContent: "center",
  },
  profilePhotoContainer: {
    alignItems: "center",
  },
  profilePhoto: {
    width: 200,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#608BC1",
    width: "90%",
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
    color: "#608BC1",
  },
  input: {
    flex: 1,
    height: 40,
    color: "#608BC1",
  },
  forgotPasswordText: {
    color: "#608BC1",
    marginTop: 5,
    textDecorationLine: "underline",
  },
  buttonLogin: {
    width: "50%",
    marginTop: 16,
    backgroundColor: "#365486",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#F5EEDC",
    fontWeight: "bold",
  },
  orText: {
    color: "#608BC1",
    marginTop: 20,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  socialButton: {
    backgroundColor: "#365486",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  cadastrarUsua: {
    color: "#608BC1",
    marginTop: 5,
    textDecorationLine: "underline",
  },
});
