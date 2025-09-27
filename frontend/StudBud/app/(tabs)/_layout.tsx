// app/(tabs)/_layout.tsx

import React from 'react';
import { Tabs } from 'expo-router';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#aeb3ffff', // Your theme's primary color
      }}>
      <Tabs.Screen
        name="explore" // This links to explore.tsx
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="magnify" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="index" // This links to index.tsx
        options={{
          title: 'Post',
          tabBarIcon: ({ color }) => <FontAwesome name="plus" color={color} size={28} />,
        }}
      />
      {/* You can add more tabs here, like for a profile screen */}
    </Tabs>
  );
}