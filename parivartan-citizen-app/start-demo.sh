#!/bin/bash

# Set up debugging
set -e

# Display banner
echo "=========================================================="
echo "🚀 PARIVARTAN DEMO MODE 🚀"
echo "=========================================================="
echo "Starting app with mock data and simulated API responses"
echo "No internet or backend connection required"
echo "All data will be stored locally on the device"
echo "=========================================================="
echo ""

# Stop any running processes
echo "👉 Stopping any running processes..."
pkill -f "expo start" || true
sleep 1

# Clear expo cache and stored data
echo "👉 Clearing cache and previous mock data..."
rm -rf ~/.expo/ios-simulator-app-cache
rm -rf ~/.expo/android-emulator-app-cache
rm -rf ~/Library/Developer/CoreSimulator/Devices/*/data/Containers/Data/Application/*/.expo
rm -rf node_modules/.cache/expo

# Remove AsyncStorage files to start fresh
if [ -d "$HOME/.expo/android-emulator-app-cache" ]; then
  echo "👉 Clearing Android mock data..."
  find $HOME/.expo/android-emulator-app-cache -name "*parivartan*" -delete
fi

# Set expo in development mode
export NODE_ENV=development

# Install needed packages if missing
echo "👉 Checking for required packages..."
if ! npm list @react-native-async-storage/async-storage | grep -q "@react-native-async-storage/async-storage"; then
  echo "📦 Installing AsyncStorage package..."
  npm install --save @react-native-async-storage/async-storage
fi

# Set environment variables to force demo mode
export EXPO_USE_MOCK_API=true

# Force API configuration to use mock mode
echo "👉 Setting API config to use mock mode..."
# Safer way to modify the config file
sed -i 's/USE_MOCK_API: false/USE_MOCK_API: true/g' src/config/api.config.ts

# Start the app
echo ""
echo "=========================================================="
echo "🚀 Starting Parivartan in DEMO MODE..."
echo "=========================================================="
echo "📱 Scan the QR code with your mobile device to open the app"
echo "=========================================================="
echo ""

# Start Expo
npx expo start --clear