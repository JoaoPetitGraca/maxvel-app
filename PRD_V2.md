# MaxVel v2.0 - Product Requirements Document

## Core Objective
An Android speed alert app for the N1 highway in Mozambique.

## Tech Stack
- Framework: React Native (Expo)
- Location: expo-location
- Database: Embedded JSON (n1_segments.json) + Supabase (Post-MVP/Reporting)

## Core Features to Build
1. GPS-based speed tracking with smoothing filters.
2. Speed limit lookup from local JSON data.
3. High-visibility UI: Large speed circle that turns red when overspeeding.
4. "Report" button to log police radar and speed limit errors.

## Success Metrics
- GPS matching accuracy: +/- 10 meters.
- Alert latency: < 500ms.
