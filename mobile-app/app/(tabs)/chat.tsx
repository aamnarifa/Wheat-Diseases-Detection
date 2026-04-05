import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { sendBotMessage } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChatScreen() {
    const [messages, setMessages] = useState<{id: string, text: string, isUser: boolean}[]>([
        { id: '1', text: 'Hello! I am your Wheatify Agricultural Assistant. How can I help you today?', isUser: false }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userText = input.trim();
        const newMsg = { id: Date.now().toString(), text: userText, isUser: true };
        
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setLoading(true);

        try {
            const data = await sendBotMessage(userText) as any;
            const botMsg = { 
                id: (Date.now()+1).toString(), 
                text: data.success ? data.response : data.message || "Sorry, I couldn't understand that.", 
                isUser: false 
            };
            setMessages(prev => [...prev, botMsg]);
        } catch(e: any) {
            setMessages(prev => [...prev, { id: (Date.now()+2).toString(), text: 'Connection error.', isUser: false }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <LinearGradient colors={['#2D7D46', '#4CAF50']} style={styles.header}>
                <Ionicons name="chatbubbles" size={32} color="white" />
                <Text style={styles.title}>Wheatify Expert</Text>
            </LinearGradient>
            
            <ScrollView 
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                style={styles.chatArea}
                contentContainerStyle={{ padding: 20 }}
            >
                {messages.map(msg => (
                    <View key={msg.id} style={[styles.messageBubble, msg.isUser ? styles.userBubble : styles.botBubble]}>
                        <Text style={[styles.messageText, msg.isUser ? styles.userText : styles.botText]}>
                            {msg.text}
                        </Text>
                    </View>
                ))}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#2D7D46" size="small" />
                        <Text style={styles.loadingText}>Expert is typing...</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    placeholder="Ask about wheat diseases..."
                    value={input}
                    onChangeText={setInput}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
                    <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF8' },
    header: { paddingTop: 60, paddingBottom: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
    title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    chatArea: { flex: 1 },
    messageBubble: { maxWidth: '80%', padding: 15, borderRadius: 20, marginBottom: 15 },
    userBubble: { alignSelf: 'flex-end', backgroundColor: '#2D7D46', borderBottomRightRadius: 5 },
    botBubble: { alignSelf: 'flex-start', backgroundColor: 'white', borderBottomLeftRadius: 5, borderWidth: 1, borderColor: '#E5E7EB' },
    messageText: { fontSize: 16, lineHeight: 22 },
    userText: { color: 'white' },
    botText: { color: '#1F2937' },
    loadingContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, paddingLeft: 10 },
    loadingText: { marginLeft: 10, color: '#6B7280', fontStyle: 'italic' },
    inputArea: { flexDirection: 'row', padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 30 : 15 },
    input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, maxHeight: 100, fontSize: 16 },
    sendButton: { backgroundColor: '#2D7D46', width: 45, height: 45, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginLeft: 10 }
});
