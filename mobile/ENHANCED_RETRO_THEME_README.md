# Enhanced Retro Theme System

A comprehensive, time-based retro theme manager for React Native apps with smooth transitions, dynamic backgrounds, and weather integration.

## Features

### 🌅 Time-Based Themes

- **Morning (6-12)**: Light blue sky with hot air balloons, birds, and soft clouds
- **Afternoon (12-18)**: Bright sky with planes, helicopters, and kites
- **Evening (18-22)**: Sunset colors with city skylines, satellites, and emerging stars
- **Night (22-6)**: Dark cosmic background with moon, stars, UFOs, and neon signs

### 🌦️ Weather Integration

- **Clear**: Standard theme elements
- **Cloudy**: Additional clouds and particle effects
- **Rainy**: Rain particles and storm elements
- **Foggy**: Atmospheric fog and reduced visibility

### 🎨 Animation System

- **Full**: All animations enabled (floating, drifting, twinkling, rotating)
- **Reduced**: Essential animations only
- **None**: Static display for performance

### 🎯 Smooth Transitions

- 3-5 second smooth transitions between themes
- Fade-in/fade-out effects for seamless changes
- Animated value interpolation for gradients

## Installation

1. Install required dependencies:

```bash
npm install expo-linear-gradient react-native-svg react-native-reanimated
```

2. Copy the theme system files to your project:

- `contexts/EnhancedThemeContext.tsx`
- `config/themeConfig.ts`
- `components/animations/EnhancedRetroBackground.tsx`

## Usage

### Basic Implementation

```tsx
import React from "react";
import { EnhancedThemeProvider } from "@/contexts/EnhancedThemeContext";
import EnhancedRetroBackground from "@/components/animations/EnhancedRetroBackground";

const App = () => {
  return (
    <EnhancedThemeProvider>
      <EnhancedRetroBackground>
        {/* Your app content */}
      </EnhancedRetroBackground>
    </EnhancedThemeProvider>
  );
};
```

### Using Theme Context

```tsx
import { useEnhancedTheme } from "@/contexts/EnhancedThemeContext";

const MyComponent = () => {
  const { currentTheme, currentPeriod, forceTimePeriod } = useEnhancedTheme();

  return (
    <View style={{ backgroundColor: currentTheme.colors.surface }}>
      <Text style={{ color: currentTheme.colors.text }}>
        Current period: {currentPeriod}
      </Text>
    </View>
  );
};
```

### Manual Theme Control

```tsx
const ThemeControls = () => {
  const { forceTimePeriod, setWeatherCondition, setAnimationLevel } =
    useEnhancedTheme();

  return (
    <View>
      {/* Force specific time period */}
      <Button title="Force Night" onPress={() => forceTimePeriod("night")} />
      <Button title="Auto Mode" onPress={() => forceTimePeriod(null)} />

      {/* Change weather */}
      <Button title="Rainy" onPress={() => setWeatherCondition("rainy")} />

      {/* Animation level */}
      <Button
        title="Full Animation"
        onPress={() => setAnimationLevel("full")}
      />
    </View>
  );
};
```

## Configuration

### Theme Colors

Each time period has its own color palette:

```typescript
colors: {
  background: [string, string, string, string, string], // Gradient colors
  primary: string,    // Main brand color
  secondary: string,  // Secondary brand color
  accent: string,     // Highlight color
  text: string,       // Text color
  surface: string,    // Card/surface background
  border: string,     // Border color
}
```

### Retro Objects

Configure animated SVG objects for each theme:

```typescript
retroObjects: [
  {
    type: "hotAirBalloon",
    count: 3,
    animationType: "float",
    speed: "slow",
    layer: "background",
  },
];
```

### Animation Types

- **float**: Gentle up/down movement
- **drift**: Horizontal movement across screen
- **twinkle**: Opacity pulsing effect
- **rotate**: Continuous rotation
- **parallax**: Depth-based movement

## SVG Objects Included

### Morning

- Hot air balloons with baskets and ropes
- Flying birds in formation
- Soft, fluffy clouds
- Bright sun with rays

### Afternoon

- Commercial airplanes
- Helicopters with rotors
- Colorful kites
- Clear sky elements

### Evening

- City skyline silhouettes
- Satellites in orbit
- Early stars appearing
- Sunset atmosphere

### Night

- Detailed moon with craters
- Twinkling stars of various sizes
- UFOs with lights
- Neon signs and cosmic elements

## Performance Optimization

### Animation Levels

- **Full**: All effects enabled (60fps)
- **Reduced**: Essential animations only (30fps)
- **None**: Static display (minimal CPU usage)

### Particle System

- Configurable particle count per theme
- Efficient reuse of animation values
- Automatic cleanup on unmount

### Memory Management

- SVG objects are lightweight vectors
- Animation values are reused across components
- Proper cleanup in useEffect hooks

## Weather Integration

The system supports future weather API integration:

```tsx
// Example weather integration
const WeatherIntegration = () => {
  const { setWeatherCondition } = useEnhancedTheme();

  useEffect(() => {
    fetch("https://api.weather.com/current")
      .then((res) => res.json())
      .then((data) => {
        setWeatherCondition(data.condition);
      });
  }, []);
};
```

## Customization

### Adding New Time Periods

1. Add new period to `TimePeriod` type
2. Create configuration in `themeConfig`
3. Add corresponding SVG objects

### Creating Custom Objects

1. Add SVG component in `renderRetroObject`
2. Define object configuration
3. Set animation parameters

### Custom Color Schemes

Modify the color arrays in `themeConfig.ts`:

```typescript
morning: {
  colors: {
    background: ['#yourColor1', '#yourColor2', ...],
    primary: '#yourPrimary',
    // ...
  }
}
```

## Troubleshooting

### Common Issues

1. **Animations not working**: Check animation level setting
2. **SVG not displaying**: Ensure react-native-svg is properly installed
3. **Performance issues**: Reduce particle count or use 'reduced' animation level
4. **Theme not updating**: Verify EnhancedThemeProvider wraps your app

### Debug Mode

Enable debug logging by setting the update interval to a lower value:

```tsx
<EnhancedThemeProvider updateInterval={5000}> // Check every 5 seconds
```

## License

This theme system uses public domain SVG elements and is free to use in commercial projects.

## Contributing

Feel free to add new time periods, objects, or animation types by following the established patterns in the configuration files.
