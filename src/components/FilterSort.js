import React from 'react';
import './FilterSort.css';

const FilterSort = ({ filters, onFilterChange, totalCount, filteredCount }) => {
  
  React.useEffect(() => {
    console.log('FilterSort - Component mounted/updated with filters:', filters);
  }, [filters]);
  
  const handleFilterChange = (key, value) => {
    console.log('FilterSort - Change detected:', key, '=', value);
    console.log('FilterSort - Current filters:', JSON.stringify(filters));
    console.log('FilterSort - onFilterChange type:', typeof onFilterChange);
    if (typeof onFilterChange === 'function') {
      console.log('FilterSort - Calling onFilterChange with:', { [key]: value });
      onFilterChange({ [key]: value });
      console.log('FilterSort - onFilterChange called successfully');
    } else {
      console.error('onFilterChange is not a function!');
    }
  };

  const handleClearFilters = () => {
    console.log('FilterSort - Clear filters clicked');
    if (typeof onFilterChange === 'function') {
      onFilterChange({
        status: 'all',
        priority: 'all',
        dateRange: 'all',
        sortBy: 'date',
        sortOrder: 'desc'
      });
    } else {
      console.error('onFilterChange is not a function!');
    }
  };

  return (
    <div className="filter-sort-container">
      <div className="filter-header">
        <h3>Filter & Sort Grievances</h3>
        <div className="results-count">
          Showing {filteredCount} of {totalCount} grievances
        </div>
      </div>
      
      <div className="filter-grid">
        {/* Status Filter */}
        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="filter-group">
          <label htmlFor="priority-filter">Priority</label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="filter-group">
          <label htmlFor="date-filter">Date Range</label>
          <select
            id="date-filter"
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="filter-group">
          <label htmlFor="sort-filter">Sort By</label>
          <select
            id="sort-filter"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="date">Date Created</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="filter-group">
          <label htmlFor="order-filter">Order</label>
          <select
            id="order-filter"
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="filter-group">
          <button 
            className="clear-filters-btn"
            onClick={handleClearFilters}
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSort;