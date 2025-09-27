// app/(tabs)/_layout.tsx

import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6200ee', // Your theme's primary color
      }}>
      <Tabs.Screen
        name="index" // This links to index.tsx
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="explore" // This links to explore.tsx
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="magnify" color={color} size={28} />,
        }}
      />
      {/* You can add more tabs here, like for a profile screen */}
    </Tabs>
  );
}