import React from 'react';
import './dashboardFooter.css';

function DashboardFooter() {
    return (
        <footer className="dashboard-footer">
            <span>© {new Date().getFullYear()} AgriSphere</span>
        </footer>
    );
}

export default DashboardFooter;
