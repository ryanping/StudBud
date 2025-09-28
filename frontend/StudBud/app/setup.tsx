import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

export default function SetUp() {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineLarge" style={styles.title}>
          Create Profile
        </Text>

        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          label="Year"
          value={year}
          onChangeText={setYear}
          style={styles.input}
        />

        <TextInput
          label="Major"
          value={major}
          onChangeText={setMajor}
          style={styles.input}
        />

        <Button
          mode="contained"
          style={styles.button}
          onPress={() => {}}
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
    marginBottom: 10,
    width: '100%',
  },
  button: {
    marginTop: 20,
    width: '100%',
  },
});
