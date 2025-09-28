import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SetUp() {
  const params = useLocalSearchParams();
  const { userId } = params;

  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateProfile = async () => {
    if (!name.trim() || !year.trim() || !major.trim()) {
      Alert.alert('Incomplete Profile', 'Please fill out all fields.');
      return;
    }
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please try logging in again.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/profile`, {
        userId: userId,
        display_name: name,
        year: year,
        major: major,
      });
      router.replace({ pathname: '/(tabs)/explore', params: { userId: userId } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      Alert.alert('Profile Creation Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
          keyboardType="number-pad"
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
          onPress={handleCreateProfile}
          loading={loading}
          disabled={loading}
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
