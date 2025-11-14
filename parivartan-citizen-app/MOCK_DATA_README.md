# Parivartan Mock Data System

This document describes how to use the mock data system for demonstrating the Parivartan app without requiring backend connectivity.

## Quick Start

The easiest way to run the app in demo mode is to use the provided script:

```bash
# Make the script executable (one-time)
chmod +x start-demo.sh

# Run the demo
./start-demo.sh
```

This will:
1. Clear any previous mock data
2. Force the app to use mock APIs
3. Install any missing dependencies
4. Launch the app with mock data pre-initialized

## Overview

The mock data system provides a complete simulation of the backend API, including:

- User authentication (login, registration, profile management)
- Issue reporting and tracking
- Comments and upvotes
- Notifications
- Location-based issue discovery
- Persistent data storage between app sessions

## How to Enable Mock Mode Manually

1. In `/src/config/api.config.ts`, set `USE_MOCK_API: true` in the `API_CONFIG` object.
2. Run the app with `npx expo start`
3. The app will automatically initialize mock data on startup

## Mock Data Features

### Authentication

- Demo user accounts are automatically created
- You're automatically logged in as the first demo user
- Manual login also available: `user@example.com` / `password123`
- Google sign-in is simulated (no actual Google authentication)
- User session persists between app restarts

### Issues

- Pre-populated with various issues across different categories and statuses
- Images are simulated with placeholder images
- Location data is realistically generated

### Interactions

- Upvoting, commenting, and other interactions are fully functional
- Notifications are generated for relevant actions
- User statistics are tracked and updated

### Data Persistence

- All data is stored in AsyncStorage
- Changes persist between app sessions
- Reset mock data by calling `initializeMockData(true)` in development

## Technical Implementation

The mock system consists of several components:

1. **Mock Data Generator** (`/src/services/mock/mockData.ts`)
   - Generates realistic interconnected data models
   - Creates sample users, issues, departments, categories, etc.

2. **Mock API** (`/src/services/mock/mockApi.ts`)
   - Simulates API endpoints with realistic delays
   - Handles data operations and persistence via AsyncStorage

3. **Mock API Service** (`/src/services/mockApiService.ts`)
   - Provides an interface compatible with the real API service
   - Wraps mock API functionality to match real API contracts

4. **Service Selector** (`/src/services/index.ts`)
   - Conditionally exports real or mock services based on configuration

5. **Mock Auth Context** (`/src/services/mockAuthContext.tsx`)
   - Provides authentication context using mock auth services
   - Manages user session with AsyncStorage persistence

6. **App Wrapper** (`/src/MockAppWrapper.tsx`)
   - Conditionally uses real or mock AuthProvider based on configuration

## For Developers

When adding new features, ensure compatibility with both real and mock implementations:

1. Add new endpoints to both real API service and mock API service
2. Update mock data generator if new data structures are needed
3. Test both with mock API enabled and disabled

To reset mock data during development:

```typescript
import { initializeMockData } from './src/services/mock/mockApi';

// Force regeneration of mock data
initializeMockData(true);
```

## Customizing Mock Data

To customize the generated mock data, modify the `generateMockData()` function in `/src/services/mock/mockData.ts`:

- Add more user profiles
- Create additional issue categories or departments
- Adjust the number of sample issues
- Customize location data for your demonstration area