import { useState } from 'react';
import {
  Users,
  MessageSquare,
  ShoppingCart,
  Calendar,
  Menu as MenuIcon,
  BarChart3,
  FileText,
  CheckCircle,
  XCircle,
  UserPlus
} from 'lucide-react';
import { Sidebar } from '@/app/components/Sidebar';
import { VotesSection } from '@/app/components/VotesSection';
import { RebateRequests } from '@/app/components/RebateRequests';
import { StudentsList } from '@/app/components/StudentsList';
import { FeedbackSection } from '@/app/components/FeedbackSection';
import { ExtraBuyingHistory } from '@/app/components/ExtraBuyingHistory';
import { MenuManagement } from '@/app/components/MenuManagement';
import { PollManagement } from '@/app/components/PollManagement';
import { NewPersonRequests } from '@/app/components/NewPersonRequests';

export default function ManagerDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'votes', label: 'View Votes', icon: CheckCircle },
    { id: 'rebate', label: 'Rebate Requests', icon: FileText },
    { id: 'newperson', label: 'New Person Requests', icon: UserPlus },
    { id: 'students', label: 'All Students', icon: Users },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'history', label: 'Extra Buying History', icon: ShoppingCart },
    { id: 'menu', label: 'Menu Management', icon: Calendar },
    { id: 'polls', label: 'Poll Management', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'votes':
        return <VotesSection />;
      case 'rebate':
        return <RebateRequests />;
      case 'newperson':
        return <NewPersonRequests />;
      case 'students':
        return <StudentsList />;
      case 'feedback':
        return <FeedbackSection />;
      case 'history':
        return <ExtraBuyingHistory />;
      case 'menu':
        return <MenuManagement />;
      case 'polls':
        return <PollManagement />;
      case 'dashboard':
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-black z-50 flex items-center px-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 ml-4">
          <div className="w-10 h-10 border-2 border-black flex items-center justify-center font-bold">
            IIT
          </div>
          <div>
            <h1 className="font-bold text-lg">Mess Management for Managers</h1>
            <p className="text-xs text-gray-600">IIT Kanpur</p>
          </div>
        </div>

        <div className="ml-auto text-sm">
          <p className="font-medium">Wednesday, 21 January 2026</p>
          <p className="text-xs text-gray-600">04:30:33 pm</p>
        </div>
      </header>

      <div className="pt-16 flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          menuItems={menuItems}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main Content */}
        <main className={`flex-1 p-8 transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function DashboardOverview() {
  const stats = [
    { label: 'Total Students', value: '350', icon: Users },
    { label: 'Pending Rebates', value: '12', icon: FileText },
    { label: 'Active Polls', value: '3', icon: BarChart3 },
    { label: 'New Requests', value: '5', icon: UserPlus },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="border-2 border-black p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-2 border-black p-6">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="border-2 border-black p-4 hover:bg-black hover:text-white transition-colors">
            Update Daily Menu
          </button>
          <button className="border-2 border-black p-4 hover:bg-black hover:text-white transition-colors">
            Create New Poll
          </button>
          <button className="border-2 border-black p-4 hover:bg-black hover:text-white transition-colors">
            View Feedback
          </button>
        </div>
      </div>

      <div className="border-2 border-black p-6">
        <h3 className="text-lg font-bold mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {[
            { time: '10 mins ago', text: 'New rebate request from Student #2301' },
            { time: '25 mins ago', text: 'Poll "Menu Preferences" ended' },
            { time: '1 hour ago', text: 'Menu updated for tomorrow' },
            { time: '2 hours ago', text: 'New person request approved' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 pb-3 border-b border-gray-200 last:border-0">
              <span className="text-xs text-gray-500 w-24">{activity.time}</span>
              <span className="text-sm">{activity.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
