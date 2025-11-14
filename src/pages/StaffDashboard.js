import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import GrievanceList from '../components/GrievanceList';
import FilterSort from '../components/FilterSort';
import GrievanceModal from '../components/GrievanceModal';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = location.state || {};
  
  const [grievances, setGrievances] = useState([]);
  const [filteredGrievances, setFilteredGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0
  });

  useEffect(() => {
    fetchGrievances();
  }, []);

  useEffect(() => {
    calculateStats(grievances);
  }, [grievances]);

  useEffect(() => {
    applyFilters();
  }, [grievances, filters]);

  const applyFilters = () => {
    let filtered = [...grievances];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(g => g.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(g => g.priority === filters.priority);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(g => {
        const grievanceDate = new Date(g.createdAt);
        
        switch (filters.dateRange) {
          case 'today':
            return grievanceDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return grievanceDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return grievanceDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (filters.sortBy) {
        case 'date':
          compareValue = new Date(b.createdAt) - new Date(a.createdAt);
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          compareValue = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        default:
          compareValue = 0;
      }
      
      return filters.sortOrder === 'asc' ? -compareValue : compareValue;
    });

    setFilteredGrievances(filtered);
  };

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const grievancesRef = collection(db, 'grievances');
      const snapshot = await getDocs(grievancesRef);
      
      const grievancesList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        grievancesList.push({
          id: doc.id,
          title: data.title || 'Untitled',
          description: data.description || 'No description',
          status: data.status || 'pending',
          priority: data.priority || 'medium',
          category: data.category || data.department || 'General',
          department: data.department || 'Unknown',
          citizenName: data.citizenName || data.createdBy?.displayName || 'Anonymous',
          citizenEmail: data.citizenEmail || data.createdBy?.email || 'N/A',
          citizenPhone: data.citizenPhone || 'N/A',
          location: data.location?.address || data.location?.district || 'Unknown',
          createdAt: data.createdAt || data.submittedDate || new Date().toISOString(),
          updatedAt: data.updatedAt || data.createdAt || new Date().toISOString(),
          imageUrl: data.imageUrl || null,
          upvotes: data.upvotes || 0,
          comments: data.comments || []
        });
      });

      // Sort by date (newest first)
      grievancesList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setGrievances(grievancesList);
      setFilteredGrievances(grievancesList);
      console.log(`Loaded ${grievancesList.length} grievances for staff dashboard`);
    } catch (error) {
      console.error('Error fetching grievances:', error);
      alert('Failed to load grievances. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(g => g.status === 'pending').length,
      inProgress: data.filter(g => g.status === 'in-progress').length,
      resolved: data.filter(g => g.status === 'resolved').length,
      highPriority: data.filter(g => g.priority === 'high').length
    };
    setStats(stats);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  const handleGrievanceClick = (grievance) => {
    setSelectedGrievance(grievance);
    setModalOpen(true);
  };

  const handleStatusUpdate = async (grievanceId, newStatus) => {
    try {
      const grievanceRef = doc(db, 'grievances', grievanceId);
      await updateDoc(grievanceRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      const updatedGrievances = grievances.map(g => 
        g.id === grievanceId ? { ...g, status: newStatus } : g
      );
      setGrievances(updatedGrievances);
      
      // Update selected grievance if it's open
      if (selectedGrievance?.id === grievanceId) {
        setSelectedGrievance({ ...selectedGrievance, status: newStatus });
      }

      alert('Status updated successfully!');
      fetchGrievances(); // Refresh to get latest data
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handlePriorityUpdate = async (grievanceId, newPriority) => {
    try {
      const grievanceRef = doc(db, 'grievances', grievanceId);
      await updateDoc(grievanceRef, {
        priority: newPriority,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      const updatedGrievances = grievances.map(g => 
        g.id === grievanceId ? { ...g, priority: newPriority } : g
      );
      setGrievances(updatedGrievances);
      
      if (selectedGrievance?.id === grievanceId) {
        setSelectedGrievance({ ...selectedGrievance, priority: newPriority });
      }

      alert('Priority updated successfully!');
      fetchGrievances();
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Failed to update priority. Please try again.');
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="staff-dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading grievances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Staff Dashboard</h1>
          <p>Welcome, {userData?.username || 'Staff Member'}!</p>
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Grievances</p>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        
        <div className="stat-card in-progress">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        
        <div className="stat-card resolved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>
        
        <div className="stat-card high-priority">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{stats.highPriority}</h3>
            <p>High Priority</p>
          </div>
        </div>
      </div>

      {/* Filter and Sort */}
      <FilterSort 
        filters={filters}
        onFilterChange={handleFilterChange}
        totalCount={grievances.length}
        filteredCount={filteredGrievances.length}
      />

      {/* Grievances List */}
      <div className="grievances-section">
        <h2>Manage Grievances ({filteredGrievances.length})</h2>
        {filteredGrievances.length === 0 ? (
          <div className="no-grievances">
            <p>No grievances found matching your filters.</p>
          </div>
        ) : (
          <GrievanceList 
            grievances={filteredGrievances}
            onGrievanceClick={handleGrievanceClick}
          />
        )}
      </div>

      {/* Grievance Modal */}
      {modalOpen && selectedGrievance && (
        <GrievanceModal
          grievance={selectedGrievance}
          onClose={() => setModalOpen(false)}
          onStatusUpdate={handleStatusUpdate}
          onPriorityUpdate={handlePriorityUpdate}
          isStaff={true}
        />
      )}
    </div>
  );
};

export default StaffDashboard;
