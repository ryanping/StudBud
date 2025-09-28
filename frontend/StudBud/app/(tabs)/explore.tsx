import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, TextInput, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

// Define a type for our Post object for better type-safety
interface Post {
  id: number;
  author_name: string;
  location: string;
  activity: string;
  people_needed: number;
  people_joined: number;
  created_at: string;
}

export default function ExploreScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  
  // State for search inputs
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');

  const fetchPosts = useCallback(async () => {
      setLoading(true);
      setError(null);

      // Determine if we are searching or just fetching all posts
      const isSearching = activity.trim() !== '' || location.trim() !== '';
      const baseUrl = process.env.EXPO_PUBLIC_API_URL;
      const url = isSearching 
        ? `${baseUrl}/api/posts/search`
        : `${baseUrl}/api/posts`;

      const options: RequestInit = {
        method: isSearching ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (isSearching) {
        options.body = JSON.stringify({
          activity: activity.trim() || 'any',
          locations: location.trim() ? location.split(',').map(l => l.trim()) : [],
          priority: 'activity', // Or 'location', depending on desired default
        });
      }

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
  }, [activity, location]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); // Re-run the effect when search terms change


  const renderPost = ({ item }: { item: Post }) => (
    <ThemedView style={styles.postCard}>
      <ThemedText type="subtitle">{item.activity} at {item.location}</ThemedText>
      <ThemedText>Posted by: {item.author_name}</ThemedText>
      <ThemedText>Looking for {item.people_needed} more people.</ThemedText>
    </ThemedView>
  );

  const dynamicStyles = {
    input: {
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      color: Colors[colorScheme ?? 'light'].text,
      borderColor: Colors[colorScheme ?? 'light'].icon, // Using icon color for border as it's usually a good contrast
    },
    placeholderTextColor: Colors[colorScheme ?? 'light'].tabIconDefault,
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Explore Posts</ThemedText>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder="Filter by activity (e.g., 'ECO3101')"
          placeholderTextColor={dynamicStyles.placeholderTextColor}
          value={activity}
          onChangeText={setActivity}
        />
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder="Filter by location (e.g., 'Marston')"
          placeholderTextColor={dynamicStyles.placeholderTextColor}
          value={location}
          onChangeText={setLocation}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <ThemedText>Error: {error}</ThemedText>
      ) : (
        <FlatList data={posts} renderItem={renderPost} keyExtractor={(item) => item.id.toString()} ListEmptyComponent={<ThemedText>No posts found.</ThemedText>}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  title: {
    marginBottom: 8,
  },
  searchContainer: {
    gap: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  postCard: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333', // A subtle border for the card
    gap: 4,
  },
});
