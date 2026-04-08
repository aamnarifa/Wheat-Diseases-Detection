import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MapLayer(props: any) {
    return (
        <View style={styles.fallbackContainer}>
            <Ionicons name="map-outline" size={80} color="#2D7D46" />
            <Text style={styles.title}>Map Unavailable</Text>
            <Text style={styles.subtitle}>
                The Field Mapping feature relies on native code. Please use the Wheatify mobile application on an iOS or Android device.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    fallbackContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 12,
        textAlign: 'center',
        lineHeight: 24,
    }
});
