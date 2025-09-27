import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome to StudBud</ThemedText>
      <ThemedText style={styles.subtitle}>I'd love to bud with a stud :D</ThemedText>

      {/* This is a placeholder for login functionality */}

      <View style={styles.buttonContainer}>
        <Button
          title="Continue to App"
          onPress={() => router.replace('/explore')}
        />
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