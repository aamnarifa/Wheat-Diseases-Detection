import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getProfile, removeToken } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getProfile();
            setUser(data);
        } catch(e) {
            // Token likely invalid or missing
            router.replace('/login');
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        await removeToken();
        router.replace('/login');
    }

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2D7D46" /></View>;

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#2D7D46', '#4CAF50']} style={styles.header}>
                <Ionicons name="person-circle" size={80} color="white" />
                <Text style={styles.title}>Farmer Profile</Text>
            </LinearGradient>
            <View style={styles.card}>
                <Text style={styles.label}>Username</Text>
                <Text style={styles.value}>{user?.user || "Unknown"}</Text>
                
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="white" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#F8FAF8' },
    header: { paddingTop: 80, paddingBottom: 50, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    title: { fontSize: 24, fontWeight: '900', color: 'white', marginTop: 10 },
    card: { backgroundColor: 'white', margin: 20, padding: 25, borderRadius: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: {width: 0, height: 4} },
    label: { color: '#6B7280', fontSize: 12, fontWeight: 'bold' },
    value: { fontSize: 18, color: '#1F2937', fontWeight: 'bold', marginTop: 5, marginBottom: 40 },
    logoutButton: { backgroundColor: '#EF4444', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});
