import { Image } from 'expo-image';
import { Platform, StyleSheet, TextInput} from 'react-native';
import React, { useState } from 'react';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function TabTwoScreen() {
    const [text, setText] = useState('');
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">
        Create Post
      </ThemedText>
      <TextInput
                      style={styles.input}
                      onChangeText={setText}
                      value={text}
                      placeholder="Firstname Lastname"
                      placeholderTextColor="#999"
                  />
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    gap: 16,
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
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: 'white' // Assuming dark mode, adjust if needed
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