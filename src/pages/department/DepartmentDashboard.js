import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import GrievanceList from '../../components/GrievanceList';
import FilterSort from '../../components/FilterSort';
import { getGrievancesByDepartment, updateGrievanceStatus } from '../../services/grievanceService';
import './DepartmentDashboard.css';

const DepartmentDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { departmentCode } = useParams();
  const { userData } = location.state || {};
  
  const [grievances, setGrievances] = useState([]);
  const [filteredGrievances, setFilteredGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const getDepartmentFullName = (deptCode) => {
    const departmentNames = {
      'pwd': 'Public Works Department (PWD)',
      'municipal': 'Municipal Corporation / Nagar Council / Nagar Panchayat',
      'traffic-police': 'Traffic Police',
      'water-sanitation': 'Water Supply & Sanitation Department',
      'pspcl': 'Punjab State Power Corporation Limited (PSPCL)',
      'health-welfare': 'Health & Family Welfare Department',
      'civil-surgeon': 'Civil Surgeon\'s Office',
      'punjab-police': 'Punjab Police (SSP, Kapurthala)',
      'education': 'District Education Officer (DEO) – School Education Department',
      'agriculture': 'Agriculture & Farmers Welfare Department',
      'food-civil-supplies': 'Food & Civil Supplies Department',
      'roadways': 'Punjab Roadways / PRTC',
      'rto': 'Regional Transport Office (RTO)',
      'revenue': 'Revenue Department (under Deputy Commissioner)',
      'social-security': 'Social Security & Women & Child Development',
      'pollution-control': 'Punjab Pollution Control Board (PPCB)',
      'forest': 'Forest Department',
      'disaster-management': 'District Disaster Management Authority (DDMA)'
    };
    return departmentNames[deptCode] || deptCode;
  };

  useEffect(() => {
    console.log('DepartmentDashboard - Loading grievances');
    console.log('Department code:', departmentCode);
    console.log('User data:', userData);
    console.log('Location state:', location.state);
    loadGrievances();
  }, [departmentCode || userData?.department]);

  useEffect(() => {
    console.log('DepartmentDashboard - Filters changed:', filters);
    console.log('DepartmentDashboard - Total grievances:', grievances.length);
    applyFiltersAndSort();
  }, [grievances, filters]);

  const loadGrievances = async () => {
    try {
      setLoading(true);
      const deptCode = departmentCode || userData?.department;
      const data = await getGrievancesByDepartment(deptCode);
      setGrievances(data);
    } catch (error) {
      console.error('Error loading grievances:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    console.log('DepartmentDashboard - Applying filters and sort');
    console.log('DepartmentDashboard - Starting with grievances:', grievances.length);
    console.log('DepartmentDashboard - Current filter settings:', filters);
    
    let filtered = [...grievances];

    // Apply status filter
    if (filters.status !== 'all') {
      console.log('DepartmentDashboard - Filtering by status:', filters.status);
      filtered = filtered.filter(grievance => grievance.status === filters.status);
      console.log('DepartmentDashboard - After status filter:', filtered.length);
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      console.log('DepartmentDashboard - Filtering by priority:', filters.priority);
      filtered = filtered.filter(grievance => grievance.priority === filters.priority);
      console.log('DepartmentDashboard - After priority filter:', filtered.length);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const dateLimit = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          dateLimit.setHours(0, 0, 0, 0);
          break;
        case 'week':
          dateLimit.setDate(now.getDate() - 7);
          break;
        case 'month':
          dateLimit.setMonth(now.getMonth() - 1);
          break;
        default:
          dateLimit = null;
      }

      if (dateLimit) {
        filtered = filtered.filter(grievance => 
          new Date(grievance.createdAt) >= dateLimit
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (filters.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    console.log('DepartmentDashboard - After sorting:', filtered.length, 'grievances');
    console.log('DepartmentDashboard - Setting filtered grievances');
    setFilteredGrievances(filtered);
  };

  const handleFilterChange = (newFilters) => {
    console.log('DepartmentDashboard - Filter change received:', newFilters);
    console.log('DepartmentDashboard - Current filters:', filters);
    console.log('DepartmentDashboard - New filters will be:', { ...filters, ...newFilters });
    setFilters({ ...filters, ...newFilters });
  };

  const handleStatusUpdate = async (grievanceId, newStatus) => {
    console.log('DepartmentDashboard - Status update received:', grievanceId, newStatus);
    console.log('DepartmentDashboard - Current grievances:', grievances.length);
    try {
      // Update status in database (calling the service)
      console.log('DepartmentDashboard - Calling updateGrievanceStatus service...');
      const result = await updateGrievanceStatus(grievanceId, newStatus);
      console.log('DepartmentDashboard - Service returned:', result);
      
      if (result.success) {
        // Update local state
        setGrievances(prev => {
          const updated = prev.map(grievance => 
            grievance.id === grievanceId 
              ? { ...grievance, status: newStatus, updatedAt: new Date().toISOString() }
              : grievance
          );
          console.log('DepartmentDashboard - Grievances updated in state:', updated.length);
          return updated;
        });
        console.log('DepartmentDashboard - Status updated successfully');
        alert(`✅ Status updated to: ${newStatus.replace('-', ' ').toUpperCase()}`);
      }
    } catch (error) {
      console.error('DepartmentDashboard - Error updating status:', error);
      alert('❌ Failed to update status. Please try again.');
    }
  };

  const departmentName = getDepartmentFullName(departmentCode || userData?.department);

  return (
    <div className="department-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>{departmentName}</h1>
            <p>Grievance Management Dashboard</p>
            <div className="user-info">
              <span className="welcome-text">Welcome, {userData?.username || 'User'}</span>
            </div>
          </div>
        </div>
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-number">{grievances.length}</span>
            <span className="stat-label">Total Grievances</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {grievances.filter(g => g.status === 'pending').length}
            </span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {grievances.filter(g => g.status === 'in-progress').length}
            </span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {grievances.filter(g => g.status === 'resolved').length}
            </span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <FilterSort 
          filters={filters}
          onFilterChange={handleFilterChange}
          totalCount={grievances.length}
          filteredCount={filteredGrievances.length}
        />
        
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading grievances...</p>
          </div>
        ) : (
          <GrievanceList 
            grievances={filteredGrievances}
            onStatusUpdate={handleStatusUpdate}
            department={departmentCode || userData?.department}
          />
        )}
      </div>
    </div>
  );
};

export default DepartmentDashboard;