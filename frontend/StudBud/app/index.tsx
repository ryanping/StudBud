import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert } from 'react-native';
import axios from 'axios';

// IMPORTANT: Replace this with your computer's local IP address.
// On Windows, open cmd and type 'ipconfig'. On Mac, type 'ifconfig' in terminal.
// Your phone must be on the same Wi-Fi network as your computer.
const API_URL = 'http://192.168.1.100:5000'; // Example IP, change this!

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.endsWith('@ufl.edu')) {
      Alert.alert('Invalid Email', 'Please use a valid @ufl.edu email address.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/send-code`, { email });
      Alert.alert('Code Sent', 'Check your email for the verification code.');
      setIsCodeSent(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-code`, { email, code });
      // On successful verification, navigate to the main app
      // In a real app, you'd save the user ID and token from the response
      Alert.alert('Success!', response.data.message);
      router.replace('/explore');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/gatorman.png')}
        style={styles.gatorMan}
      />

      <ThemedText type="title">Welcome to StudBud!!!</ThemedText>
      <ThemedText style={styles.subtitle}>I'd love to bud with a stud :D</ThemedText>

      <View style={styles.authContainer}>
        <TextInput
          style={styles.input}
          placeholder="UFL Email (@ufl.edu)"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isCodeSent} // Lock email field after sending code
        />
        {!isCodeSent ? (
          <Pressable style={styles.button} onPress={handleSendCode} disabled={loading}>
            <ThemedText style={styles.buttonText}>{loading ? 'Sending...' : 'Send Code'}</ThemedText>
          </Pressable>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="6-Digit Code"
              placeholderTextColor="#999"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <Pressable style={styles.button} onPress={handleVerifyCode} disabled={loading}>
              <ThemedText style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify & Login'}</ThemedText>
            </Pressable>
          </>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  gatorMan: {
    width: 450,
    height: 200,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
  },
  authContainer: {
    width: '60%',
    gap: 12,
  },
  input: {
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: 'white', // Assuming dark mode
    backgroundColor: '#333',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'lightblue',
  },
  buttonText: {
    color: '#111',
    fontWeight: 'bold',
  },
});