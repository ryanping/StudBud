// app/(auth)/login.tsx

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link, router } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../_layout'; // Import the useAuth hook

// IMPORTANT: Make sure this matches the API_URL in your register screen
const API_URL = 'http://192.168.1.100:5000'; // Example IP, change this!

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const handleLogin = async () => {
    // 1. Basic client-side validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    // 2. Call the Flask API
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email,
        password: password,
      });

      // 3. On success, update auth state and navigate
      // Assuming the API returns a success message and maybe a token
      auth?.login(); // Update the global auth state
      // The root layout's useEffect will handle navigation to '/(tabs)/feed'

    } catch (error: any) {
      // 4. Handle errors from the API
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>Welcome to StudBud</Text>

      <TextInput
        label="UFL Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
        disabled={loading}
        loading={loading}>
        Login
      </Button>

      <Link href="/register" style={styles.link}>
         Don't have an account? Sign up
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  link: {
    marginTop: 15,
    textAlign: 'center',
    color: '#6200ee', // Match the register screen's link color
  }
});