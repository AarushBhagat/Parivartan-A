import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import GrievanceModal from '../components/GrievanceModal';
import './AdminDashboard.css';

// Department name mapping (outside component to prevent re-creation)
const departmentNames = {
  'pwd': 'Public Works Department (PWD)',
  'municipal': 'Municipal Corporation',
  'traffic-police': 'Traffic Police',
  'water-sanitation': 'Water Supply & Sanitation',
  'pspcl': 'Punjab State Power Corporation (PSPCL)',
  'health-welfare': 'Health & Family Welfare',
  'civil-surgeon': 'Civil Surgeon\'s Office',
  'punjab-police': 'Punjab Police',
  'education': 'School Education Department',
  'agriculture': 'Agriculture & Farmers Welfare',
  'food-civil-supplies': 'Food & Civil Supplies',
  'roadways': 'Punjab Roadways / PRTC',
  'rto': 'Regional Transport Office (RTO)',
  'revenue': 'Revenue Department',
  'social-security': 'Social Security & Women & Child Development',
  'pollution-control': 'Punjab Pollution Control Board',
  'forest': 'Forest Department',
  'disaster-management': 'District Disaster Management Authority'
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [departments, setDepartments] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    head: '',
    officer: '',
    contact: '',
    email: ''
  });

  // Handle tab click
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  // Fetch all grievances from Firebase
  const fetchGrievances = useCallback(async () => {
    try {
      const grievancesRef = collection(db, 'grievances');
      const snapshot = await getDocs(grievancesRef);
      
      const grievancesList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayId: doc.id.substring(0, 8).toUpperCase(), // Show first 8 chars of Firebase ID
          title: data.title || 'Untitled',
          department: departmentNames[data.department] || data.department,
          departmentId: data.department,
          status: data.status || 'pending',
          priority: data.priority || 'medium',
          submittedDate: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          citizenName: data.citizenName || 'Unknown',
          location: typeof data.location === 'object' 
            ? (data.location?.address || data.location?.district || 'N/A')
            : (data.location || 'N/A'),
          description: data.description || ''
        };
      });

      // Sort by date (newest first)
      grievancesList.sort((a, b) => {
        const dateA = new Date(a.submittedDate || 0).getTime();
        const dateB = new Date(b.submittedDate || 0).getTime();
        return dateB - dateA;
      });

      setGrievances(grievancesList);
      return grievancesList;
    } catch (error) {
      console.error('Error fetching grievances:', error);
      return [];
    }
  }, []); // No dependencies needed - departmentNames is a constant

  // Fetch departments and calculate stats
  const fetchDepartments = useCallback(async (grievancesList) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userType', '==', 'department'));
      const snapshot = await getDocs(q);
      
      const departmentsList = snapshot.docs.map(doc => {
        const data = doc.data();
        const deptId = data.department;
        
        // Calculate stats for this department
        const deptGrievances = grievancesList.filter(g => g.departmentId === deptId);
        const resolved = deptGrievances.filter(g => g.status === 'resolved').length;
        const pending = deptGrievances.filter(g => g.status === 'pending').length;
        const inProgress = deptGrievances.filter(g => g.status === 'in-progress').length;
        const total = deptGrievances.length;
        
        // Calculate performance (resolved / total)
        const performance = total > 0 ? Math.round((resolved / total) * 100) : 100;
        
        // Calculate average resolution time for resolved grievances
        let avgResolutionTime = 'N/A';
        if (resolved > 0) {
          const resolvedGrievances = deptGrievances.filter(g => g.status === 'resolved');
          const totalDays = resolvedGrievances.reduce((sum, g) => {
            const submitDate = new Date(g.submittedDate);
            const resolveDate = g.resolvedDate ? new Date(g.resolvedDate) : new Date();
            const daysDiff = Math.floor((resolveDate - submitDate) / (1000 * 60 * 60 * 24));
            return sum + Math.max(daysDiff, 0);
          }, 0);
          const avgDays = Math.round(totalDays / resolved);
          avgResolutionTime = `${avgDays} ${avgDays === 1 ? 'day' : 'days'}`;
        } else if (total === 0) {
          avgResolutionTime = 'No data';
        }
        
        return {
          id: deptId,
          name: departmentNames[deptId] || deptId,
          head: data.displayName || 'Not Assigned',
          officer: data.username || 'Not Assigned',
          contact: data.phoneNumber || '+91-XXXXXXXXXX',
          email: data.email || `${deptId}@parivartan.gov.in`,
          totalGrievances: total,
          resolved: resolved,
          pending: pending,
          inProgress: inProgress,
          avgResolutionTime: avgResolutionTime,
          performance: performance
        };
      });

      setDepartments(departmentsList);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  }, []); // No dependencies needed - departmentNames is a constant

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const grievancesList = await fetchGrievances();
      await fetchDepartments(grievancesList);
      setLoading(false);
    };
    
    loadData();
  }, [fetchGrievances, fetchDepartments]);

  const handleAddDepartment = (e) => {
    e.preventDefault();
    const newDept = {
      id: newDepartment.name.toLowerCase().replace(/\s+/g, '-'),
      ...newDepartment,
      totalGrievances: 0,
      resolved: 0,
      pending: 0,
      inProgress: 0,
      avgResolutionTime: '0 days',
      performance: 100
    };
    setDepartments([...departments, newDept]);
    setShowAddDepartment(false);
    setNewDepartment({ name: '', head: '', officer: '', contact: '', email: '' });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#FFC107';  // Government amber
      case 'in progress': return '#1565C0';  // Government blue
      case 'resolved': return '#66BB6A';  // Government light green
      default: return '#4A4A4A';  // Government secondary text
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return '#DC2626';  // Professional red
      case 'medium': return '#FFC107';  // Government amber
      case 'low': return '#66BB6A';  // Government light green
      default: return '#4A4A4A';  // Government secondary text
    }
  };

  // Handle View Grievance
  const handleViewGrievance = (grievance) => {
    setSelectedGrievance(grievance);
    setShowModal(true);
  };

  // Handle Edit/Status Update
  const handleStatusUpdate = async (grievanceId, newStatus) => {
    try {
      const grievanceRef = doc(db, 'grievances', grievanceId);
      await updateDoc(grievanceRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setGrievances(grievances.map(g => 
        g.id === grievanceId ? { ...g, status: newStatus } : g
      ));
      
      alert('Status updated successfully!');
      setShowModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGrievance(null);
  };

  const filteredGrievances = selectedDepartment === 'all' 
    ? grievances 
    : grievances.filter(g => g.departmentId === selectedDepartment);

  const totalStats = {
    total: grievances.length,
    resolved: grievances.filter(g => g.status === 'resolved').length,
    inProgress: grievances.filter(g => g.status === 'in-progress').length,
    pending: grievances.filter(g => g.status === 'pending').length
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.username || 'Admin'}! Manage all departments and grievances from here.</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabClick('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => handleTabClick('departments')}
        >
          Departments
        </button>
        <button 
          className={`tab ${activeTab === 'grievances' ? 'active' : ''}`}
          onClick={() => handleTabClick('grievances')}
        >
          All Grievances
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleTabClick('analytics')}
        >
          Analytics
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' }}>
          <div>Loading data from Firebase...</div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>Total Grievances</h3>
                <p className="stat-number">{totalStats.total}</p>
              </div>
            </div>
            <div className="stat-card resolved">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Resolved</h3>
                <p className="stat-number">{totalStats.resolved}</p>
              </div>
            </div>
            <div className="stat-card progress">
              <div className="stat-icon">🔄</div>
              <div className="stat-info">
                <h3>In Progress</h3>
                <p className="stat-number">{totalStats.inProgress}</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>Pending</h3>
                <p className="stat-number">{totalStats.pending}</p>
              </div>
            </div>
          </div>

          <div className="department-performance">
            <h2>Department Performance</h2>
            <div className="performance-grid">
              {departments.map(dept => (
                <div key={dept.id} className="performance-card">
                  <h3>{dept.name}</h3>
                  <div className="performance-bar">
                    <div 
                      className="performance-fill" 
                      style={{ width: `${dept.performance}%` }}
                    ></div>
                  </div>
                  <div className="performance-stats">
                    <span>Performance: {dept.performance}%</span>
                    <span>Avg. Resolution: {dept.avgResolutionTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="departments-section">
          <div className="section-header">
            <h2>Department Management</h2>
            <button 
              className="add-btn"
              onClick={() => setShowAddDepartment(true)}
            >
              + Add Department
            </button>
          </div>

          <div className="departments-grid">
            {departments.map(dept => (
              <div key={dept.id} className="department-card">
                <div className="dept-header">
                  <h3>{dept.name}</h3>
                  <div className="dept-actions">
                    <button 
                      className="edit-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert('Edit functionality coming soon!');
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete ${dept.name}?`)) {
                          setDepartments(departments.filter(d => d.id !== dept.id));
                        }
                      }}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="dept-info">
                  <div className="info-row">
                    <span className="label">Department Head:</span>
                    <span className="value">{dept.head}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Assigned Officer:</span>
                    <span className="value">{dept.officer}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Contact:</span>
                    <span className="value">{dept.contact}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{dept.email}</span>
                  </div>
                </div>
                <div className="dept-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Grievances</span>
                    <span className="stat-value">{dept.totalGrievances}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Resolved</span>
                    <span className="stat-value resolved">{dept.resolved}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Pending</span>
                    <span className="stat-value pending">{dept.pending}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showAddDepartment && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Add New Department</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowAddDepartment(false)}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleAddDepartment} className="department-form">
                  <div className="form-group">
                    <label>Department Name</label>
                    <input
                      type="text"
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Department Head</label>
                    <input
                      type="text"
                      value={newDepartment.head}
                      onChange={(e) => setNewDepartment({...newDepartment, head: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Assigned Officer</label>
                    <input
                      type="text"
                      value={newDepartment.officer}
                      onChange={(e) => setNewDepartment({...newDepartment, officer: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      type="tel"
                      value={newDepartment.contact}
                      onChange={(e) => setNewDepartment({...newDepartment, contact: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={newDepartment.email}
                      onChange={(e) => setNewDepartment({...newDepartment, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowAddDepartment(false)}>Cancel</button>
                    <button type="submit">Add Department</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'grievances' && (
        <div className="grievances-section">
          <div className="section-header">
            <h2>All Grievances</h2>
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="department-filter"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="grievances-table">
            <div className="table-header">
              <div className="th">ID</div>
              <div className="th">Title</div>
              <div className="th">Department</div>
              <div className="th">Status</div>
              <div className="th">Priority</div>
              <div className="th">Citizen</div>
              <div className="th">Date</div>
              <div className="th">Actions</div>
            </div>
            {filteredGrievances.map(grievance => (
              <div key={grievance.id} className="table-row">
                <div className="td" title={grievance.id}>{grievance.displayId}</div>
                <div className="td" title={grievance.title}>{grievance.title}</div>
                <div className="td">{grievance.department}</div>
                <div className="td">
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(grievance.status) }}
                  >
                    {grievance.status}
                  </span>
                </div>
                <div className="td">
                  <span 
                    className="priority-badge" 
                    style={{ backgroundColor: getPriorityColor(grievance.priority) }}
                  >
                    {grievance.priority}
                  </span>
                </div>
                <div className="td">{grievance.citizenName}</div>
                <div className="td">{new Date(grievance.submittedDate).toLocaleDateString()}</div>
                <div className="td actions-cell">
                  <button 
                    className="action-btn view"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleViewGrievance(grievance);
                    }}
                    type="button"
                  >
                    View
                  </button>
                  <button 
                    className="action-btn edit"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleViewGrievance(grievance);
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <h2>Analytics & Reports</h2>
          <div className="analytics-grid">
            <div className="chart-card">
              <h3>Grievances by Department</h3>
              <div className="chart-placeholder">
                {departments.map(dept => (
                  <div key={dept.id} className="chart-bar">
                    <div className="bar-label">{dept.name.split(' ')[0]}</div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill" 
                        style={{ height: `${(dept.totalGrievances / 50) * 100}%` }}
                      ></div>
                    </div>
                    <div className="bar-value">{dept.totalGrievances}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="chart-card">
              <h3>Grievances by Status</h3>
              <div className="issue-categories">
                <div className="category-item">
                  <span className="category-name">Pending</span>
                  <span className="category-count">
                    {grievances.filter(g => g.status === 'pending').length} 
                    ({grievances.length > 0 ? Math.round((grievances.filter(g => g.status === 'pending').length / grievances.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="category-item">
                  <span className="category-name">In Progress</span>
                  <span className="category-count">
                    {grievances.filter(g => g.status === 'in-progress').length}
                    ({grievances.length > 0 ? Math.round((grievances.filter(g => g.status === 'in-progress').length / grievances.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="category-item">
                  <span className="category-name">Resolved</span>
                  <span className="category-count">
                    {grievances.filter(g => g.status === 'resolved').length}
                    ({grievances.length > 0 ? Math.round((grievances.filter(g => g.status === 'resolved').length / grievances.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="category-item">
                  <span className="category-name">Rejected</span>
                  <span className="category-count">
                    {grievances.filter(g => g.status === 'rejected').length}
                    ({grievances.length > 0 ? Math.round((grievances.filter(g => g.status === 'rejected').length / grievances.length) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>Grievances by Priority</h3>
              <div className="issue-categories">
                <div className="category-item">
                  <span className="category-name">High Priority</span>
                  <span className="category-count">
                    {grievances.filter(g => g.priority === 'high').length}
                    ({grievances.length > 0 ? Math.round((grievances.filter(g => g.priority === 'high').length / grievances.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="category-item">
                  <span className="category-name">Medium Priority</span>
                  <span className="category-count">
                    {grievances.filter(g => g.priority === 'medium').length}
                    ({grievances.length > 0 ? Math.round((grievances.filter(g => g.priority === 'medium').length / grievances.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="category-item">
                  <span className="category-name">Low Priority</span>
                  <span className="category-count">
                    {grievances.filter(g => g.priority === 'low').length}
                    ({grievances.length > 0 ? Math.round((grievances.filter(g => g.priority === 'low').length / grievances.length) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* Grievance Detail Modal */}
      {showModal && selectedGrievance && (
        <GrievanceModal
          grievance={selectedGrievance}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
          department="admin"
        />
      )}
    </div>
  );
};

export default AdminDashboard;