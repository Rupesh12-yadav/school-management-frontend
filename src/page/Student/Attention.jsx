import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { attendanceAPI } from "../../services/api";
import { useAuth } from "../../context/AuthProvider";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const AttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Get user ID - check both _id and userId
  const userId = user?._id || user?.userId;

  useEffect(() => {
    if (userId) {
      fetchAttendance();
    } else {
      // If no user ID, set loading to false and show error
      setIsLoading(false);
      setError('Please login to view your attendance');
    }
  }, [userId]);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching attendance for student...');

      // Use the getMyAttendance function which uses the logged-in user's ID
      const response = await attendanceAPI.getMyAttendance();
      console.log('Attendance API Response:', response);

      // Handle different response formats
      const attendanceData = Array.isArray(response) 
        ? response 
        : response?.data || response || [];
      
      console.log('Attendance data:', attendanceData);
      
      // Transform the data to match our format
      const transformedData = attendanceData.map(item => ({
        _id: item._id,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : 'N/A',
        status: item.status || 'N/A',
        remarks: item.remarks || ''
      }));

      // Sort by date descending (newest first)
      transformedData.sort((a, b) => new Date(b.date) - new Date(a.date));

      setAttendance(transformedData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError(error.message || 'Failed to fetch attendance');
      setAttendance([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = attendance.filter((r) => {
    if (!fromDate || !toDate) return true;
    const d = new Date(r.date);
    return d >= new Date(fromDate) && d <= new Date(toDate);
  });

  const present = filtered.filter((r) => r.status === "Present").length;
  const absent = filtered.filter((r) => r.status === "Absent").length;
  const onLeave = filtered.filter((r) => r.status === "Leave").length;
  const total = filtered.length;
  const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

  // Sort filtered data for chart (oldest first for better visualization)
  const chartDataFiltered = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartData = {
    labels: chartDataFiltered.map((r) => r.date),
    datasets: [
      {
        label: "Attendance",
        data: chartDataFiltered.map((r) => {
          switch (r.status) {
            case "Present": return 1;
            case "Absent": return 0;
            case "Leave": return 0.5;
            default: return 0;
          }
        }),
        borderColor: "#fbbf24",
        backgroundColor: "#facc15",
        pointBackgroundColor: chartDataFiltered.map((r) =>
          r.status === "Present" ? "#16A34A" : r.status === "Absent" ? "#DC2626" : "#F59E0B"
        ),
        pointRadius: 5,
        borderWidth: 3,
        tension: 0.35,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-yellow-50 p-4 sm:p-6 md:p-10 flex items-center justify-center">
        <div className="text-xl text-yellow-600">Loading attendance...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-yellow-50 p-4 sm:p-6 md:p-10 flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-4 sm:p-6 md:p-10">

      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold text-yellow-700 mb-6 text-center md:text-left">
        📅 Attendance Overview
      </h1>

      {/* Student Info */}
      <div className="bg-white shadow-md p-4 rounded-xl mb-6 border border-yellow-100">
        <p className="text-gray-700">
          <span className="font-semibold">Student:</span> {user?.name || 'Student'} | 
          <span className="font-semibold"> Class:</span> {user?.class || 'N/A'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="p-3 rounded-lg border w-full sm:w-52 border-gray-300 shadow-sm focus:ring-2 focus:ring-yellow-400"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="p-3 rounded-lg border w-full sm:w-52 border-gray-300 shadow-sm focus:ring-2 focus:ring-yellow-400"
        />

        <button
          onClick={() => {
            setFromDate("");
            setToDate("");
          }}
          className="bg-yellow-600 text-white font-semibold rounded-lg px-6 py-3 w-full sm:w-auto hover:bg-yellow-700"
        >
          Reset Filter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow-md p-5 rounded-xl text-center border border-yellow-100 w-full">
          <h3 className="text-gray-600 font-semibold">✅ Present</h3>
          <p className="text-3xl font-bold text-green-600">{present}</p>
        </div>

        <div className="bg-white shadow-md p-5 rounded-xl text-center border border-yellow-100 w-full">
          <h3 className="text-gray-600 font-semibold">❌ Absent</h3>
          <p className="text-3xl font-bold text-red-600">{absent}</p>
        </div>

        <div className="bg-white shadow-md p-5 rounded-xl text-center border border-yellow-100 w-full">
          <h3 className="text-gray-600 font-semibold">🏖️ On Leave</h3>
          <p className="text-3xl font-bold text-yellow-600">{onLeave}</p>
        </div>

        <div className="bg-white shadow-md p-5 rounded-xl text-center border border-yellow-100 w-full">
          <h3 className="text-gray-600 font-semibold">📊 Attendance Rate</h3>
          <p className="text-3xl font-bold text-blue-600">{rate}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-yellow-100 p-6 rounded-xl shadow-md w-full mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">📈 Attendance Chart</h2>

        <div className="h-[250px] sm:h-[340px] lg:h-[400px]">
          {chartDataFiltered.length > 0 ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    min: -0.1,
                    max: 1.1,
                    ticks: {
                      stepSize: 0.5,
                      callback: (value) => {
                        if (value === 1) return "Present";
                        if (value === 0.5) return "Leave";
                        if (value === 0) return "Absent";
                        return "";
                      },
                    },
                  },
                },
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No attendance data available for the selected period
            </div>
          )}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-yellow-100 p-6 rounded-xl shadow-md w-full">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">📋 Attendance History</h2>
        
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border border-yellow-200">
              <thead className="bg-yellow-50 text-[var(--text-secondary)]">
                <tr>
                  <th className="p-3 text-left border border-yellow-200">Date</th>
                  <th className="p-3 text-left border border-yellow-200">Status</th>
                  <th className="p-3 text-left border border-yellow-200">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <tr key={index} className="border border-yellow-200">
                    <td className="p-3 border border-yellow-200 text-sm text-gray-600">{item.date}</td>
                    <td className="p-3 border border-yellow-200">
                      <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                        item.status === "Present" 
                          ? "bg-green-100 text-green-700" 
                          : item.status === "Absent"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 border border-yellow-200 text-sm text-gray-600">
                      {item.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No attendance records found
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
