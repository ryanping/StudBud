import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // IMPORTANT: Replace with your actual server IP/domain
        const response = await fetch('http://10.136.232.149:5000/api/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const renderPost = ({ item }: { item: Post }) => (
    <ThemedView style={styles.postCard}>
      <ThemedText type="subtitle">{item.activity} at {item.location}</ThemedText>
      <ThemedText>Posted by: {item.author_name}</ThemedText>
      <ThemedText>Looking for {item.people_needed} more people.</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Explore</ThemedText>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <ThemedText>Error: {error}</ThemedText>
      ) : (
        <FlatList data={posts} renderItem={renderPost} keyExtractor={(item) => item.id.toString()} />
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
  postCard: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333', // A subtle border for the card
    gap: 4,
  },
});
