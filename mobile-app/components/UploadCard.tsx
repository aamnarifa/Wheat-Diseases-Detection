import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { predictWheatDisease, PredictionResult } from '../utils/api';
import * as Location from 'expo-location';

const UploadCard = () => {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [result, setResult] = React.useState<PredictionResult | null>(null);
    const [image, setImage] = React.useState<string | null>(null);
    const [showModal, setShowModal] = React.useState(false);
    const [showOptionsModal, setShowOptionsModal] = React.useState(false);

    const handleAnalysis = async () => {
        if (!image) {
            Alert.alert("No Image", "Please capture or select an image first.");
            return;
        }

        console.log("Starting analysis for URI:", image);
        setLoading(true);
        setResult(null);

        try {
            let lat: number | undefined;
            let lng: number | undefined;
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    lat = loc.coords.latitude;
                    lng = loc.coords.longitude;
                }
            } catch (e) {
                console.log('Location error during analysis', e);
            }

            const prediction = await predictWheatDisease(image, lat, lng);
            console.log("Analysis complete:", prediction);
            setResult(prediction);
            setShowModal(true);
        } catch (apiError) {
            console.error("Analysis error:", apiError);
            Alert.alert("Analysis Failed", "Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectImage = () => {
        setShowOptionsModal(true);
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Required", "We need gallery access to upload photos.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
                setResult(null);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Could not open gallery.");
        }
    };

    const takePhoto = async () => {
        try {
            // Request camera permissions
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    "Permission Required",
                    "We need camera access to take photos of wheat leaves."
                );
                return;
            }

            // Launch the camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                const capturedUri = result.assets[0].uri;
                console.log("Photo captured local URI:", capturedUri);
                setImage(capturedUri);
                setResult(null);
            }
        } catch (error) {
            console.error("Error taking photo:", error);
            Alert.alert("Error", "Could not open camera. Please try again.");
        }
    };

    return (
        <View style={styles.glassCard}>
            {/* Background Decoration */}
            <Image
                source={require('../assets/images/wheat_illustration.png')}
                style={styles.decoration}
                resizeMode="contain"
            />

            {/* Combined Upload Area */}
            <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={handleSelectImage}
                style={{ alignItems: 'center', width: '100%', marginBottom: image && !result ? 20 : 30 }}
            >
                {image && !result ? (
                    <View style={styles.viewfinderContainer}>
                        <Image
                            source={{ uri: image }}
                            style={styles.squarePreview}
                            resizeMode="cover"
                        />
                        {/* Viewfinder Corners */}
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                ) : (
                    <>
                        <View style={styles.iconContainer}>
                            <Image
                                source={require('../assets/images/camera.png')}
                                style={styles.cameraIcon}
                                resizeMode="contain"
                            />
                            <View className="absolute -top-1 -right-1 bg-green-600 rounded-full p-1.5 border-2 border-white shadow-sm">
                                <Ionicons name="add" size={16} color="white" />
                            </View>
                        </View>
                        <Text className="text-2xl font-bold text-gray-800 mb-1">Upload a photo</Text>
                        <Text className="text-gray-500 text-lg italic">of wheat leaf</Text>
                    </>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.8}
                className="w-full"
                onPress={handleAnalysis}
                disabled={loading || !image}
            >
                <LinearGradient
                    colors={loading || !image ? ['#9CA3AF', '#6B7280'] : ['#4CAF50', '#2D7D46']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.captureButton}
                >
                    {loading ? (
                        <ActivityIndicator color="white" size="small" style={{ marginRight: 10 }} />
                    ) : (
                        <View style={styles.captureIconContainer}>
                            <Ionicons name="analytics" size={24} color="white" />
                        </View>
                    )}
                    <Text className="text-white font-bold text-lg">
                        {loading ? 'Analyzing...' : 'Analysis'}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>

            {/* Options Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showOptionsModal}
                onRequestClose={() => setShowOptionsModal(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setShowOptionsModal(false)}
                >
                    <View style={styles.optionsContent}>
                        <Text style={[styles.modalTitle, { marginBottom: 15 }]}>Upload Photo</Text>
                        <TouchableOpacity style={styles.optionButton} onPress={() => { setShowOptionsModal(false); takePhoto(); }}>
                            <Ionicons name="camera" size={24} color="#2D7D46" />
                            <Text style={styles.optionText}>Take Photo</Text>
                        </TouchableOpacity>
                        <View style={{ height: 1, backgroundColor: '#E5E7EB', width: '100%', marginVertical: 5 }} />
                        <TouchableOpacity style={styles.optionButton} onPress={() => { setShowOptionsModal(false); pickImage(); }}>
                            <Ionicons name="images" size={24} color="#2D7D46" />
                            <Text style={styles.optionText}>Choose from Gallery</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Results Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LinearGradient
                            colors={['#FFFFFF', '#F9FFF9']}
                            style={styles.modalGradient}
                        >
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Analysis Result</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowModal(false)}
                                        style={styles.closeIcon}
                                    >
                                        <Ionicons name="close" size={24} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                {image && (
                                    <View style={styles.modalImageContainer}>
                                        <Image
                                            source={{ uri: image }}
                                            style={styles.modalImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.imageOverlay} />

                                        {/* Bounding Box Overlay */}
                                        {result?.bbox && (
                                            <View
                                                style={[
                                                    styles.bbox,
                                                    {
                                                        left: `${result.bbox.x * 100}%`,
                                                        top: `${result.bbox.y * 100}%`,
                                                        width: `${result.bbox.width * 100}%`,
                                                        height: `${result.bbox.height * 100}%`,
                                                    }
                                                ]}
                                            >
                                                <View style={styles.bboxLabel}>
                                                    <Text style={styles.bboxLabelText}>{result.status === 'success' ? result.class : 'Detecting...'}</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {result && (
                                    <View style={styles.resultInfoContainer}>
                                        <View style={styles.resultHighlightBox}>
                                            <View style={(result.status === 'rejected' || result.status === 'error') ? styles.badgeLineRejected : styles.badgeLine} />

                                            <Text style={[styles.resultBadge, (result.status === 'rejected' || result.status === 'error') && { color: '#EF4444' }]}>
                                                {result.status === 'error' ? 'SYSTEM ERROR' : result.status === 'rejected' ? 'REJECTED' : 'ANALYSIS COMPLETE'}
                                            </Text>

                                            {result.status === 'success' ? (
                                                <>
                                                    <Text style={styles.diseaseNameText}>{result.class}</Text>
                                                    <View style={styles.statRow}>
                                                        {result.confidence !== undefined && (
                                                            <View style={styles.statBadge}>
                                                                <Text style={styles.statValue}>{result.confidence.toFixed(1)}%</Text>
                                                                <Text style={styles.statLabel}>Confidence</Text>
                                                            </View>
                                                        )}
                                                        {result.severity && (
                                                            <View style={[styles.statBadge, { borderLeftWidth: 1, borderLeftColor: '#E8F5E9' }]}>
                                                                <Text style={[styles.statValue, { color: result.severity === 'Severe' ? '#EF4444' : '#F59E0B' }]}>
                                                                    {result.severity}
                                                                </Text>
                                                                <Text style={styles.statLabel}>Severity</Text>
                                                            </View>
                                                        )}
                                                    </View>

                                                    {result.insurance?.eligible && (
                                                        <TouchableOpacity
                                                            activeOpacity={0.8}
                                                            style={styles.insuranceButton}
                                                            onPress={() => {
                                                                setShowModal(false);
                                                                setTimeout(() => {
                                                                    router.push({
                                                                        pathname: '/insurance',
                                                                        params: { disease: result.class }
                                                                    });
                                                                }, 100);
                                                            }}
                                                        >
                                                            <LinearGradient
                                                                colors={['#FFB300', '#F57C00']}
                                                                start={{ x: 0, y: 0 }}
                                                                end={{ x: 1, y: 0 }}
                                                                style={styles.insuranceGradient}
                                                            >
                                                                <Ionicons name="shield-checkmark" size={18} color="white" />
                                                                <Text style={styles.insuranceButtonText}>Check Insurance</Text>
                                                            </LinearGradient>
                                                        </TouchableOpacity>
                                                    )}
                                                </>
                                            ) : (
                                                <Text style={styles.errorMessageText}>
                                                    {result.message || "Please upload a clearer image of a wheat leaf."}
                                                </Text>
                                            )}
                                        </View>

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={styles.doneButton}
                                            onPress={() => {
                                                setShowModal(false);
                                                setResult(null);
                                                setImage(null);
                                            }}
                                        >
                                            <LinearGradient
                                                colors={['#4CAF50', '#2D7D46']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.doneButtonGradient}
                                            >
                                                <Text style={styles.doneButtonText}>Done</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </ScrollView>
                        </LinearGradient>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    optionsContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    optionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 15,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.75)', // Slightly more solid for the cream background
        borderRadius: 38,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        shadowColor: '#2D7D46',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.06,
        shadowRadius: 25,
        elevation: 4,
        overflow: 'hidden',
        position: 'relative',
    },
    decoration: {
        position: 'absolute',
        right: -30,
        bottom: -20,
        width: 150,
        height: 150,
        opacity: 0.15,
        transform: [{ rotate: '-15deg' }],
    },
    iconContainer: {
        width: 140, // Increased from 100
        height: 140, // Increased from 100
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 70, // Half of 140
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#E8F5E9',
        shadowColor: '#2D7D46',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    cameraIcon: {
        width: 80,
        height: 80,
    },
    squarePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },
    viewfinderContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 30,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: '#f3f4f6',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 10,
    },
    topLeft: {
        top: 30,
        left: 30,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 4,
    },
    topRight: {
        top: 30,
        right: 30,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 4,
    },
    bottomLeft: {
        bottom: 30,
        left: 30,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 4,
    },
    bottomRight: {
        bottom: 30,
        right: 30,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 4,
    },
    captureButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 100,
        shadowColor: '#2D7D46',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    } as any,
    captureIconContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 6,
        marginRight: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '90%',
        backgroundColor: '#fff',
        borderRadius: 40,
        overflow: 'hidden',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    modalGradient: {
        width: '100%',
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1F2937',
        letterSpacing: -0.5,
    },
    closeIcon: {
        padding: 5,
    },
    modalImageContainer: {
        width: '100%',
        height: 150, // Fixed height to guarantee space for text
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#E8F5E9',
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(45, 125, 70, 0.05)',
    },
    resultInfoContainer: {
        width: '100%',
        alignItems: 'center',
    },
    resultHighlightBox: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        alignItems: 'center',
        borderWidth: 3, // Even thicker
        borderColor: '#2D7D46', // Darker green for high contrast
        marginBottom: 16,
        shadowColor: '#2D7D46',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    badgeLine: {
        width: 40,
        height: 6,
        backgroundColor: '#4CAF50',
        borderRadius: 3,
        marginBottom: 12,
    },
    badgeLineRejected: {
        width: 40,
        height: 6,
        backgroundColor: '#EF4444',
        borderRadius: 3,
        marginBottom: 12,
    },
    resultBadge: {
        fontSize: 12,
        fontWeight: '800',
        color: '#6B7280',
        letterSpacing: 2,
        marginBottom: 8,
    },
    diseaseNameText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 16,
    },
    errorMessageText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    confidenceBadge: {
        backgroundColor: '#F1F8F1',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#E8F5E9',
    },
    confidenceValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#2D7D46',
        marginRight: 8,
    },
    confidenceLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2D7D46',
        opacity: 0.7,
        textTransform: 'uppercase',
    },
    doneButton: {
        width: '100%',
        marginTop: 10,
    },
    doneButtonGradient: {
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1,
    },
    bbox: {
        position: 'absolute',
        borderWidth: 3,
        borderColor: '#4CAF50',
        borderRadius: 8,
        shadowColor: '#2D7D46',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    bboxLabel: {
        position: 'absolute',
        top: -28,
        left: -3,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
    },
    bboxLabelText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E8F5E9',
        paddingTop: 15,
        width: '100%',
    },
    statBadge: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#2D7D46',
    },
    statLabel: {
        fontSize: 10,
        color: '#6B7280',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginTop: 2,
    },
    insuranceButton: {
        width: '100%',
        marginTop: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    insuranceGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    insuranceButtonText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 14,
    },
});

export default UploadCard;
