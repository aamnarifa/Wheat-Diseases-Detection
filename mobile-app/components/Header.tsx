import React from 'react';
import { View, Text, Image } from 'react-native';

const Header = () => {
    return (
        <View className="flex-row justify-between items-center px-6 pt-12 pb-4 bg-transparent">
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Image
                        source={require('../assets/images/logo.png')}
                        className="w-8 h-8 mr-2"
                        resizeMode="contain"
                    />
                    <Text className="text-2xl font-bold text-green-800 tracking-tight">wheatify</Text>
                </View>
                <View className="mt-6">
                    <Text className="text-3xl font-semibold text-gray-800">Hey User,</Text>
                    <Text className="text-lg text-gray-600 mt-1">What would you like to do?</Text>
                </View>
            </View>

            <View className="relative">
                <Image
                    source={require('../assets/images/wheat_illustration.png')}
                    className="absolute -right-4 -top-12 w-32 h-40 opacity-40"
                    resizeMode="contain"
                />
                <View className="bg-white p-1 rounded-full shadow-sm border border-gray-100">
                    <Image
                        source={require('../assets/images/avatar.png')}
                        className="w-14 h-14 rounded-full"
                    />
                    <View className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                </View>
            </View>
        </View>
    );
};

export default Header;
