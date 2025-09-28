import React, { useState } from 'react';
import { View, StyleSheet, Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import axios from 'axios';

export default function IndexScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  // State to manage which step of the login we are on
  const [step, setStep] = useState<'enter-email' | 'enter-code'>('enter-email');

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    if (!email.toLowerCase().endsWith('@ufl.edu')) {
      Alert.alert('Invalid Email', 'Please use a valid @ufl.edu email address.');
      return;
    }
    Keyboard.dismiss();
    setLoading(true);

    try {
      await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/send-code`, {
        email: email,
      });
      Alert.alert('Success', 'A verification code has been sent to your email.');
      setStep('enter-code'); // Move to the next step
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the verification code.');
      return;
    }
    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/verify-code`, {
        email: email,
        code: code,
      });

      const { isProfileComplete, userId } = response.data;

      // In a real app, you would save the userId and a session token securely
      // For now, we'll decide where to navigate

      if (isProfileComplete) {
        // If profile is complete, go to the main app
        router.replace('/(tabs)/explore');
      } else {
        // If profile is not complete, navigate to the profile screen to finish setup
        // We can pass the userId as a query parameter
        router.replace({ pathname: '/setup', params: { userId: userId, isNewUser: 'true' } });
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setCode('');
    setStep('enter-email');
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require('@/assets/images/gatorman.png')} style={styles.logo} />
        <Text variant="headlineLarge" style={styles.title}>Welcome to StudBud</Text>
        
        <TextInput
          label="UFL Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={step === 'enter-code'}
        />

        {step === 'enter-code' && (
          <TextInput
            label="Verification Code"
            value={code}
            onChangeText={setCode}
            style={styles.input}
            keyboardType="number-pad"
          />
        )}

        {step === 'enter-email' ? (
          <Button mode="contained" onPress={handleSendCode} style={styles.button} disabled={loading} loading={loading}>
            Send Code
          </Button>
        ) : (
          <>
            <Button mode="contained" onPress={handleVerifyCode} style={styles.button} disabled={loading} loading={loading}>
              Verify & Login
            </Button>
            <Button
              mode="text"
              onPress={resetFlow}
              style={styles.button}
              disabled={loading}
            >
              Use a different email
            </Button>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 400,
    height: 200,
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    width: '100%',
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