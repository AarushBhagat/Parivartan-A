import { API_CONFIG } from '../config/api.config';

// Import real API services
import * as RealApiService from './api.service';

// Import mock API services
import * as MockApiService from './mockApiService';

// Log whether we're using mock or real API
console.log(`[API Service] Using ${API_CONFIG.USE_MOCK_API ? 'MOCK' : 'REAL'} API services`);

// Export the appropriate API service based on configuration
export const authService = API_CONFIG.USE_MOCK_API 
  ? MockApiService.authService 
  : RealApiService.authService;

export const issueService = API_CONFIG.USE_MOCK_API 
  ? MockApiService.issueService 
  : RealApiService.issueService;

export const userService = API_CONFIG.USE_MOCK_API 
  ? MockApiService.userService 
  : RealApiService.userService;

export const notificationService = API_CONFIG.USE_MOCK_API 
  ? MockApiService.notificationService 
  : RealApiService.notificationService;

export const departmentService = API_CONFIG.USE_MOCK_API 
  ? MockApiService.departmentService 
  : RealApiService.departmentService;

export const categoryService = API_CONFIG.USE_MOCK_API 
  ? MockApiService.categoryService 
  : (RealApiService as any).categoryService || {}; // Add fallback if category service doesn't exist in real API

// Export upload service (always use real service, no mock needed)
export { uploadService } from './uploadService';