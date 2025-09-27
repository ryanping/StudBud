import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, View } from 'react-native';

export default function LoginScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome to StudBud</ThemedText>
      <ThemedText style={styles.subtitle}>Please log in to continue</ThemedText>

      {/* This is a placeholder for login functionality */}

      <View style={styles.buttonContainer}>
        <Link href="/explore" asChild>
          <Button title="Continue to Explore" />
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '60%',
  },
});