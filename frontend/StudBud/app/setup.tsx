import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';

export default function SetUp() {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineLarge" style={styles.title}>
          Create Profile
        </Text>
        <ThemedText type = "subtitle">
        The name entered below will be what people see when you post (make it your real name!).
        </ThemedText>
        <TextInput
          label="Enter Your Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          label="Enter Your Graduation Year"
          value={year}
          onChangeText={setYear}
          style={styles.input}
        />

        <TextInput
          label="Enter Your Major"
          value={major}
          onChangeText={setMajor}
          style={styles.input}
        />

        <Button
          mode="contained"
          style={styles.button}
          onPress={() => {
            if (!name.trim() || !year.trim() || !major.trim()) {
              Alert.alert('Incomplete Profile', 'Please fill out all fields.');
              return;
            }
            router.replace('/(tabs)/explore');
          }}
        >
          Make Profile
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
  },
  button: {
    marginTop: 20,
    width: '100%',
  },
});
