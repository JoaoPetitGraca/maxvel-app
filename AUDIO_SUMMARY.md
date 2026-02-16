# CodeCast: Speed Tracking Implementation Summary

## Introduction
This summary explains the implementation of the core speed-tracking and segment-matching logic in the MaxVel app. We've integrated `expo-location` for real-time GPS data and created a custom matching engine to identify the applicable speed limit based on the user's location.

## 1. GPS Integration (SpeedScreen.js)
We use `expo-location`'s `watchPositionAsync` method to receive continuous location updates.
- **Configuration**: We set the accuracy to `BestForNavigation` and update intervals to every 1 second or 1 meter to ensure responsiveness.
- **Speed Calculation**: The GPS returns speed in meters per second (m/s). We convert this to kilometers per hour (km/h) using the formula `speed * 3.6`. We handle cases where the speed might be invalid (-1) or zero.
- **State Management**: We use React state to store the current speed and the matched speed limit, triggering UI updates whenever these values change.

## 2. Segment Matching Engine (locationUtils.js)
To determine the current speed limit, we match the user's coordinates against a list of defined road segments in `n1_segments.json`.
- **Data Structure**: Each segment is defined by a start coordinate and an end coordinate (latitude, longitude) and a speed limit.
- **Distance Calculation**:
    - We implemented the **Haversine formula** (`getDistanceFromLatLonInKm`) to calculate the great-circle distance between two points on the Earth's surface.
    - We also implemented a **Point-to-Line-Segment distance** function (`getDistanceToSegment`). This calculates the perpendicular distance from the user's location to the line segment defined by the road. This is crucial because a user might be driving *along* the road but not exactly on the start or end points.
- **Nearest Segment Logic**: The `findNearestSegment` function iterates through all segments and calculates the distance from the user to each segment. If the user is within a defined threshold (e.g., 0.5 km) of a segment, that segment is considered "matched," and its speed limit is displayed.

## 3. UI Updates
The `SpeedScreen` displays:
- A large circle showing the **Speed Limit** of the matched segment.
- The user's **Current Speed** below the circle.
- **Visual Alerts**: The circle's border changes color:
    - **Green**: Safe (speed <= limit).
    - **Red**: Speeding (speed > limit).
    - **Gray**: No limit found (no matching segment).

This implementation provides a solid foundation for the MVP, ensuring accurate speed tracking and context-aware speed limits.
