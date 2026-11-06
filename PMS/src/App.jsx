import React, { useEffect, useState, useCallback } from 'react';
import './Styles/industrial-theme.css';
import './App.css';

import Navbar from './Components/Navbar';
import LandingHero from './Components/LandingHero';
import DashboardView from './Components/DashboardView';
import Students from './Components/Student';
import Company from './Components/Company';
import Applications from './Components/Applications';
import Drives from './Components/Drives';
import Profile from './Components/Profile';
import ContactModal from './Components/ContactModal';
import LoginPage from './Components/LoginPage';

import { API_ENDPOINTS } from './config/api';
import {
  getStoredUser,
  logoutUser,
  verifyCurrentSession,
  getAuthToken,
  getAuthHeaders,
} from './utils/authService';

function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const token = getAuthToken();
    return token ? getStoredUser() : null;
  });

  // If user is not authenticated when visiting the link, show the separate Login Page first!
  const [activePage, setActivePage] = useState(() => {
    const token = getAuthToken();
    const user = token ? getStoredUser() : null;
    return user ? 'Dashboard' : 'Login';
  });

  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentError, setStudentError] = useState('');
  const [backendStatus, setBackendStatus] = useState('Connected');
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Health check to verify MongoDB Atlas connection status
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.health);
      const data = await res.json();
      if (data && data.database) {
        setBackendStatus(data.database);
      }
    } catch {
      setBackendStatus('Offline');
    }
  }, []);

  // Fetch students from MongoDB through backend API
  const fetchStudents = useCallback(async () => {
    try {
      setStudentError('');
      const response = await fetch(API_ENDPOINTS.students);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to load students');
      }

      setStudents(result.data || []);
    } catch (error) {
      setStudentError(error.message || 'Unable to load students');
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  // Fetch companies from MongoDB
  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.companies);
      const result = await response.json();
      if (response.ok && result.data) {
        setCompanies(result.data);
      }
    } catch (error) {
      console.warn('Unable to load companies:', error);
    }
  }, []);

  // Fetch applications from MongoDB
  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.applications);
      const result = await response.json();
      if (response.ok && result.data) {
        setApplications(result.data);
      }
    } catch (error) {
      console.warn('Unable to load applications:', error);
    }
  }, []);

  // Load all initial data on mount
  const refreshAllData = useCallback(async () => {
    checkHealth();
    await Promise.all([
      fetchStudents(),
      fetchCompanies(),
      fetchApplications(),
    ]);
  }, [checkHealth, fetchStudents, fetchCompanies, fetchApplications]);

  useEffect(() => {
    async function initSession() {
      const existingToken = getAuthToken();
      if (existingToken) {
        const verified = await verifyCurrentSession();
        if (verified) {
          setCurrentUser(verified);
        } else {
          setCurrentUser(null);
          setActivePage('Login');
        }
      } else {
        setCurrentUser(null);
      }
    }
    initSession();
    refreshAllData();
  }, [refreshAllData]);

  // Synchronize application changes with candidate placement status in MongoDB & UI
  const handleApplicationStatusChange = useCallback(
    async (applicationId, newStatus) => {
      const targetApp = applications.find(
        (app) => String(app._id || app.id) === String(applicationId)
      );

      // 1. If candidate is Selected, remove application from the tracker; otherwise update status
      const updatedApplications =
        newStatus === 'Selected' || newStatus === 'Deleted'
          ? applications.filter(
              (app) => String(app._id || app.id) !== String(applicationId)
            )
          : applications.map((app) =>
              String(app._id || app.id) === String(applicationId)
                ? { ...app, status: newStatus }
                : app
            );
      setApplications(updatedApplications);

      // 2. Recompute placement status for each candidate based on applications:
      // If newly selected -> candidate is Placed!
      const updatedStudents = students.map((student) => {
        const isTargetStudent =
          (targetApp?.studentId &&
            String(targetApp.studentId) === String(student._id || student.id)) ||
          (targetApp?.studentName &&
            student.name &&
            targetApp.studentName.trim().toLowerCase() ===
              student.name.trim().toLowerCase());

        if (newStatus === 'Selected' && isTargetStudent) {
          return { ...student, status: 'Placed' };
        }

        const studentApps = updatedApplications.filter((app) => {
          const matchId =
            app.studentId &&
            String(app.studentId) === String(student._id || student.id);
          const matchName =
            app.studentName &&
            student.name &&
            app.studentName.trim().toLowerCase() ===
              student.name.trim().toLowerCase();
          return matchId || matchName;
        });

        if (studentApps.length === 0) {
          return student.status === 'Placed' ? student : student;
        }

        let computedStatus = 'Not Placed';
        if (studentApps.some((app) => app.status === 'Selected')) {
          computedStatus = 'Placed';
        } else if (studentApps.some((app) => app.status === 'Interview')) {
          computedStatus = 'Interview';
        } else if (studentApps.some((app) => app.status === 'Applied')) {
          computedStatus = 'Applied';
        }

        return { ...student, status: computedStatus };
      });

      // Update student directory immediately in UI with zero delay
      setStudents(updatedStudents);

      // 3. Persist changed student records to backend API
      const changedStudents = updatedStudents.filter((student, index) => {
        const prevStudent = students[index];
        return prevStudent && student.status !== prevStudent.status;
      });

      for (const student of changedStudents) {
        const studentIdentifier = student._id || student.id || student.name;
        if (!studentIdentifier) continue;

        try {
          await fetch(`${API_ENDPOINTS.students}/${studentIdentifier}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: student.status }),
          });
        } catch (error) {
          console.warn('Student status sync request note:', error);
        }
      }

      // Re-fetch to ensure complete consistency with MongoDB Atlas
      fetchStudents();
    },
    [applications, students, fetchStudents]
  );

  // Derived Statistics
  const totalStudents = students.length;
  const studentsPlaced = students.filter((s) => s.status === 'Placed').length;
  const totalCompanies = companies.length;
  const placementRate =
    totalStudents > 0
      ? Math.round((studentsPlaced / totalStudents) * 100)
      : 0;

  // Once user logs in on the separate Login page, enter into the website!
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActivePage('Dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setActivePage('Login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is on separate Login page, render the standalone LoginPage component
  if (activePage === 'Login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onExploreLanding={() => setActivePage('Home')}
      />
    );
  }

  return (
    <div className="placement-app-wrapper">
      {/* Modern Top Header / Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenContact={() => setIsContactOpen(true)}
        backendStatus={backendStatus}
        currentUser={currentUser}
        onOpenAuth={() => setActivePage('Login')}
        onLogout={handleLogout}
      />

      {/* Main Content Router */}
      <main
        id="main-content"
        className={activePage === 'Home' ? 'main-home' : 'main-inner'}
        role="main"
      >
        {activePage === 'Home' && (
          <LandingHero
            onNavigate={setActivePage}
            totalStudents={totalStudents}
            studentsPlaced={studentsPlaced}
            totalCompanies={totalCompanies}
            placementRate={placementRate}
            currentUser={currentUser}
          />
        )}

        {activePage === 'Dashboard' && (
          <DashboardView
            students={students}
            companies={companies}
            applications={applications}
            loading={loadingStudents}
            error={studentError}
            onRefresh={refreshAllData}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'Drives' && (
          <Drives
            currentUser={currentUser}
            applications={applications}
            setApplications={setApplications}
            students={students}
            companies={companies}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'Students' && (
          <Students
            students={students}
            setStudents={setStudents}
            onStudentsChanged={fetchStudents}
            currentUser={currentUser}
            onOpenAuth={() => setActivePage('Login')}
          />
        )}

        {activePage === 'Companies' && (
          <Company
            companies={companies}
            setCompanies={setCompanies}
            currentUser={currentUser}
            onOpenAuth={() => setActivePage('Login')}
          />
        )}

        {activePage === 'Applications' && (
          <Applications
            students={students}
            companies={companies}
            applications={applications}
            setApplications={setApplications}
            onApplicationStatusChange={handleApplicationStatusChange}
            currentUser={currentUser}
            onOpenAuth={() => setActivePage('Login')}
          />
        )}

        {activePage === 'Profile' && (
          <Profile
            currentUser={currentUser}
            onUpdateUser={setCurrentUser}
          />
        )}
      </main>

      {/* Placement Cell Contact Drawer Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}

export default App;
