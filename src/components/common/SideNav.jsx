import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import logoImage from '../../assets/logo.png';

export default function SideNav({ isExpanded, setIsExpanded, mainMenuItems = [], bottomMenuItems = [] }) {
    const navigate = useNavigate();
    const location = useLocation();

    const NavItem = ({ item }) => {
        const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');

        return (
            <button
                onClick={() => navigate(item.path)}
                className={`relative w-full flex items-center px-3 py-3 rounded-lg transition-colors group ${isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-slate-800 dark:text-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-[#E2E8F0]'
                    }`}
                title={!isExpanded ? item.label : undefined}
            >
                <div className="flex items-center justify-center shrink-0 w-8">
                    {item.icon}
                </div>
                <span
                    className={`ml-3 whitespace-nowrap transition-opacity duration-300 tracking-wide text-left ${isExpanded ? 'opacity-100 delay-75' : 'opacity-0'
                        }`}
                >
                    {item.label}
                </span>
            </button>
        );
    };

    return (
        <div
            className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 dark:bg-[#020617] dark:border-slate-800 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 flex flex-col overflow-hidden ${isExpanded ? 'w-64 shadow-xl dark:shadow-black/50' : 'w-20'
                }`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-5 border-b border-gray-200 dark:bg-[#020617] dark:border-slate-800 shrink-0 mt-2">
                <div className="flex items-center w-full">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg overflow-hidden">
                        <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1
                        className={`ml-3 text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100 delay-75' : 'opacity-0'
                            }`}
                    >
                        BIT Placement
                    </h1>
                </div>
            </div>

            {/* Main Menu */}
            <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto overflow-x-hidden">
                {mainMenuItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                ))}
            </nav>

            {/* Bottom Menu */}
            <div className="px-3 py-4 space-y-1 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-[#020617] min-w-[16rem]">
                {bottomMenuItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                ))}

                <button
                    onClick={() => {
                        localStorage.removeItem('user');
                        navigate('/login');
                    }}
                    className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400`}
                >
                    <div className="flex items-center justify-center shrink-0 w-8">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <span
                        className={`ml-3 font-medium whitespace-nowrap transition-opacity duration-300 text-left ${isExpanded ? 'opacity-100 delay-75' : 'opacity-0'
                            }`}
                    >
                        Logout
                    </span>
                </button>
            </div>
        </div>
    );
}
