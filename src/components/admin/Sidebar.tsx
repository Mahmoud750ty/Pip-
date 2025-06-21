import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { FaTachometerAlt, FaSmoking, FaCookieBite, FaCandyCane, FaCarrot, FaStar, FaGamepad, FaSignOutAlt, FaPlus } from 'react-icons/fa';

const navLinks = [
    { to: "/admin", icon: <FaTachometerAlt />, text: "Dashboard" },
    { to: "/admin/smokes", icon: <FaSmoking />, text: "Smokes" },
    { to: "/admin/snack-attack", icon: <FaCookieBite />, text: "Snack Attack" },
    { to: "/admin/candy-boom", icon: <FaCandyCane />, text: "Candy Boom" },
    { to: "/admin/super-nuts", icon: <FaCarrot />, text: "Super Nuts" },
    { to: "/admin/vibe-save", icon: <FaStar />, text: "Vibe Save" },
    { to: "/admin/game-on", icon: <FaGamepad />, text: "Game ON" },
    { to: "/admin/new-order", icon: <FaPlus />, text: "New Sale" },
];

const Sidebar: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    return (
        <div className="w-64 h-screen bg-primary text-black flex flex-col fixed">
            <div className="p-6 text-2xl font-bold border-b border-[#224ED1]">
                Admin Panel
            </div>
            <nav className="flex-grow p-4">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === "/admin"}
                        className={({ isActive }) =>
                            `flex items-center p-3 my-2 rounded-lg transition-colors ${isActive ? 'bg-white text-primary' : 'hover:bg-blue-800'
                            }`
                        }
                    >
                        <span className="mr-3">{link.icon}</span>
                        {link.text}
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-[#224ED1]">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-3 rounded-lg hover:bg-blue-800 transition-colors"
                >
                    <FaSignOutAlt className="mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;