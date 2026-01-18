# BluT Native Mobile App Implementation Plan

## Executive Summary
To bring BluT to mobile devices as a native application, the most efficient path is to leverage **React Native**. Since your existing codebase is built with React, this allows you to reuse significant portions of your logic (state management, utility functions, types) while delivering a truly native performance and look-and-feel on implementation iOS and Android.

## 1. Recommended Technology Stack

| Component | Technology | Reasoning |
|-----------|------------|-----------|
| **Core Framework** | **React Native (via Expo)** | Allows writing code in React/JavaScript that renders as native views. Expo provides a robust set of pre-built native modules (Camera, Video, FileSystem) which significantly speeds up development. |
| **Language** | **JavaScript/JSX** | consistent with your current frontend. |
| **Styling** | **NativeWind** | A library that lets you use **Tailwind CSS** classes in React Native. Since you already use Tailwind, you can copy-paste many style classes directly. |
| **Video Player** | **Expo Video / expo-av** | Native video playback capabilities with support for controls, fullscreen, and streaming. |
| **Navigation** | **React Navigation** | The industry standard for routing in React Native (Stack, Tabs, Drawers). |
| **State Management** | **React Context** | You can likely copy your existing `MessageProvider` and `AuthProvider` logic with minor adjustments for mobile storage. |
| **Networking** | **Axios / Fetch** | Same as web. |
| **Real-time** | **Socket.io-client** | Works out-of-the-box in React Native for your messaging features. |

## 2. Architecture & Backend Integration

The Mobile App will consume the **exact same API** as your web frontend. No major backend rewrite is required, but you may need a few adjustments:

### Authentication
*   **Web**: Likely uses Cookies or LocalStorage.
*   **Mobile**: Cookies don't work the same way. You will store the JWT (JSON Web Token) in a secure mobile storage (like `expo-secure-store`).
*   **Action**: Ensure your backend accepts the Authorization header (`Bearer <token>`) if it relies solely on cookies right now.

### API Endpoints
*   Your backend running on `localhost:5000` typically isn't accessible to a physical phone or an emulator.
*   **Dev Mode**: You will use your computer's local IP address (e.g., `http://192.168.1.x:5000`) to connect the phone to the backend.
*   **Production**: You will simply point the API URL to your deployed server.

## 3. Feature Implementation Strategy

### A. Navigation Structure (The "Shell")
Unlike the web URL system, mobile apps use Stack and Tab navigators.
*   **Bottom Tab Bar**: Home, Explore (Shorts), Subscriptions, Library.
*   **Header**: Search Icon, Notifications, User Avatar.
*   **Modals**: Upload Video, Chat Screen.

### B. Video Playback
*   Replace the HTML5 `<video>` tag with the `<Video>` component from `expo-av`.
*   Implement "safe area views" to ensure the video isn't hidden behind the notch on iPhones.
*   **Background Audio**: Mobile apps need specific permissions to keep playing audio when the user locks the screen (optional premium feature).

### C. Uploads & Camera
*   **File Picking**: Use `expo-image-picker` or `expo-document-picker` to select video files from the phone's gallery.
*   **Camera Integration**: Build a "Shorts" creator tool using `expo-camera` to record directly in the app.
*   **Upload Progress**: Mobile uploads can be interrupted. You might need background upload tasks if files are large.

### D. Real-time Messaging
*   Your `Socket.IO` logic is largely portable.
*   **Push Notifications**: This is a mobile-exclusive feature. You will need to integrate **Expo Notifications** or **OneSignal**. When a socket event `receive_message` comes in while the app is backgrounded, the socket disconnects. You must rely on the backend sending a Push Notification via FCM/APNs to alert the user.

## 4. Code Sharing Strategy (Monorepo vs. Separate)
Since you want to keep it simple:
*   **Separate Repo**: Start a new project for the mobile app (`blut-mobile`).
*   **Copy-Paste Logic**: Manually copy your `hooks`, `utils`, and simple `components` (buttons, cards) into the new project. Adapt the `div`s to `View`s and `span`s to `Text`s.

*Advanced approach (Future)*: Use a Monorepo (TurboRepo/Nx) to share a `packages/ui` and `packages/logic` folder between Web and Mobile.

## 5. Step-by-Step Execution Plan

1.  **Initialize Project**:
    ```bash
    npx create-expo-app@latest blut-mobile
    cd blut-mobile
    npx expo install nativewind
    ```

2.  **Setup Navigation**:
    *   Install React Navigation.
    *   Create the Bottom Tabs (Home, Shorts, Subs).

3.  **Port Authentication**:
    *   Create Login/Signup screens.
    *   Connect to `POST /api/auth/login`.
    *   Save token to SecureStore.

4.  **Implement Feed & Player**:
    *   Fetch video list.
    *   Render `FlatList` (mobile version of mapping a list).
    *   Tap video -> Navigate to `WatchScreen` -> Auto-play video.

5.  **Add Interactivity**:
    *   Like, Comment, Subscribe buttons (reuse logic).
    *   Port the Socket.IO client for messaging.

6.  **Media Features**:
    *   Implement Video Upload from Gallery.
    *   (Optional) Camera recording screen.

## 6. Challenges to Watch Out For
*   **Platform Differences**: iOS and Android sometimes behave differently (e.g., shadow styles, keyboard handling).
*   **App Stores**: Apple and Google have strict review processes. You can't just "deploy" like the web. You have to submit for review.
*   **Updates**: To update native code, you must resubmit to the store. (Expo Updates allows "Over-the-Air" JavaScript updates for small fixes).
