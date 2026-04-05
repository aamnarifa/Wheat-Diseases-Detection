import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Animated,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { sendBotMessage } from '../utils/api';

const { width, height } = Dimensions.get('window');

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function FloatingChatBot() {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm Wheatify AI. How can I help you with your crops today?",
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('English');
    const [showLangMenu, setShowLangMenu] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const slideAnim = useRef(new Animated.Value(height)).current;

    const languages = [
        { label: 'English', value: 'English' },
        { label: 'Hindi (हिंदी)', value: 'Hindi' },
        { label: 'Kannada (ಕನ್ನಡ)', value: 'Kannada' },
    ];

    const openChat = () => {
        setVisible(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start();
    };

    const closeChat = () => {
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: message,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setMessage('');
        setLoading(true);

        const response = await sendBotMessage(message, language);

        if (response.success) {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: response.response,
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);
        } else {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: response.message,
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userBubble : styles.botBubble
        ]}>
            <Text style={[
                styles.messageText,
                item.sender === 'user' ? styles.userText : styles.botText
            ]}>
                {item.text}
            </Text>
            <Text style={styles.timestamp}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
    );

    return (
        <>
            {/* Floating Toggle Button */}
            {!visible && (
                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={openChat}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#2E7D32', '#43A047']}
                        style={styles.gradientButton}
                    >
                        <Ionicons name="chatbubbles" size={30} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
            )}

            <Modal
                transparent
                visible={visible}
                animationType="none"
                onRequestClose={closeChat}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View style={[styles.chatContainer, { transform: [{ translateY: slideAnim }] }]}>
                        {/* Header */}
                        <LinearGradient
                            colors={['#2E7D32', '#1B5E20']}
                            style={styles.header}
                        >
                            <View style={styles.headerTop}>
                                <View style={styles.headerInfo}>
                                    <View style={styles.avatarContainer}>
                                        <Ionicons name="leaf" size={20} color="white" />
                                        <View style={styles.onlineDot} />
                                    </View>
                                    <View>
                                        <Text style={styles.headerTitle}>Wheatify AI</Text>
                                        <Text style={styles.headerSubtitle}>Agricultural Expert</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={closeChat}>
                                    <Ionicons name="close" size={28} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Language Selector */}
                            <TouchableOpacity
                                style={styles.langSelector}
                                onPress={() => setShowLangMenu(!showLangMenu)}
                            >
                                <Ionicons name="globe-outline" size={16} color="white" />
                                <Text style={styles.langText}>{language}</Text>
                                <Ionicons name="chevron-down" size={14} color="white" />
                            </TouchableOpacity>
                        </LinearGradient>

                        {/* Language Dropdown */}
                        {showLangMenu && (
                            <View style={styles.langMenu}>
                                {languages.map((lang) => (
                                    <TouchableOpacity
                                        key={lang.value}
                                        style={styles.langMenuItem}
                                        onPress={() => {
                                            setLanguage(lang.value);
                                            setShowLangMenu(false);
                                        }}
                                    >
                                        <Text style={[styles.langMenuText, language === lang.value && styles.activeLang]}>
                                            {lang.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Messages List */}
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(item) => item.id}
                            renderItem={renderMessage}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />

                        {/* Loading Indicator */}
                        {loading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#2E7D32" />
                                <Text style={styles.loadingText}>Wheatify AI is thinking...</Text>
                            </View>
                        )}

                        {/* Input Area */}
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                        >
                            <View style={styles.inputArea}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ask about your crops..."
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline
                                    maxLength={500}
                                />
                                <TouchableOpacity
                                    style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
                                    onPress={handleSend}
                                    disabled={!message.trim() || loading}
                                >
                                    <Ionicons
                                        name="send"
                                        size={20}
                                        color="white"
                                    />
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        bottom: 100, // Above tab bar
        right: 20,
        width: 65,
        height: 65,
        borderRadius: 33,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        zIndex: 999,
    },
    gradientButton: {
        width: '100%',
        height: '100%',
        borderRadius: 33,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    chatContainer: {
        height: height * 0.8,
        backgroundColor: '#F7F9F7',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    header: {
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        position: 'relative',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#2E7D32',
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    },
    langSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    langText: {
        color: 'white',
        fontSize: 12,
        marginHorizontal: 5,
        fontWeight: '600',
    },
    langMenu: {
        position: 'absolute',
        top: 100,
        left: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 1000,
        padding: 5,
        width: 150,
    },
    langMenuItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    langMenuText: {
        fontSize: 14,
        color: '#4B5563',
    },
    activeLang: {
        color: '#2E7D32',
        fontWeight: 'bold',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 15,
        borderRadius: 20,
        marginBottom: 15,
        elevation: 1,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#2E7D32',
        borderBottomRightRadius: 5,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8F5E9',
        borderBottomLeftRadius: 5,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: 'white',
    },
    botText: {
        color: '#1B5E20',
    },
    timestamp: {
        fontSize: 9,
        color: 'rgba(0,0,0,0.3)',
        marginTop: 5,
        alignSelf: 'flex-end',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 15,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    input: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        paddingTop: 10,
        marginRight: 10,
        fontSize: 15,
        maxHeight: 100,
        color: '#1F2937',
    },
    sendButton: {
        width: 45,
        height: 45,
        borderRadius: 23,
        backgroundColor: '#2E7D32',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
});
