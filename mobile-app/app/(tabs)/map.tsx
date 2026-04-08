import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getScans } from '../../utils/api';
import MapLayer from '../../components/MapLayer';
import "../global.css";

const { width, height } = Dimensions.get('window');

type ScanData = {
  id: string;
  latitude: number;
  longitude: number;
  disease: string;
  confidence: number;
  severity: string;
};

export default function MapScreen() {
    const router = useRouter();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [scans, setScans] = useState<ScanData[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
      useCallback(() => {
        fetchScans();
      }, [])
    );

    const fetchScans = async () => {
        const data = await getScans();
        setScans(data);
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 bg-[#F8FAF8] items-center justify-center">
                <ActivityIndicator size="large" color="#2D7D46" />
                <Text className="mt-4 text-green-800 font-semibold">Loading Map...</Text>
            </View>
        );
    }

    // Default to Punjab coordinates if location not found
    const initialRegion = {
        latitude: location?.coords.latitude || 31.1471,
        longitude: location?.coords.longitude || 75.3412,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <View style={styles.container}>
            <MapLayer scans={scans} initialRegion={initialRegion} />

            {/* Error Message Display */}
            {errorMsg && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
            )}

            {/* Floating Action Button for Scan */}
            <TouchableOpacity 
                style={styles.fab} 
                onPress={() => router.push('/')}
                activeOpacity={0.8}
            >
                <Ionicons name="camera" size={28} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAF8',
    },
    errorContainer: {
        position: 'absolute',
        top: 50,
        backgroundColor: 'rgba(255,0,0,0.8)',
        padding: 10,
        marginHorizontal: 20,
        borderRadius: 8,
        alignSelf: 'center',
    },
    errorText: {
        color: 'white',
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: 100, // Above tab navigation
        right: 20,
        backgroundColor: '#2D7D46',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    }
});
