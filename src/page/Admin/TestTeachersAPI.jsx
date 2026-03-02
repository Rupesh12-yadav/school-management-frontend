import React, { useState } from 'react';
import { teacherAPI } from '../../../services/api';

const TestTeachersAPI = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log('Testing API: http://localhost:3000/api/admin/teachers/teacher/all');
      const data = await teacherAPI.getAllTeachers();
      console.log('Raw Response:', data);
      console.log('Is Array?', Array.isArray(data));
      console.log('Type:', typeof data);
      setResponse(data);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teachers API Test</h1>
      
      <button
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test Teachers API'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <h3 className="font-bold text-red-800">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
          <h3 className="font-bold text-green-800 mb-2">Success!</h3>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Type:</strong> {typeof response} | 
            <strong> Is Array:</strong> {Array.isArray(response) ? 'Yes' : 'No'} |
            <strong> Count:</strong> {Array.isArray(response) ? response.length : 'N/A'}
          </p>
          <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Make sure backend server is running on port 3000</li>
          <li>Click "Test Teachers API" button</li>
          <li>Check browser console (F12) for detailed logs</li>
          <li>If error, check backend server and database</li>
        </ol>
      </div>
    </div>
  );
};

export default TestTeachersAPI;
