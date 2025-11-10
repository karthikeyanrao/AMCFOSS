# AMC FOSS Club - Deployment Guide

This guide will help you set up and deploy the upgraded AMC FOSS Club website with authentication, dashboards, and dynamic features.

## Prerequisites

- Node.js 14+ installed
- Firebase account and project
- Git repository
- Vercel account (for deployment)

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and create a new project
3. Enable Authentication (Email/Password provider)
4. Create Firestore Database
5. Set up Firebase Storage (optional, for profile images)

### 2. Get Firebase Configuration

1. Go to Project Settings > General
2. Scroll down to "Your apps" section
3. Click the web app icon (`</>`)
4. Copy the configuration values

### 3. Configure Firestore Security Rules

Go to Firestore Database > Rules and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Authenticated users can read events
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.uid == resource.data.createdBy;
    }

    // Task access based on assignment
    match /tasks/{taskId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.createdBy ||
         request.auth.uid in resource.data.assignedTo);
      allow write: if request.auth != null &&
        request.auth.uid == resource.data.createdBy;
    }

    // Event registrations
    match /eventRegistrations/{registrationId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.auth.uid == resource.data.eventCreatedBy);
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Local Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repository-url>
cd AMCFOSS
npm install
```

### 2. Set Up Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your Firebase configuration:
```env
REACT_APP_FIREBASE_API_KEY=your_actual_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server

```bash
npm start
```

The app will be available at `http://localhost:3000`

## Features Overview

### Authentication System
- **Email Domain Validation**: Only @amrita.edu emails allowed
- **Role-Based Access**: Mentor and Office Bearer roles
- **Secure Storage**: User profiles stored in Firestore

### Dashboards
- **Mentor Dashboard**: View profile, create and manage tasks
- **Office Bearer Dashboard**: All mentor features + event management
- **Real-time Data**: Live updates from Firestore

### Event System
- **Dynamic Events**: Events fetched from database
- **Registration System**: User registration with validation
- **Event Management**: CRUD operations for Office Bearers

### Enhanced UI
- **Car Cursor**: Interactive cursor with keyboard navigation
- **Keyboard Controls**: Arrow keys to move, Enter/Space to click
- **Toast Notifications**: User-friendly feedback system
- **Responsive Design**: Mobile-optimized interface

## Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Deploy

```bash
vercel
```

Follow the prompts:
- Link to your existing Vercel account/project
- Set environment variables in Vercel dashboard
- Deploy the application

### 3. Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Go to Settings > Environment Variables
3. Add all the Firebase configuration variables:
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`

### 4. Redeploy

After setting environment variables, redeploy:

```bash
vercel --prod
```

## Manual Testing Checklist

### Authentication Testing
- [ ] Registration with @amrita.edu email
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials
- [ ] Password reset functionality
- [ ] Role selection during registration
- [ ] Logout functionality

### Dashboard Testing
- [ ] Mentor dashboard access and features
- [ ] Office Bearer dashboard access and features
- [ ] Task creation and assignment
- [ ] Event creation and management
- [ ] Profile editing functionality

### Event Registration Testing
- [ ] Event registration form validation
- [ ] Registration limit enforcement
- [ ] Duplicate registration prevention
- [ ] Event analytics for admins

### UI/UX Testing
- [ ] Car cursor movement and interactions
- [ ] Keyboard navigation functionality
- [ ] Responsive design on mobile/tablet
- [ ] Modal animations and transitions
- [ ] Error message display and handling

## Troubleshooting

### Common Issues

1. **Firebase Configuration Error**
   - Ensure all environment variables are set correctly
   - Check Firebase project settings
   - Verify Firestore rules

2. **Authentication Not Working**
   - Check if Email/Password provider is enabled in Firebase
   - Verify @amrita.edu domain validation
   - Check browser console for errors

3. **Dashboard Not Loading**
   - Ensure user is authenticated
   - Check Firestore permissions
   - Verify user profile exists in database

4. **Events Not Showing**
   - Check Firestore data structure
   - Verify event creation process
   - Check browser console for errors

5. **Keyboard Navigation Issues**
   - Ensure no JavaScript errors
   - Check if cursor component is mounted
   - Verify keyboard event listeners

### Getting Help

1. Check browser console for JavaScript errors
2. Verify Firebase configuration
3. Check network requests in browser dev tools
4. Review Firestore security rules
5. Test with different user roles

## Production Considerations

### Security
- All Firebase rules are configured for production
- Environment variables should never be committed to git
- Regular security audits recommended

### Performance
- Images should be optimized
- Firestore indexes may be needed for complex queries
- Monitor Firebase usage and costs

### Maintenance
- Regular backups of Firestore data
- Monitor authentication logs
- Update dependencies regularly
- Test all features after updates

## Support

For technical support:
1. Check this documentation first
2. Review Firebase documentation
3. Check Vercel deployment logs
4. Create GitHub issues for bugs or feature requests