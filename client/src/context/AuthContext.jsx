import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Roles: 'guest' | 'citizen' | 'authority'
  const [role, setRole] = useState('guest');
  const [user, setUser] = useState({
    id: "GUEST-PUBLIC",
    role: "guest",
    name: "Civilian Observer",
    title: "Public Observer",
    rwa: "Delhi-NCR Wide",
    civicCredits: 0,
    badgeTier: "Civic Observer",
    verifiedReportsCount: 0
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [broadcastAlerts, setBroadcastAlerts] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  // Poll for emergency broadcasts
  useEffect(() => {
    const fetchBroadcasts = async () => {
      try {
        const res = await fetch('/api/broadcasts');
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            setBroadcastAlerts(data.data);
            setUnreadAlertsCount(data.data.length);
          }
        }
      } catch (err) {
        console.warn("Broadcast fetch error:", err);
      }
    };

    fetchBroadcasts();
    const interval = setInterval(fetchBroadcasts, 15000);
    return () => clearInterval(interval);
  }, []);

  const switchRole = async (targetRole) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setRole(data.user.role);
        return data.user;
      }
    } catch (err) {
      console.warn("Role switch API failed, using local profile:", err);
    }

    // Local fallback
    setRole(targetRole);
    if (targetRole === 'citizen') {
      setUser({
        id: "USR-DEL-8921",
        role: "citizen",
        name: "Arjun Verma",
        title: "Senior Resident Sentinel",
        rwa: "Vasant Kunj Sector C RWA",
        civicCredits: 850,
        badgeTier: "Hydro Sentinel Grade II",
        verifiedReportsCount: 6
      });
    } else if (targetRole === 'authority') {
      setUser({
        id: "OFFICER-MCD-404",
        role: "authority",
        name: "Dr. Rajeshwar Rao",
        title: "Chief Municipal Hydrology Officer",
        department: "MCD Flood Control & DJB SCADA Cell",
        badgeTier: "Authority Level IV Command",
        activeDispatchesCount: 14
      });
    } else {
      setUser({
        id: "GUEST-PUBLIC",
        role: "guest",
        name: "Civilian Observer",
        title: "Public Observer",
        rwa: "Delhi-NCR Wide",
        civicCredits: 0,
        badgeTier: "Civic Observer"
      });
    }
  };

  const addCivicCredits = (points = 150) => {
    setUser(prev => ({
      ...prev,
      civicCredits: (prev.civicCredits || 0) + points,
      verifiedReportsCount: (prev.verifiedReportsCount || 0) + 1
    }));
  };

  const markAlertsRead = () => {
    setUnreadAlertsCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        switchRole,
        isLoginModalOpen,
        setIsLoginModalOpen,
        broadcastAlerts,
        setBroadcastAlerts,
        unreadAlertsCount,
        markAlertsRead,
        addCivicCredits
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
