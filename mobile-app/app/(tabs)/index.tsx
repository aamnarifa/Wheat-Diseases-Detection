import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import UploadCard from "../../components/UploadCard";
import { getWeatherAnalysis } from "../../utils/api";
import * as Location from 'expo-location';
import "../global.css";

const { width, height } = Dimensions.get('window');

export default function Home() {
  const [weatherData, setWeatherData] = React.useState<any>(null);
  const [weatherLoading, setWeatherLoading] = React.useState(true);

  React.useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setWeatherLoading(true);
      console.log("[Weather] Requesting permissions...");

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('[Weather] Location permission denied, using default (Punjab)');
        const data = await getWeatherAnalysis(31.1471, 75.3412);
        if (data.success) {
          setWeatherData(data);
        } else {
          console.error("[Weather] Fallback weather fetch failed:", data.message);
        }
        return;
      }

      console.log("[Weather] Fetching current position...");
      // Add a timeout to location request
      const location = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Location timeout')), 10000))
      ]) as any;

      console.log("[Weather] Location found:", location.coords.latitude, location.coords.longitude);
      const data = await getWeatherAnalysis(location.coords.latitude, location.coords.longitude);

      if (data.success) {
        console.log("[Weather] Data fetched successfully for:", data.location);
        setWeatherData(data);
      } else {
        console.error("[Weather] API Error:", data.message);
      }
    } catch (error: any) {
      console.error("[Weather] Global Error:", error.message);
      // Fallback if everything fails
      const data = await getWeatherAnalysis(31.1471, 75.3412);
      if (data.success) setWeatherData(data);
    } finally {
      setWeatherLoading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Decorative Background Elements */}
      <View style={styles.bgBlobLeft} />
      <View style={styles.bgBlobRight} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/wheatify_logo.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>Wheatify</Text>
            </View>
            <View>
              <Text style={styles.greetingTitle}>Hello, <Text style={{ fontWeight: '900' }}>Farmers</Text></Text>
              <Text style={styles.dateText}>{currentDate}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={24} color="#2D7D46" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search here..."
              style={styles.searchInput}
              placeholderTextColor="#9CA3AF"
            />
            <Ionicons name="mic-outline" size={20} color="#9CA3AF" />
          </View>
        </View>

        {/* Weather Dashboard Card */}
        <View style={styles.dashboardCard}>
          <LinearGradient
            colors={['#FFFFFF', '#F7FAF7']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.cardHeader}>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="#2D7D46" />
              <Text style={styles.locationText}>{weatherData?.location || "Detecting..."}</Text>
            </View>
            <View style={styles.mainTempContainer}>
              <Text style={styles.mainTemp}>
                {weatherData?.temperature ? `+${Math.round(weatherData.temperature)}°C` : "+--°C"}
              </Text>
              <Ionicons name="partly-sunny" size={32} color="#FFB300" />
            </View>
          </View>

          <View style={styles.statsGrid}>
            {/* Risk Level */}
            <View style={styles.statContainer}>
              <View style={styles.statIconBG}>
                <Ionicons name="thermometer-outline" size={18} color="#2D7D46" />
              </View>
              <Text style={styles.statValue}>{weatherData?.risk_level || "--"}</Text>
              <Text style={styles.statLabel}>Risk</Text>
            </View>

            {/* Humidity */}
            <View style={styles.statContainer}>
              <View style={styles.statIconBG}>
                <Ionicons name="water-outline" size={18} color="#2D7D46" />
              </View>
              <Text style={styles.statValue}>{weatherData?.humidity ? `${weatherData.humidity}%` : "--"}</Text>
              <Text style={styles.statLabel}>Humid</Text>
            </View>

            {/* Wind */}
            <View style={styles.statContainer}>
              <View style={styles.statIconBG}>
                <Ionicons name="leaf-outline" size={18} color="#2D7D46" />
              </View>
              <Text style={styles.statValue}>{weatherData?.wind_speed ? `${weatherData.wind_speed} m/s` : "--"}</Text>
              <Text style={styles.statLabel}>Wind</Text>
            </View>

            {/* Rain */}
            <View style={styles.statContainer}>
              <View style={styles.statIconBG}>
                <Ionicons name="rainy-outline" size={18} color="#2D7D46" />
              </View>
              <Text style={styles.statValue}>{weatherData?.rain !== undefined ? `${weatherData.rain} mm` : "0 mm"}</Text>
              <Text style={styles.statLabel}>Rain</Text>
            </View>
          </View>
        </View>



        {/* Image Capture / Upload Area */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Instant Analysis</Text>
        </View>
        <View style={styles.uploadContainer}>
          <UploadCard />
        </View>


        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8F1', // Light Mint Green
  },
  bgBlobLeft: {
    position: 'absolute',
    top: -50,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(45, 125, 70, 0.08)', // Slightly darker sage for mint background
  },
  bgBlobRight: {
    position: 'absolute',
    top: 250,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 179, 0, 0.06)', // Slightly darker gold
  },
  scrollContent: {
    paddingTop: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingBottom: 25,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 65,
    height: 65,
  },
  logoContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2D7D46',
    marginTop: -10, // Pull text up slightly towards logo
    letterSpacing: 0.5,
  },
  greetingTitle: {
    fontSize: 28,
    color: '#2D7D46',
    fontWeight: '400',
    letterSpacing: -1,
  },
  dateText: {
    fontSize: 14,
    color: '#2D7D46',
    opacity: 0.6,
    marginTop: 2,
    fontWeight: '500',
  },
  headerIcon: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: 25,
    marginBottom: 25,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  dashboardCard: {
    marginHorizontal: 25,
    borderRadius: 35,
    padding: 24,
    shadowColor: '#2D7D46',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 35,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  locationText: {
    marginLeft: 6,
    color: '#2D7D46',
    fontWeight: '700',
    fontSize: 13,
  },
  mainTempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainTemp: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1F2937',
    marginRight: 10,
    letterSpacing: -1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  statContainer: {
    alignItems: 'center',
    width: '24%',
  },
  statIconBG: {
    backgroundColor: '#fff',
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  seeAll: {
    color: '#2D7D46',
    fontWeight: '700',
    fontSize: 14,
  },
  categoryScroll: {
    paddingLeft: 25,
    paddingRight: 10,
    marginBottom: 35,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 22,
  },
  categoryIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  categoryLabel: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  uploadContainer: {
    paddingHorizontal: 25,
    marginBottom: 35,
  },
  fieldCard: {
    marginHorizontal: 25,
    height: 230,
    borderRadius: 38,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
});