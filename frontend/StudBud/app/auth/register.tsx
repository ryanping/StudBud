// app/(auth)/register.tsx

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link, router } from 'expo-router';
import axios from 'axios';

// IMPORTANT: Replace this with your computer's local IP address
// On Windows, open cmd and type 'ipconfig'. On Mac, type 'ifconfig' in terminal.
// Your phone must be on the same Wi-Fi network as your computer.
const API_URL = 'http://192.168.1.100:5000'; // Example IP, change this!

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Basic client-side validation
    if (!displayName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (!email.endsWith('@ufl.edu')) {
      Alert.alert('Error', 'A valid @ufl.edu email is required.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    // 2. Call the Flask API
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        display_name: displayName, // Make sure your API expects this
        email: email,
        password: password,
      });

      // 3. On success, navigate to the verification screen
      Alert.alert('Success', response.data.message);
      // We will create the verify screen next
      router.push({ pathname: '/(auth)/verify', params: { email: email } });

    } catch (error: any) {
      // 4. Handle errors from the API
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>Create Account</Text>
      
      <TextInput
        label="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
        style={styles.input}
        autoCapitalize="words"
      />
      
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
      
      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        secureTextEntry
      />
      
      <Button 
        mode="contained" 
        onPress={handleRegister} 
        style={styles.button}
        disabled={loading}
        loading={loading}
      >
        Register
      </Button>

      <Link href="/login" style={styles.link}>
         Already have an account? Log in
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
    color: '#6200ee', // Default primary color for React Native Paper
  }
});