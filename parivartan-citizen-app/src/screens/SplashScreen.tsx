import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface SplashScreenProps {
  isStandalone?: boolean;
}

const SplashScreen = ({ isStandalone = false }: SplashScreenProps) => {
  const fadeAnim = new Animated.Value(0);
  
  // Only use navigation if not in standalone mode
  const navigation = !isStandalone ? useNavigation() : null;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Only navigate if not in standalone mode
    if (!isStandalone && navigation) {
      // Navigate to Intro screen after 2.5 seconds
      const timer = setTimeout(() => {
        navigation.navigate('Intro' as never);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [navigation, fadeAnim, isStandalone]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;