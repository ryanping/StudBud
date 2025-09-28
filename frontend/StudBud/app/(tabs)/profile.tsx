import React, { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProfileScreen() {
    const [text, setText] = useState('');

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title">Name</ThemedText>
            <TextInput
                style={styles.input}
                onChangeText={setText}
                value={text}
                placeholder="Firstname Lastname"
                placeholderTextColor="#999"
            />
            <ThemedText type="subtitle">Major: </ThemedText>
            <ThemedText type="subtitle">Year: </ThemedText>
            <ThemedText type="subtitle">Email: </ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    gap: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: 'white' // Assuming dark mode, adjust if needed
  },
});