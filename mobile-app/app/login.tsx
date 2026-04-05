import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser, saveToken } from '../utils/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) return Alert.alert('Error', 'Please fill in all fields');
        try {
            setLoading(true);
            const data = await loginUser(username, password);
            await saveToken(data.access_token);
            router.replace('/(tabs)');
        } catch (e: any) {
            Alert.alert('Login Failed', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#2D7D46', '#4CAF50']} style={styles.header}>
                <Text style={styles.title}>Wheatify</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>
            </LinearGradient>
            <View style={styles.form}>
                <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/register')} style={{ marginTop: 25 }}>
                    <Text style={styles.linkText}>Don't have an account? Register</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF8' },
    header: { padding: 80, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    title: { fontSize: 36, fontWeight: '900', color: 'white' },
    subtitle: { color: 'white', marginTop: 10, fontWeight: '500' },
    form: { padding: 30, marginTop: 20 },
    input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 16 },
    button: { backgroundColor: '#2D7D46', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, elevation: 2 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    linkText: { color: '#2D7D46', textAlign: 'center', fontWeight: 'bold', fontSize: 14 }
});
