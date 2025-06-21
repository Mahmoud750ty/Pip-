import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';

const AdminLayout: React.FC = () => {
    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <Outlet /> {/* This will render the specific admin page */}
            </main>
        </div>
    );
};

export default AdminLayout;