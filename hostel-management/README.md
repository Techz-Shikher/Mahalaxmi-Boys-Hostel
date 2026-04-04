# 🏢 Hostel Management System

A full-stack hostel management system built with **Next.js 14 (App Router)**, **React**, **Tailwind CSS**, and **Firebase**.

## 🚨 Getting Errors? Quick Fix!

**If you're getting "Failed to create transport route" (or meal/post) errors:**

👉 **[Follow the 10-minute Quick Fix Guide](QUICK_FIX.md)**

Key steps:
1. Create `.env.local` with Firebase credentials
2. Update Firestore Rules from `firestore.rules`
3. Restart dev server

All errors are usually due to missing Firebase configuration!

## ✨ Features

### 🔐 Authentication & Authorization
- Secure Auth0 integration for enterprise-grade authentication
- Role-based access control (Admin, Staff, Student)
- Secure route protection and session management
- Multi-factor authentication support

### 👨‍💼 Admin Features
- **Dashboard**: Analytics and system overview
- **Student Management**: Add, edit, view, and manage student records
- **Staff Management**: Manage hostel staff and assignments
- **Room Configuration**: Set up hostels, buildings, and room layouts
- **Financial Management**: Track fees and payments
- **System Reports**: Generate comprehensive analytics and reports
- **System Settings**: Configure hostel policies and operations

### 👔 Staff Features
- **Complaint Management**: View, assign, and resolve complaints with status tracking
- **Attendance Tracking**: Record hostel attendance
- **Maintenance Scheduling**: Manage maintenance tasks and schedules
- **Announcements**: Create and publish hostel announcements
- **Mess Planning**: Plan and update meal menus with nutritional details
- **Staff Reports**: Generate performance and utilization reports

### 👨‍🎓 Student Features
- **Dashboard**: Personal information, room assignment, and quick shortcuts
- **File Complaints**: Submit complaints with categories and image uploads
- **View Status**: Real-time complaint status tracking with staff updates
- **Announcements**: Read and filter hostel announcements
- **Mess Menu**: View weekly meal schedules and provide feedback
- **Transport Booking**: Book transport for hostel trips
- **Community Hub**: Connect with other students and share resources

### 💾 Database (Firebase Firestore)
Collections:
- **users**: User profiles with role-based access
- **students**: Complete student records and room assignments
- **complaints**: Complaints with category, status, and staff notes
- **announcements**: Hostel announcements with scheduling
- **meals**: Meal menus with nutritional information
- **transport**: Transport bookings and schedules
- **community**: Community discussions and shared resources

### 📁 File Storage
- Firebase Storage for complaint images and documents
- Media storage for community hub content

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Firebase account (free tier is sufficient)

### Step 1: Clone/Download the Project
```bash
cd hostel-management
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Firebase

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name (e.g., "hostel-management")
   - Enable Google Analytics (optional)

2. **Enable Authentication**:
   - In Firebase Console, go to **Authentication** > **Sign-in method**
   - Enable **Email/Password** authentication

3. **Create Firestore Database**:
   - Go to **Firestore Database**
   - Click **Create database**
   - Select **Start in production mode**
   - Choose a location (closest to your region)

4. **Set Up Storage**:
   - Go to **Storage**
   - Click **Get started**
   - Accept the default security rules

5. **Get Your Firebase Config**:
   - Go to **Project Settings** (gear icon)
   - Scroll to **Your apps** section
   - Click the web app (or create one with `</>` icon)
   - Copy the Firebase config

### Step 4: Configure Environment Variables

1. Open `.env.local` file in the project root
2. Replace the placeholder values with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 5: Configure Firestore Security Rules

1. In Firebase Console, go to **Firestore Database** > **Rules**
2. Replace ALL the rules with:

```javascript
// Firestore Security Rules for Hostel Management System
// Copy these rules to Firebase Console > Firestore Database > Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check user role
    function getUserRole(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data.role;
    }
    
    function isAdmin() {
      return request.auth != null && getUserRole(request.auth.uid) == 'Admin';
    }
    
    function isStaff() {
      return request.auth != null && getUserRole(request.auth.uid) == 'Staff';
    }
    
    function isStudent() {
      return request.auth != null && getUserRole(request.auth.uid) == 'Student';
    }
    
    // User documents - read/write own profile, admin can modify all
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow create: if request.auth != null;
    }

    // Students collection - admin can write, users can read their own
    match /students/{studentId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || isAdmin());
      allow write: if isAdmin();
      allow create: if isAdmin();
    }

    // ⭐ Student Status - Real-time presence tracking
    match /studentStatus/{userId} {
      allow write: if request.auth.uid == userId;
      allow read: if request.auth != null;
    }

    // Rooms - authenticated users can read, admin can write
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
      allow create: if isAdmin();
    }

    // Complaints - users can create, read own/assigned, staff/admin can write
    match /complaints/{complaintId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
                     (resource.data.studentId == request.auth.uid || isAdmin() || isStaff());
      allow update, delete: if isAdmin() || isStaff();
    }

    // Announcements - admin creates, all authenticated users can read
    match /announcements/{announcementId} {
      allow read: if request.auth != null;
      allow write: if isAdmin() || isStaff();
      allow create: if isAdmin() || isStaff();
    }

    // Meals - staff creates and updates, all can read
    match /meals/{mealId} {
      allow read: if request.auth != null;
      allow write: if isAdmin() || isStaff();
      allow create: if isAdmin() || isStaff();
      allow update: if isAdmin() || isStaff();
    }

    // Weekly Menu - admin can read/write, all authenticated users can read
    match /weeklyMenu/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Food Bookings - students can create own, admin can read all
    match /foodBookings/{bookingId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || isAdmin());
      allow update: if request.auth != null && 
                       (resource.data.userId == request.auth.uid || isAdmin());
      allow delete: if isAdmin();
    }

    // Transport Bookings - students can create own, staff/admin can manage
    match /transportBookings/{bookingId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || isAdmin() || isStaff());
      allow update: if request.auth != null && 
                       (resource.data.userId == request.auth.uid || isAdmin() || isStaff());
      allow delete: if isAdmin();
    }

    // Community Posts - students can create, all can read
    match /communityPosts/{postId} {
      allow create: if isStudent();
      allow read: if request.auth != null;
      allow update: if request.auth != null && resource.data.studentId == request.auth.uid;
      allow delete: if isAdmin() || (request.auth != null && resource.data.studentId == request.auth.uid);
    }

    // Community Groups - students can create, all can read
    match /communityGroups/{groupId} {
      allow create: if isStudent();
      allow read: if request.auth != null;
      allow update: if resource.data.moderator == request.auth.uid || isAdmin();
    }

    // Group Members - students can add themselves
    match /communityGroups/{groupId}/members/{memberId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == memberId || isAdmin();
    }

    // Post Comments - authenticated users can create, read
    match /communityPosts/{postId}/comments/{commentId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.studentId == request.auth.uid;
    }

    // Post Likes - authenticated users can create
    match /communityPosts/{postId}/likes/{userId} {
      allow create: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
      allow delete: if request.auth.uid == userId || isAdmin();
    }

    // Institute Bookings - students can create own, admin can read all
    match /instituteBookings/{bookingId} {
      allow create: if request.auth != null && request.auth.uid != null;
      allow read: if isAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
      allow update, delete: if isAdmin();
    }

    // Meal Feedback - students can create
    match /mealFeedback/{feedbackId} {
      allow create: if isStudent();
      allow read: if isAdmin() || isStaff();
    }
  }
}
```

3. Click **🔴 Publish**

### Step 6: Configure Firebase Storage Rules

1. Go to **Storage** > **Rules**
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /complaints/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

### Step 7: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Application

### Create Test Accounts

1. **Admin Account**:
   - Go to `/signup`
   - Email: `admin@hostel.com`
   - Password: `admin123`
   - Role: `Admin`
   - Click **Sign Up**

2. **Student Account**:
   - Go to `/signup`
   - Email: `student@hostel.com`
   - Password: `student123`
   - Role: `Student`
   - Click **Sign Up**

### Test Admin Panel
1. Login with admin credentials
2. Go to **Dashboard** - view statistics
3. Go to **Rooms** - add a new room (e.g., Room 101, Capacity 2)
4. Go to **Complaints** - view complaints from students
5. Go to **Announcements** - post a notice

### Test Student Panel
1. Login with student credentials
2. Go to **Dashboard** - view room assignment status
3. Go to **File Complaint** - submit a complaint with/without image
4. Go to **My Complaints** - view complaint status
5. Go to **Announcements** - read notices

---

## 📁 Project Structure

```
hostel-management/
├── app/
│   ├── (auth)/                    # Auth routes (login, signup)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── admin/                     # Admin routes
│   │   ├── dashboard/page.tsx
│   │   ├── rooms/page.tsx
│   │   ├── complaints/page.tsx
│   │   ├── announcements/page.tsx
│   │   └── layout.tsx
│   ├── student/                   # Student routes
│   │   ├── dashboard/page.tsx
│   │   ├── complaints/page.tsx
│   │   ├── announcements/page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page (redirects)
│   └── globals.css                # Global styles
├── components/
│   └── shared/                    # Reusable components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── ProtectedRoute.tsx
│       ├── LoadingSpinner.tsx
│       ├── ErrorMessage.tsx
│       └── SuccessMessage.tsx
├── context/
│   └── AuthContext.tsx            # Auth context
├── lib/
│   ├── firebase.ts                # Firebase initialization
│   ├── auth.ts                    # Auth functions
│   ├── firestore.ts               # Firestore functions
│   └── storage.ts                 # Storage functions
├── hooks/                         # Custom hooks (for future use)
├── public/                        # Static files
├── .env.local                     # Environment variables
├── tailwind.config.js             # Tailwind config
├── next.config.js                 # Next.js config
├── tsconfig.json                  # TypeScript config
├── postcss.config.js              # PostCSS config
├── package.json                   # Dependencies
└── README.md                      # This file
```

---

## 🛠️ Key Technologies

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with App Router |
| **React** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Firebase Auth** | User authentication |
| **Firestore** | Real-time database |
| **Firebase Storage** | File storage for images |

---

## 🔐 Security Features

- ✅ Role-based access control (RBAC)
- ✅ Protected routes with authentication
- ✅ Firestore security rules
- ✅ Firebase Storage rules
- ✅ No sensitive data in environment variables (use `NEXT_PUBLIC_` only for client-side safe data)

---

## 📝 API Documentation

### Authentication Functions
- `signUpWithEmail(email, password, name, role)` - Register new user
- `signInWithEmail(email, password)` - Login user
- `logout()` - Logout current user
- `getCurrentUser()` - Get current auth user

### Firestore Functions
- **Users**: `createUser()`, `getUser()`, `updateUser()`
- **Rooms**: `createRoom()`, `getRooms()`, `getRoom()`, `updateRoom()`, `deleteRoom()`
- **Complaints**: `createComplaint()`, `getComplaints()`, `updateComplaint()`, `deleteComplaint()`
- **Announcements**: `createAnnouncement()`, `getAnnouncements()`, `updateAnnouncement()`, `deleteAnnouncement()`

### Storage Functions
- `uploadImage(file, path)` - Upload image to Storage
- `deleteImage(path)` - Delete image from Storage

---

## 🚀 Deployment

### Deploy on Vercel
```bash
npm run build
# Push to GitHub
# Connect GitHub repo to Vercel
# Deploy automatically
```

### Environment Variables on Vercel
Add all `.env.local` variables to Vercel **Settings** > **Environment Variables**

---

## 🐛 Troubleshooting

### Issue: "Firebase config is not initialized"
- Verify all environment variables in `.env.local`
- Ensure you used `NEXT_PUBLIC_` prefix for public variables

### Issue: "Permission denied" errors
- Check Firestore and Storage security rules
- Verify user role in Firestore

### Issue: Images not uploading
- Check Firebase Storage bucket name is correct
- Verify Storage rules are published

### Issue: Login/Signup not working
- Enable Email/Password authentication in Firebase
- Check browser console for detailed errors

---

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hooks](https://react.dev/reference/react/hooks)

---

## 🤝 Contributing

Feel free to contribute by submitting issues and pull requests.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 💡 Future Enhancements

- [ ] Real-time notifications for complaints
- [ ] Email notifications
- [ ] SMS notifications for admins
- [ ] Analytics dashboard
- [ ] Export reports to PDF/Excel
- [ ] Payment integration for hostel fees
- [ ] Maintenance request system
- [ ] Room booking system

---

## 📞 Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**Happy coding! 🚀**
