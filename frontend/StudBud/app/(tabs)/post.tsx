import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import React, { useState } from 'react';
import { TextInput, Button, useTheme, MD3Theme, Text } from 'react-native-paper';
import { useGlobalSearchParams, router } from 'expo-router';
import axios from 'axios';

export default function PostScreen() {
  const { email: userEmail } = useGlobalSearchParams<{ email: string }>();
  // The backend uses 'activity' for the course/subject, so we'll remove the separate 'title' field.
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [peopleNeeded, setPeopleNeeded] = useState('');
  const [durationHours, setDurationHours] = useState('1'); // Default to 1 hour
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const styles = getStyles(theme);

  const handleCreatePost = async () => {
    if (!activity.trim() || !location.trim() || !peopleNeeded.trim() || !durationHours.trim()) {
      Alert.alert('Incomplete Post', 'Please fill out all fields.');
      return;
    }
    if (!userEmail) {
      Alert.alert('Error', 'Could not identify user. Please restart the app.');
      return;
    }

    setLoading(true);
    try {
      // First, get the user's ID from their email
      const profileRes = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/user/profile?email=${userEmail}`);
      const author_id = profileRes.data.id;

      if (!author_id) {
        throw new Error("Could not find user ID.");
      }

      // Now, create the post
      await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/posts`, {
        author_id: author_id,
        activity: activity.toLowerCase(),
        location: location.toLowerCase(),
        people_needed: parseInt(peopleNeeded, 10),
        duration_hours: parseInt(durationHours, 10),
      });

      Alert.alert('Success!', 'Your post has been created.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/explore') }
      ]);
      // Clear form
      setActivity('');
      setLocation('');
      setPeopleNeeded('');
      setDurationHours('1');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      Alert.alert('Post Creation Failed', errorMessage);
    } finally {
      setLoading(false);
    }
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

        <TextInput label="Activity / Course" placeholder="ex. mac2313" value={activity} onChangeText={setActivity} style={styles.input} autoCapitalize="none" />

        <TextInput label="Location" placeholder="ex. marston" value={location} onChangeText={setLocation} style={styles.input} autoCapitalize="none" />

        <TextInput label="People Needed" placeholder="4" value={peopleNeeded} onChangeText={setPeopleNeeded} style={styles.input} keyboardType="numeric" />

        <TextInput label="Duration (in hours)" value={durationHours} onChangeText={setDurationHours} style={styles.input} keyboardType="numeric" />

        <Button
          mode="contained"
          onPress={handleCreatePost}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Create Post'}
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
    flexGrow: 1,
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