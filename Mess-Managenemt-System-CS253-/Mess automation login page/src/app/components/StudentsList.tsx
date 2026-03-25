import { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';

interface Student {
  rollNo: string;
  name: string;
  email: string;
  roomNo: string;
  messCardStatus: string;
  phone?: string;
  course?: string;
  year?: string;
  joinedDate?: string;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export function StudentsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Manager token missing. Please log in first.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/manager/students`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          // Transform backend data to frontend format
          const transformedStudents = data.data.map((student: any, index: number) => ({
            rollNo: student.rollNo,
            name: student.name,
            email: student.email,
            roomNo: student.roomNo || 'N/A',
            messCardStatus: student.messCardStatus,
            phone: student.phone || 'N/A',
            course: student.course || 'B.Tech',
            year: student.year || 'N/A',
            joinedDate: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'
          }));
          setStudents(transformedStudents);
        } else {
          setError('Failed to load students data');
        }
      } catch (err) {
        setError('Failed to load students data');
        console.error('Students fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Students...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Students</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Students</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800">
          <Download className="w-4 h-4" />
          Export List
        </button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, roll number, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        
        <div className="flex gap-2 text-sm">
          <span className="px-3 py-2 bg-green-100 border border-green-600">
            Active: {students.filter((s) => s.messCardStatus.toLowerCase() === 'active').length}
          </span>
          <span className="px-3 py-2 bg-red-100 border border-red-600">
            Inactive: {students.filter((s) => s.messCardStatus.toLowerCase() === 'suspended' || s.messCardStatus.toLowerCase() === 'inactive').length}
          </span>
        </div>
      </div>

      {/* Students Table */}
      <div className="border-2 border-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-4 py-3 text-left">Roll Number</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Room</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Join Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => (
                <tr
                  key={student.rollNo}
                  className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  <td className="px-4 py-3 font-medium">{student.rollNo}</td>
                  <td className="px-4 py-3">{student.name}</td>
                  <td className="px-4 py-3">{student.roomNo}</td>
                  <td className="px-4 py-3 text-sm">{student.email}</td>
                  <td className="px-4 py-3 text-sm">{student.phone}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 border ${getStatusColor(
                        student.messCardStatus
                      )}`}
                    >
                      {student.messCardStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {student.joinedDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No students found matching your search.
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600">
        Showing {filteredStudents.length} of {students.length} students
      </div>
    </div>
  );
}
