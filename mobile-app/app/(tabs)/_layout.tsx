import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform, StyleSheet } from 'react-native';
import React from 'react';

import FloatingChatBot from '../../components/FloatingChatBot';

export default function TabLayout() {
    return (
        <View style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#4CAF50',
                    tabBarInactiveTintColor: '#9CA3AF',
                    tabBarShowLabel: false, // Cleaner look like the image
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                        right: 20,
                        height: 65,
                        borderRadius: 30,
                        backgroundColor: '#111827', // Dark background like the image
                        borderTopWidth: 0,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.3,
                        shadowRadius: 15,
                        elevation: 10,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <View style={focused ? styles.activeIconCircle : null}>
                                <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={focused ? '#fff' : color} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="insurance"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <View style={focused ? styles.activeIconCircle : null}>
                                <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={24} color={focused ? '#fff' : color} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="map"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <View style={focused ? styles.activeIconCircle : null}>
                                <Ionicons name={focused ? 'map' : 'map-outline'} size={24} color={focused ? '#fff' : color} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <View style={focused ? styles.activeIconCircle : null}>
                                <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={focused ? '#fff' : color} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="chat"
                    options={{
                        href: null,
                    }}
                />
            </Tabs>
            <FloatingChatBot />
        </View>
    );
}

const styles = StyleSheet.create({
    activeIconCircle: {
        backgroundColor: '#2D7D46',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        alignItems: 'center',
        justifyContent: 'center',
        // Slight pop-up effect
        marginTop: -5,
    }
});
