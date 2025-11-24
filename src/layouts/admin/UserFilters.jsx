import React from 'react';
import { Search } from 'lucide-react';

const STATIC_ROLES = ['All', 'ADMIN', 'MANAGER', 'EMPLOYEE'];

const Dropdown = ({ title, options, selected, onSelect }) => (
    <div className="dropdown-container">
        <select
            value={selected}
            onChange={(e) => onSelect(e.target.value)}
            className="dropdown-select"
        >
            <option value="All">{title}: All</option>
            {options.filter(o => o !== 'All').map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);

const UserFilters = ({ filters, updateFilter, ibuOptions }) => {
    return (
        <div className="filter-bar-container">
            {/* Search Input */}
            <div className="search-container">
                <Search className="search-icon" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Filters */}
            <div className="filter-dropdowns">
                <Dropdown 
                    title="Role" 
                    options={STATIC_ROLES} 
                    selected={filters.role} 
                    onSelect={(val) => updateFilter('role', val)} 
                />
                <Dropdown 
                    title="IBU" 
                    options={ibuOptions} 
                    selected={filters.ibu} 
                    onSelect={(val) => updateFilter('ibu', val)} 
                />
            </div>
        </div>
    );
};

export default UserFilters;