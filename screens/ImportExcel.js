import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import { ref, set, push } from 'firebase/database';
import { db } from '../firebaseConfig';

export default function ImportExcel() {
  const [importProgress, setImportProgress] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);

  const handlePickDocument = async () => {
    try {
      setIsImporting(true);
      setImportProgress({});
      setTotalProgress(0);

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel'
        ]
      });

      if (result.canceled) {
        setIsImporting(false);
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });

      const binaryData = atob(fileContent);
      const workbook = XLSX.read(binaryData, { type: 'binary' });

      let totalRecords = 0;
      let processedRecords = 0;

      // First calculate total records
      for (let sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        totalRecords += jsonData.length;
      }

      // Process each sheet
      for (let sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        if (jsonData.length > 0) {
          setImportProgress(prev => ({
            ...prev,
            [sheetName]: {
              current: 0,
              total: jsonData.length,
              percentage: 0
            }
          }));

          await insertDataIntoFirebase(sheetName, jsonData, (current) => {
            const newProcessed = processedRecords + current;
            const newPercentage = Math.round((newProcessed / totalRecords) * 100);
            
            setImportProgress(prev => ({
              ...prev,
              [sheetName]: {
                current,
                total: jsonData.length,
                percentage: Math.round((current / jsonData.length) * 100)
              }
            }));
            
            setTotalProgress(newPercentage);
          });

          processedRecords += jsonData.length;
        }
      }

      Alert.alert("Success", "Excel data imported successfully!");
    } catch (error) {
      console.error("Error processing file:", error);
      Alert.alert("Error", "Failed to import the Excel file.");
    } finally {
      setIsImporting(false);
    }
  };

  const insertDataIntoFirebase = async (sheetName, jsonData, onProgress) => {
    try {
      const batchSize = 10; // Process records in batches for better performance
      let processedCount = 0;

      if (sheetName === 'queues' || sheetName === 'subjects') {
        for (let i = 0; i < jsonData.length; i += batchSize) {
          const batch = jsonData.slice(i, i + batchSize);
          await Promise.all(batch.map(row => {
            const newRef = push(ref(db, sheetName.toLowerCase()));
            return set(newRef, row);
          }));
          
          processedCount += batch.length;
          onProgress(processedCount);
        }
      } else {
        for (let i = 0; i < jsonData.length; i += batchSize) {
          const batch = jsonData.slice(i, i + batchSize);
          await Promise.all(batch.map(row => {
            const idKey = Object.keys(row)[0];
            const recordId = row[idKey];
            if (!recordId) return Promise.resolve();
            
            const dataWithoutId = { ...row };
            delete dataWithoutId[idKey];
            
            return set(ref(db, `${sheetName.toLowerCase()}/${recordId}`), dataWithoutId);
          }));
          
          processedCount += batch.length;
          onProgress(processedCount);
        }
      }
      console.log(`Inserted data into ${sheetName}`);
    } catch (error) {
      console.error(`Error inserting data for ${sheetName}:`, error);
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePickDocument}
        style={styles.importButton}
        disabled={isImporting}
      >
        <Text style={styles.buttonText}>
          {isImporting ? 'Importing...' : 'Import Data'}
        </Text>
      </TouchableOpacity>

      {isImporting && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressHeader}>Overall Progress: {totalProgress}%</Text>
          <View style={styles.totalProgressBar}>
            <View 
              style={[
                styles.totalProgressFill, 
                { width: `${totalProgress}%` }
              ]} 
            />
          </View>

          {Object.entries(importProgress).map(([sheetName, progress]) => (
            <View key={sheetName} style={styles.sheetProgressContainer}>
              <Text style={styles.sheetName}>{sheetName}</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${progress.percentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.percentageText}>{progress.percentage}%</Text>
              </View>
              <Text style={styles.countText}>
                {progress.current} of {progress.total} records
              </Text>
            </View>
          ))}

          <ActivityIndicator size="large" color="#6200EE" style={styles.spinner} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  importButton: { 
    backgroundColor: '#6200EE', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 20 
  },
  buttonText: { 
    color: '#FFF', 
    fontSize: 16 
  },
  progressContainer: {
    width: '100%',
    marginTop: 20,
  },
  progressHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  totalProgressBar: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  totalProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  sheetProgressContainer: {
    marginBottom: 15,
  },
  sheetName: {
    fontWeight: '600',
    marginBottom: 5,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200EE',
  },
  percentageText: {
    width: 50,
    textAlign: 'right',
  },
  countText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  spinner: {
    marginTop: 20,
  },
});