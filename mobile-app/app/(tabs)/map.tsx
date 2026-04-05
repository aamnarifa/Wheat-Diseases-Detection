import React from 'react';
import { View, Text } from 'react-native';
import "../global.css";

export default function MapScreen() {
    return (
        <View className="flex-1 bg-[#F8FAF8] items-center justify-center">
            <Text className="text-2xl font-bold text-green-800">Field Map</Text>
            <Text className="text-gray-500 mt-2">Monitor your wheat fields here.</Text>
        </View>
    );
}
