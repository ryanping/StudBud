import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useGlobalSearchParams, useFocusEffect } from 'expo-router';
import axios from 'axios';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProfileScreen() {
    const { email: userEmail } = useGlobalSearchParams<{ email: string }>();
    const [name, setName] = useState('');
    const [major, setMajor] = useState('');
    const [year, setYear] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        if (!userEmail) {
            Alert.alert('Error', 'Could not find user profile.');
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/user/profile?email=${userEmail}`);
            const { display_name, major, year, email } = response.data;
            setName(display_name || '');
            setMajor(major || '');
            setYear(year?.toString() || '');
            setEmail(email || '');
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch profile data.');
        } finally {
            setLoading(false);
        }
    }, [userEmail]);

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [fetchProfile])
    );

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title">Name</ThemedText>
            <TextInput
                style={styles.input}
                onChangeText={setName}
                value={name}
                placeholder="Firstname Lastname"
                placeholderTextColor="#999"
            />
            <ThemedText type="subtitle">Major: </ThemedText>
            <TextInput
                style={styles.input}
                onChangeText={setMajor}
                value={major}
                placeholder="Major(s)"
                placeholderTextColor="#999"
            />
            <ThemedText type="subtitle">Year: </ThemedText>
            <TextInput
                style={styles.input}
                onChangeText={setYear}
                value={year}
                placeholder="2xxx"
                placeholderTextColor="#999"
                keyboardType="numeric"
            />
            <ThemedText type="subtitle">Email: </ThemedText>
            <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                placeholder="user@ufl.edu"
                placeholderTextColor="#999"
                editable={false} // Email is usually not editable
            />
            {loading && <ActivityIndicator size="large" color="#aeb3ffff" />}
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
  disabledInput: {
    backgroundColor: '#333333', // A slightly different background for disabled fields
  },
});