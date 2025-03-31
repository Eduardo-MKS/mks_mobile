import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";

export default function MeusDadosScreen() {
  const usuarios = [
    {
      id: 1,
      nome: "Eduardo Decussi",
      email: "eduardo@mkssistemas.com.br",
      telefone: "47 99999-9999",
    },
  ];

  const usuarioId1 = usuarios.find((usuario) => usuario.id === 1);

  return (
    <View style={styles.container}>
      <View style={styles.profilePhotoContainer}>
        <Image
          source={require("../assets/person.png")}
          style={styles.profilePhoto}
        />
        <TouchableOpacity style={styles.loadButton}>
          <Text style={styles.loadButtonText}>Carregar Foto</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.hr} />
      <View style={styles.infoContainer}>
        {usuarioId1 ? (
          <View>
            <Text style={styles.textUser}>Usuário: {usuarioId1.nome}</Text>
            <Text style={styles.textEmail}>Email: {usuarioId1.email}</Text>
            <Text style={styles.textPhone}>
              Telefone: {usuarioId1.telefone}
            </Text>
          </View>
        ) : (
          <Text style={styles.notFound}>Usuário não encontrado</Text>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Configurações</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.logoutButton]}>
          <Text style={styles.buttonTextSair}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#183B4E",
  },
  profilePhotoContainer: {
    shadowColor: "#DDA853",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#DDA853",
  },
  hr: {
    width: "80%",
    height: 1,
    backgroundColor: "#DDA853",
    marginVertical: 20,
  },
  infoContainer: {
    alignItems: "center",
  },
  textUser: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#DDA853",
  },
  textEmail: {
    fontSize: 18,
    color: "#F5EEDC",
    marginBottom: 5,
  },
  textPhone: {
    fontSize: 18,
    color: "#DDA853",
  },
  notFound: {
    fontSize: 18,
    color: "#555",
  },
  buttonContainer: {
    marginTop: 30,
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#133E87",
    padding: 12,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#F3F3E0",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonTextSair: {
    color: "#133E87",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadButton: {
    backgroundColor: "#133E87",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  loadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
