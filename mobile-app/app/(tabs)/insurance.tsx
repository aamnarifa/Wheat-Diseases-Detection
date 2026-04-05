import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAllInsuranceSchemes, InsuranceScheme, InsuranceRecommendation, getInsuranceRecommendation } from '../../utils/api';
import "../global.css";

const { width } = Dimensions.get('window');

export default function InsuranceScreen() {
    const router = useRouter();
    const { disease } = useLocalSearchParams<{ disease?: string }>();

    const [schemes, setSchemes] = useState<InsuranceScheme[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recommendation, setRecommendation] = useState<InsuranceRecommendation | null>(null);

    useEffect(() => {
        loadData();
    }, [disease]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all schemes
            const schemesData = await getAllInsuranceSchemes();
            setSchemes(schemesData);

            // Fetch specific recommendation if disease passed
            if (disease) {
                console.log(`[Insurance] Fetching recommendation for: ${disease}`);
                const recData = await getInsuranceRecommendation(disease);
                setRecommendation(recData);
            } else {
                setRecommendation(null);
            }

        } catch (err: any) {
            console.error("Insurance load error:", err);
            setError(err.message || "Failed to connect to insurance server.");
        } finally {
            setLoading(false);
        }
    };

    const openInsuranceLink = (schemeId: number) => {
        let url = "";

        if (schemeId === 1) {
            url = "https://www.pmfby.gov.in/";
        } else if (schemeId === 2) {
            url = "https://www.aicofindia.com/";
        } else {
            url = "https://www.pmfby.gov.in/";
        }

        if (Platform.OS === 'web') {
            const wantToRedirect = window.confirm("You will be redirected to the official insurance website. Continue?");
            if (wantToRedirect) {
                window.open(url, '_blank');
            }
        } else {
            Alert.alert(
                "Redirect",
                "You will be redirected to the official insurance website.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Continue", onPress: () => Linking.openURL(url) }
                ]
            );
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2D7D46" />
                <Text style={{ marginTop: 15, color: '#6B7280', fontWeight: 'bold' }}>Syncing with Insurance Server...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
                <View style={styles.errorIconContainer}>
                    <Ionicons name="cloud-offline" size={64} color="#EF4444" />
                </View>
                <Text style={styles.errorTitle}>Connection Failed</Text>
                <Text style={styles.errorSubtitle}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                    <LinearGradient
                        colors={['#2D7D46', '#4CAF50']}
                        style={styles.retryGradient}
                    >
                        <Text style={styles.retryText}>Try Again</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    const isDiseaseDetected = !!disease;
    const isEligible = recommendation?.eligible ?? false;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <LinearGradient
                colors={['#2D7D46', '#4CAF50']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleRow}>
                        <View style={styles.shieldIconContainer}>
                            <Ionicons name="shield-checkmark" size={32} color="#FFB300" />
                        </View>
                        <Text style={styles.headerTitle}>Insurance</Text>
                    </View>
                </View>
                <View style={styles.headerWave} />
            </LinearGradient>

            <View style={styles.mainContent}>
                {/* Recommended Insurance Alert */}
                <Text style={styles.sectionTitle}>
                    {isDiseaseDetected ? 'Personalized Recommendation' : 'General Insurance'}
                </Text>

                <View style={[styles.alertCard, !isEligible && isDiseaseDetected && { borderColor: '#9CA3AF', borderWidth: 1 }]}>
                    <LinearGradient
                        colors={isEligible ? ['#FF5252', '#D32F2F'] : ['#4B5563', '#1F2937']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.alertHeader}
                    >
                        <Ionicons name={isEligible ? "warning" : "information-circle"} size={24} color="white" />
                        <Text style={styles.alertHeaderText}>
                            {disease ? `Scan: ${disease}` : 'Scan your crops'}
                        </Text>
                    </LinearGradient>
                    <View style={styles.alertBody}>
                        {isDiseaseDetected ? (
                            <>
                                <Text style={styles.alertText}>
                                    {isEligible
                                        ? `Your crop shows symptoms of ${disease}. You have ${recommendation?.recommended_schemes?.length} eligible policies.`
                                        : recommendation?.message || `Crop status for ${disease} is currently stable.`}
                                </Text>
                                {isEligible && (
                                    <TouchableOpacity
                                        style={styles.claimButton}
                                        onPress={() => {
                                            const firstScheme = recommendation?.recommended_schemes?.[0];
                                            if (firstScheme) openInsuranceLink(firstScheme.id);
                                        }}
                                    >
                                        <Text style={styles.claimButtonText}>Apply for Coverage</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        ) : (
                            <>
                                <Text style={styles.alertText}>
                                    Protect your fields from unforseen crop diseases and natural disasters.
                                </Text>
                                <TouchableOpacity
                                    style={[styles.claimButton, { backgroundColor: '#1F2937' }]}
                                    onPress={() => router.push('/')}
                                >
                                    <Text style={styles.claimButtonText}>Scan Now</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                {/* Available Policies Section */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>
                        {isEligible ? 'Eligible Policies' : 'All Policies'}
                    </Text>
                    <View style={styles.headerLine} />
                </View>

                <View style={styles.policiesRow}>
                    {schemes.length > 0 ? schemes.map((scheme) => {
                        const isRecommended = recommendation?.recommended_schemes?.some(s => s.id === scheme.id);

                        return (
                            <View key={scheme.id} style={[styles.policyCard, isRecommended && styles.recommendedCard]}>
                                {isRecommended && (
                                    <View style={styles.recommendedBadge}>
                                        <Text style={styles.recommendedBadgeText}>BEST MATCH</Text>
                                    </View>
                                )}
                                <View style={styles.policyHeader}>
                                    <View style={[styles.policyIconBG, { backgroundColor: scheme.id === 1 ? '#E8F5E9' : '#E1F5FE' }]}>
                                        <Ionicons
                                            name={scheme.id === 1 ? "shield" : "business"}
                                            size={20}
                                            color={scheme.id === 1 ? "#2D7D46" : "#0288D1"}
                                        />
                                    </View>
                                    <Text style={styles.policyName} numberOfLines={1}>{scheme.name}</Text>
                                </View>
                                <View style={styles.policyDetails}>
                                    <Text style={styles.policyLabel}>Coverage:</Text>
                                    <Text style={styles.policyValue} numberOfLines={2}>{scheme.coverage}</Text>
                                    <Text style={styles.policyLabel}>Premium:</Text>
                                    <Text style={styles.policyValue}>{scheme.premium_percent}%</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.detailsButton, scheme.id === 2 && { backgroundColor: '#0288D1' }]}
                                    onPress={() => openInsuranceLink(scheme.id)}
                                >
                                    <Text style={styles.detailsButtonText}>Apply Now</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                            <Text style={styles.noDataText}>No active policies found on server.</Text>
                        </View>
                    )}
                </View>

                {/* Claim Assistance Guide */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Claim Assistance Guide</Text>
                    <View style={styles.headerLine} />
                </View>

                <View style={styles.guideCard}>
                    <View style={styles.guideStep}>
                        <View style={styles.stepIconContainer}>
                            <Ionicons name="person-circle" size={32} color="#5D4037" />
                        </View>
                        <Text style={styles.stepText}>
                            <Text style={styles.stepNumber}>1.</Text> Report to Local Agriculture Officer
                        </Text>
                    </View>
                    <View style={styles.stepDivider} />

                    <View style={styles.guideStep}>
                        <View style={styles.stepIconContainer}>
                            <Ionicons name="time" size={32} color="#FFB300" />
                        </View>
                        <Text style={styles.stepText}>
                            <Text style={styles.stepNumber}>2.</Text> Submit Claim within 72 Hours
                        </Text>
                    </View>
                    <View style={styles.stepDivider} />

                    <View style={styles.guideStep}>
                        <View style={styles.stepIconContainer}>
                            <Ionicons name="camera" size={32} color="#0288D1" />
                        </View>
                        <Text style={styles.stepText}>
                            <Text style={styles.stepNumber}>3.</Text> Upload Documents & Photos
                        </Text>
                    </View>

                    <View style={styles.docsContainer}>
                        <View style={styles.docItem}>
                            <Ionicons name="card" size={30} color="#5D4037" />
                            <Text style={styles.docLabel}>Aadhaar</Text>
                        </View>
                        <View style={styles.docItem}>
                            <Ionicons name="document-text" size={30} color="#FFB300" />
                            <Text style={styles.docLabel}>Land Proof</Text>
                        </View>
                        <View style={styles.docItem}>
                            <View style={styles.cropPhotoContainer}>
                                <Ionicons name="images" size={24} color="#0288D1" />
                                <View style={styles.cameraBadge}>
                                    <Ionicons name="camera" size={12} color="white" />
                                </View>
                            </View>
                            <Text style={styles.docLabel}>Crop Photos</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAF8',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        position: 'relative',
        overflow: 'hidden',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shieldIconContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 15,
        padding: 5,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: 'white',
        letterSpacing: -0.5,
    },
    headerWave: {
        position: 'absolute',
        bottom: -20,
        left: 0,
        right: 0,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        transform: [{ skewY: '-2deg' }],
    },
    mainContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 15,
    },
    alertCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 25,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    alertHeaderText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 16,
        marginLeft: 10,
    },
    alertBody: {
        padding: 20,
        alignItems: 'center',
    },
    alertText: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 15,
        textAlign: 'center',
    },
    boldText: {
        fontWeight: 'bold',
        color: '#111827',
    },
    claimButton: {
        backgroundColor: '#2D7D46',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
    },
    claimButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
        marginLeft: 15,
    },
    policiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    policyCard: {
        backgroundColor: 'white',
        width: (width - 55) / 2,
        borderRadius: 20,
        padding: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        marginBottom: 15,
    },
    recommendedCard: {
        borderColor: '#FFB300',
        borderWidth: 2,
        backgroundColor: '#FFFBEB',
    },
    recommendedBadge: {
        position: 'absolute',
        top: -10,
        right: 10,
        backgroundColor: '#FFB300',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 1,
    },
    recommendedBadgeText: {
        color: 'white',
        fontSize: 8,
        fontWeight: '900',
    },
    policyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    policyIconBG: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    policyName: {
        fontSize: 14,
        fontWeight: '900',
        color: '#1F2937',
        flex: 1,
    },
    policyDetails: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 10,
        marginBottom: 15,
        height: 100,
    },
    policyLabel: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '600',
        marginBottom: 2,
    },
    policyValue: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '700',
        marginBottom: 8,
    },
    detailsButton: {
        backgroundColor: '#2D7D46',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    detailsButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    guideCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    guideStep: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    stepIconContainer: {
        width: 50,
        alignItems: 'center',
    },
    stepText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        color: '#4B5563',
        paddingLeft: 10,
    },
    stepNumber: {
        color: '#111827',
        fontWeight: '900',
        fontSize: 16,
    },
    stepDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 60,
    },
    docsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#F9FAFB',
        borderRadius: 15,
        padding: 15,
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    docItem: {
        alignItems: 'center',
    },
    docLabel: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: 'bold',
        marginTop: 5,
    },
    cropPhotoContainer: {
        position: 'relative',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: -2,
        right: -5,
        backgroundColor: '#374151',
        borderRadius: 10,
        padding: 3,
        borderWidth: 1,
        borderColor: 'white',
    },
    emptyContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 30,
    },
    noDataText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 10,
        fontWeight: '500'
    },
    errorIconContainer: {
        backgroundColor: '#FEF2F2',
        padding: 25,
        borderRadius: 50,
        marginBottom: 20,
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1F2937',
        marginBottom: 10,
    },
    errorSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    retryButton: {
        width: '100%',
        borderRadius: 15,
        overflow: 'hidden',
    },
    retryGradient: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    retryText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
