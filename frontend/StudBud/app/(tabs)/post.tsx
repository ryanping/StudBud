import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { TextInput, Button, useTheme, MD3Theme, Text } from 'react-native-paper';

export default function PostScreen() {
  const [title, setTitle] = useState('');
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [peopleNeeded, setPeopleNeeded] = useState('');
  const [peopleJoined, setPeopleJoined] = useState('');
  const theme = useTheme();
  const styles = getStyles(theme);

  const handleCreatePost = () => {
    // TODO: Implement post creation logic
    console.log({ title, activity, location, peopleNeeded, peopleJoined });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineLarge" style={styles.title}>
          Create Post
        </Text>

        <TextInput label="Title / Description" value={title} onChangeText={setTitle} style={styles.input} />

        <TextInput label="Activity" placeholder="ex. mac2313" value={activity} onChangeText={setActivity} style={styles.input} />

        <TextInput label="Location" placeholder="marston" value={location} onChangeText={setLocation} style={styles.input} />

        <TextInput label="People Needed" placeholder="4" value={peopleNeeded} onChangeText={setPeopleNeeded} style={styles.input} keyboardType="numeric" />

        <TextInput label="People Joined" placeholder="1" value={peopleJoined} onChangeText={setPeopleJoined} style={styles.input} keyboardType="numeric" />

        <Button
          mode="contained"
          onPress={handleCreatePost}
          style={styles.button}
        >
          Create Post
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: MD3Theme) => StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 50, // Add some padding to the top
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    width: '100%',
  },
  button: {
    marginTop: 20,
    width: '100%',
  },
  link: {
    marginTop: 15,
    textAlign: 'center',
  }
});