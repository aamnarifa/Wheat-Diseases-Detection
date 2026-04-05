import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser } from '../utils/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !password) return Alert.alert('Error', 'Please fill in all fields');
        try {
            setLoading(true);
            await registerUser(username, password);
            Alert.alert('Success', 'Registration successful! Please log in.');
            router.replace('/login');
        } catch (e: any) {
            Alert.alert('Registration Failed', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#2D7D46', '#4CAF50']} style={styles.header}>
                <Text style={styles.title}>Join Wheatify</Text>
                <Text style={styles.subtitle}>Create a new account</Text>
            </LinearGradient>
            <View style={styles.form}>
                <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 25 }}>
                    <Text style={styles.linkText}>Already have an account? Log In</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF8' },
    header: { padding: 80, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    title: { fontSize: 32, fontWeight: '900', color: 'white' },
    subtitle: { color: 'white', marginTop: 10, fontWeight: '500' },
    form: { padding: 30, marginTop: 20 },
    input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 16 },
    button: { backgroundColor: '#2D7D46', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, elevation: 2 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    linkText: { color: '#2D7D46', textAlign: 'center', fontWeight: 'bold', fontSize: 14 }
});
