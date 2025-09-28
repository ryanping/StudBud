import React, { useState } from 'react';
import { View, StyleSheet, Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme, MD3Theme } from 'react-native-paper';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import axios from 'axios';

export default function IndexScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  // State to manage which step of the login we are on
  const [step, setStep] = useState<'enter-email' | 'enter-code'>('enter-email');
  const theme = useTheme();
  const styles = getStyles(theme);

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

      if (isProfileComplete) {
        // If profile is complete, go to the main app
        router.replace({ pathname: '/(tabs)/explore', params: { email: email } });
      } else {
        // If profile is not complete, navigate to the setup screen
        router.replace({ pathname: '/setup', params: { email: email, isNewUser: 'true' } });
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

        <Link href="/setup" style={styles.button}>
          <Text>Go to Setup (Debug)</Text>
        </Link>
        <Link href="/(tabs)/explore" style={styles.button}>
          <Text>Explore Tab (Debug)</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: MD3Theme) => StyleSheet.create({
    keyboardAvoidingContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flexGrow: 1,
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
      // The color will be inherited from the theme via the Text component
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
      color: theme.colors.primary,
    }
  });