import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Platform } from "react-native";
import Papa from "papaparse";
import { DataTable } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function AlarmesScreen() {
  const tableData = [
    {
      estacao: "SDC-SC Blumenau",
      hora: "10:00",
      valor: "5,34",
      msg: "Baixo",
    },
    {
      estacao: "SDC-SC Gaspar",
      hora: "10:00",
      valor: "5,34",
      msg: "Alto",
    },
    {
      estacao: "SDC-SC Ilhota",
      hora: "10:00",
      valor: "5,34",
      msg: "Baixo",
    },
    {
      estacao: "SDC-SC Brusque",
      hora: "10:00",
      valor: "5,34",
      msg: "Médio",
    },
    {
      estacao: "SDC-SC Gaspar",
      hora: "10:00",
      valor: "5,34",
      msg: "Baixo",
    },
    {
      estacao: "SDC-SC Blumenau",
      hora: "10:00",
      valor: "5,34",
      msg: "Médio",
    },
    {
      estacao: "SDC-SC Blumenau",
      hora: "10:00",
      valor: "5,34",
      msg: "Médio",
    },
    {
      estacao: "SDC-SC Blumenau",
      hora: "10:00",
      valor: "5,34",
      msg: "Médio",
    },
    {
      estacao: "SDC-SC Ilhota",
      hora: "10:00",
      valor: "5,34",
      msg: "Baixo",
    },
    {
      estacao: "SDC-SC Gaspar",
      hora: "10:00",
      valor: "5,34",
      msg: "Alto",
    },
    {
      estacao: "SDC-SC Brusque",
      hora: "10:00",
      valor: "5,34",
      msg: "Baixo",
    },
    {
      estacao: "SDC-SC Ilhota",
      hora: "10:00",
      valor: "5,34",
      msg: "Baixo",
    },
    {
      estacao: "SDC-SC Brusque",
      hora: "10:00",
      valor: "5,34",
      msg: "Alto",
    },
    {
      estacao: "SDC-SC Blumenau",
      hora: "10:00",
      valor: "5,34",
      msg: "Médio",
    },
  ];

  const handleDownload = async () => {
    try {
      const csv = Papa.unparse(tableData);
      const filename = FileSystem.documentDirectory + "dados.csv";
      await FileSystem.writeAsStringAsync(filename, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (Platform.OS === "android") {
        const contentUri = await FileSystem.getContentUriAsync(filename);
        await Linking.openURL(contentUri);
      } else if (Platform.OS === "ios") {
        await Sharing.shareAsync(filename, {
          mimeType: "text/csv",
          dialogTitle: "Compartilhar CSV",
        });
      }
    } catch (error) {
      console.error("Erro ao baixar o arquivo:", error);
    }
  };
  const getRowStyle = (msg: string) => {
    if (msg.toLowerCase().includes("alto")) {
      return { backgroundColor: "red" };
    } else if (msg.toLowerCase().includes("médio")) {
      return { backgroundColor: "yellow" };
    } else if (msg.toLowerCase().includes("baixo")) {
      return { backgroundColor: "lightgreen" };
    } else {
      return {};
    }
  };

  return (
    <ScrollView>
      <View style={styles.tableContainer}>
        <DataTable style={styles.table}>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title>Estação</DataTable.Title>
            <DataTable.Title>Hora</DataTable.Title>
            <DataTable.Title>Valor</DataTable.Title>
            <DataTable.Title>Mensagem</DataTable.Title>
          </DataTable.Header>

          {tableData.map((row, index) => (
            <DataTable.Row key={index} style={getRowStyle(row.msg)}>
              <DataTable.Cell>{row.estacao}</DataTable.Cell>
              <DataTable.Cell>{row.hora}</DataTable.Cell>
              <DataTable.Cell>{row.valor}</DataTable.Cell>
              <DataTable.Cell>{row.msg}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
        <View style={styles.downloadButtonsContainer}>
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.downloadButtonText} onPress={handleDownload}>
              Download
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tableContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#183B4E",
    alignItems: "center",
    justifyContent: "center",
  },
  table: {
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tableHeader: {
    backgroundColor: "#183B4E",
  },
  tableHeaderTitle: {
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#fff",
  },
  downloadButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  downloadButton: {
    backgroundColor: "#DDA853",
    fontSize: 16,
    padding: 14,
    borderRadius: 8,
    width: "40%",
    alignItems: "center",
    marginTop: 12,
    marginLeft: 5,
    marginBottom: 12,
  },
  downloadButtonText: {
    color: "#183B4E",
    fontSize: 16,
  },
});
