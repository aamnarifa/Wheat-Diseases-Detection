import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { getToken } from "../utils/api";

const { width } = Dimensions.get("window");

export default function Index() {
    const router = useRouter();

    // Animation values
    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.8);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(20);

    useEffect(() => {
        // Start animations
        logoOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) });
        logoScale.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.back(1.5)) });

        textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
        textTranslateY.value = withDelay(600, withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) }));

        // Navigate based on auth after 3.5 seconds
        const timer = setTimeout(async () => {
            const token = await getToken();
            if (token) {
                router.replace("/(tabs)");
            } else {
                router.replace("/login");
            }
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={["#2D7D46", "#F5FAF6"]} // Dark green to soft light green
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Decorative nature elements (Subtle) */}
            <View style={[styles.circle, { top: -50, left: -50, width: 200, height: 200, opacity: 0.1 }]} />
            <View style={[styles.circle, { bottom: -80, right: -80, width: 300, height: 300, opacity: 0.05 }]} />

            <View style={styles.content}>
                <Animated.View style={[styles.logoContainer, logoStyle]}>
                    <Image
                        source={require("../assets/images/wheatify_log.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>

                <Animated.View style={[styles.textContainer, textStyle]}>
                    <Text style={styles.title}>Wheatify</Text>
                    <Text style={styles.subtitle}>AI-Powered Wheat Disease Detection</Text>
                </Animated.View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.versionStyle}>v1.0.0 • Modern Agritech Solution</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2D7D46",
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    logoContainer: {
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 8,
    },
    logo: {
        width: 200,
        height: 200,
    },
    textContainer: {
        alignItems: "center",
    },
    title: {
        fontSize: 42,
        fontWeight: "800",
        color: "#2D7D46",
        letterSpacing: 2,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#4B5563",
        letterSpacing: 0.5,
        textAlign: "center",
    },
    circle: {
        position: "absolute",
        backgroundColor: "#FFF",
        borderRadius: 150,
    },
    footer: {
        position: "absolute",
        bottom: 50,
        width: "100%",
        alignItems: "center",
    },
    versionStyle: {
        color: "#6B7280",
        fontSize: 12,
        fontWeight: "400",
    },
});
