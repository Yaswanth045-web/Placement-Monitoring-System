import React, { useEffect, useState, useCallback } from 'react';
import './Styles/industrial-theme.css';
import './App.css';

import Navbar from './Components/Navbar';
import LandingHero from './Components/LandingHero';
import DashboardView from './Components/DashboardView';
import Students from './Components/Student';
import Company from './Components/Company';
import Applications from './Components/Applications';
import Profile from './Components/Profile';
import ContactModal from './Components/ContactModal';
import AuthModal from './Components/AuthModal';

import { API_ENDPOINTS } from './config/api';
import {
  getStoredUser,
  setStoredUser,
  logoutUser,
  verifyCurrentSession,
  getAuthToken,
  loginUser,
  switchUserRole,
  SEED_ADMIN,
  SEED_STUDENT,
} from './utils/authService';

function App() {
  const [activePage, setActivePage] = useState('Home');

  // Authentication State with Student/Admin role support
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
      const stored = getStoredUser();
      const isCurrentAdmin = stored?.role === 'admin';

      if (!existingToken) {
        // Authenticate with the role currently selected by the user
        const targetEmail = isCurrentAdmin ? SEED_ADMIN.email : SEED_STUDENT.email;
        const targetPass = isCurrentAdmin ? 'admin123' : 'student123';
        await loginUser(targetEmail, targetPass);
      }
      const verified = await verifyCurrentSession();
      if (verified) {
        setCurrentUser(verified);
      }
    }
    initSession();
    refreshAllData();
  }, [refreshAllData]);

  // Synchronize application changes with student placement status in MongoDB
  const handleApplicationStatusChange = useCallback(
    (applicationId, newStatus) => {
      const updatedApplications = applications.map((application) =>
        String(application._id || application.id) === String(applicationId)
          ? { ...application, status: newStatus }
          : application
      );

      setApplications(updatedApplications);

      const selectedStudentIds = new Set(
        updatedApplications
          .filter((application) => application.status === 'Selected')
          .map((application) => String(application.studentId))
      );

      const updatedStudents = students.map((student) => {
        const isSelected = selectedStudentIds.has(
          String(student._id || student.id)
        );

        if (isSelected && student.status !== 'Placed') {
          return { ...student, status: 'Placed' };
        }

        if (!isSelected && student.status === 'Placed') {
          return { ...student, status: 'Not Placed' };
        }

        return student;
      });

      // Update the interface and persist changed statuses to MongoDB
      const changedStudents = updatedStudents.filter(
        (student, index) => student.status !== students[index]?.status
      );

      setStudents(updatedStudents);

      changedStudents.forEach(async (student) => {
        try {
          const response = await fetch(`${API_ENDPOINTS.students}/${student._id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: student.status }),
          });

          if (!response.ok) {
            console.error('Failed to save placement status for', student.name);
            fetchStudents();
          }
        } catch (error) {
          console.error('Unable to save placement status:', error);
          fetchStudents();
        }
      });
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

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleSwitchRole = async (newRole) => {
    try {
      const updatedUser = await switchUserRole(newRole);
      setCurrentUser(updatedUser);
    } catch (err) {
      console.warn('Switch role exception:', err);
      const nextUser = newRole === 'admin' ? SEED_ADMIN : SEED_STUDENT;
      setCurrentUser(nextUser);
      setStoredUser(nextUser);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsAuthOpen(true);
  };

  return (
    <div className="placement-app-wrapper">
      {/* Top Industrial Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenContact={() => setIsContactOpen(true)}
        backendStatus={backendStatus}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
      />

      {/* Main Routed Content */}
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

        {activePage === 'Students' && (
          <Students
            students={students}
            setStudents={setStudents}
            onStudentsChanged={fetchStudents}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activePage === 'Companies' && (
          <Company
            companies={companies}
            setCompanies={setCompanies}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
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
            onOpenAuth={() => setIsAuthOpen(true)}
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

      {/* Identity & Role Gateway Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
