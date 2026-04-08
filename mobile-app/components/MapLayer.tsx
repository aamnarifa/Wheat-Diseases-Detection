import React, {  } from 'react';
import { Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const getPinColor = (disease: string) => {
    return disease.toLowerCase().includes('healthy') ? 'green' : 'red';
};

export default function MapLayer({ scans, initialRegion }: any) {
    return (
        <MapView 
            style={{ width, height }} 
            initialRegion={initialRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
        >
            {scans.map((scan: any) => (
                <Marker
                    key={scan.id}
                    coordinate={{ latitude: scan.latitude, longitude: scan.longitude }}
                    pinColor={getPinColor(scan.disease)}
                    title={`Scan: ${scan.disease}`}
                    description={`Confidence: ${scan.confidence}%`}
                />
            ))}
        </MapView>
    );
}
