import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TextInput, Alert, ActivityIndicator, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useGlobalSearchParams, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { Button } from 'react-native-paper';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function ProfileScreen() {
    const { email: userEmail } = useGlobalSearchParams<{ email: string }>();
    const [name, setName] = useState('');
    const colorScheme = useColorScheme() ?? 'light';

    const [major, setMajor] = useState('');
    const [year, setYear] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

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

    const handleUpdateProfile = async () => {
        if (!name.trim() || !year.trim() || !major.trim()) {
            Alert.alert('Incomplete Profile', 'Please fill out all fields.');
            return;
        }
        if (!userEmail) {
            Alert.alert('Error', 'User email not found. Please try logging in again.');
            return;
        }

        setIsUpdating(true);
        try {
            await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/profile`, {
                email: userEmail,
                display_name: name,
                year: year,
                major: major,
            });
            Alert.alert('Success', 'Your profile has been updated.');
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
            Alert.alert('Profile Update Failed', errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    const inputStyle = {
        height: 40,
        borderColor: Colors[colorScheme].icon,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        color: Colors[colorScheme].text,
        width: '100%',
    };

    const disabledInputStyle = {
        ...inputStyle,
        backgroundColor: colorScheme === 'dark' ? '#333333' : '#E0E0E0',
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
        >
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                keyboardShouldPersistTaps="handled"
            >
                <ThemedView style={styles.container}>
                    <View style={styles.content}>
                        <ThemedText type="title">Name</ThemedText>
                        <TextInput
                            style={inputStyle}
                            onChangeText={setName}
                            value={name}
                            placeholder="Firstname Lastname"
                            placeholderTextColor={Colors[colorScheme].icon}
                        />
                        <ThemedText type="subtitle">Major: </ThemedText>
                        <TextInput
                            style={inputStyle}
                            onChangeText={setMajor}
                            value={major}
                            placeholder="Major(s)"
                            placeholderTextColor={Colors[colorScheme].icon}
                        />
                        <ThemedText type="subtitle">Year: </ThemedText>
                        <TextInput
                            style={inputStyle}
                            onChangeText={setYear}
                            value={year}
                            placeholder="2xxx"
                            placeholderTextColor={Colors[colorScheme].icon}
                            keyboardType="numeric"
                        />
                        <ThemedText type="subtitle">Email: </ThemedText>
                        <TextInput
                            style={disabledInputStyle}
                            value={email}
                            placeholder="user@ufl.edu"
                            placeholderTextColor={Colors[colorScheme].icon}
                            editable={false} // Email is usually not editable
                        />
                    </View>
                    {loading && <ActivityIndicator size="large" color="#aeb3ffff" />}
                    <Button
                        mode="contained"
                        onPress={handleUpdateProfile}
                        style={styles.button}
                        loading={isUpdating}
                        disabled={isUpdating || loading}
                        contentStyle={styles.buttonContent}
                    >
                        Update Profile
                    </Button>
                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    gap: 16,
  },
  button: {
    marginTop: 20,
    width: '100%',
    alignSelf: 'center',
  },
  buttonContent: {
    paddingVertical: 8,
  }
});