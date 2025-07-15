# Swipe Navigation

This project now includes swipe navigation functionality that allows users to navigate between tabs by swiping left and right.

## Features

- **Swipe Left**: Navigate to the next tab (right direction)
- **Swipe Right**: Navigate to the previous tab (left direction)
- **Visual Feedback**: Slight scaling and overlay effects during swipe gestures
- **Haptic Feedback**: Light haptic feedback when successfully navigating
- **Boundary Protection**: Prevents swiping beyond the first and last tabs with reduced resistance
- **Smooth Animations**: Uses spring animations for natural feel

## Implementation Details

### Components Added:

- `SwipeNavigation.tsx` - Main swipe gesture handler component

### Key Features:

- **Gesture Recognition**: Uses `react-native-gesture-handler` for smooth gesture detection
- **Animation**: Uses `react-native-reanimated` for performant animations
- **Threshold-based Navigation**: Requires 25% screen width swipe or high velocity to trigger navigation
- **Visual Feedback**: Includes scaling and overlay effects during gestures
- **Haptic Feedback**: Provides tactile feedback using `expo-haptics`

### Tab Order:

1. Home (index)
2. Search
3. Notifications
4. Messages
5. Profile

### Customization:

- Adjust `threshold` value in `SwipeNavigation.tsx` to change swipe sensitivity
- Modify `maxTranslateX` to change maximum swipe distance
- Customize spring animation parameters for different feel

## Usage

The swipe navigation is automatically enabled across all tab screens. Users can:

- Swipe left to go to the next tab
- Swipe right to go to the previous tab
- See visual feedback during the gesture
- Feel haptic feedback when navigation occurs

## Technical Notes

- Uses `PanGestureHandler` for gesture detection
- Implements `useAnimatedGestureHandler` for performance
- Includes boundary checks to prevent navigation beyond available tabs
- Uses shared values for optimal performance
- Integrates with Expo Router for navigation
