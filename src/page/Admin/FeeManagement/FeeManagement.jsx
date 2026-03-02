import { useState, useEffect } from 'react';
import { feeAPI, studentAPI } from '../../../services/api';
import { toast } from 'react-toastify';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('structure');
  const [feeStructures, setFeeStructures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [pendingFees, setPendingFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState({
    class: '',
    section: '',
    academicYear: '2024-2025',
    fees: { tuition: 0, transport: 0, library: 0, sports: 0, exam: 0, other: 0 },
    dueDate: ''
  });
  const [paymentData, setPaymentData] = useState({
    student: '',
    feeStructure: '',
    amount: 0,
    paymentMethod: 'Cash',
    transactionId: '',
    remarks: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'structure') {
        const res = await feeAPI.getAllFeeStructures();
        setFeeStructures(res.data || []);
      } else if (activeTab === 'payments') {
        const res = await feeAPI.getAllPayments();
        setPayments(res.data || []);
      } else if (activeTab === 'pending') {
        const res = await feeAPI.getPendingFees();
        setPendingFees(res.data || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const loadStudents = async () => {
    try {
      const res = await studentAPI.getAllStudents();
      setStudents(res.data || []);
    } catch (error) {
      toast.error('Failed to load students');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await feeAPI.createFeeStructure(formData);
      toast.success('Fee structure created');
      setShowModal(false);
      loadData();
      setFormData({ class: '', section: '', academicYear: '2024-2025', fees: { tuition: 0, transport: 0, library: 0, sports: 0, exam: 0, other: 0 }, dueDate: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to create fee structure');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await feeAPI.recordPayment(paymentData);
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      loadData();
      setPaymentData({ student: '', feeStructure: '', amount: 0, paymentMethod: 'Cash', transactionId: '', remarks: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to record payment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this fee structure?')) {
      try {
        await feeAPI.deleteFeeStructure(id);
        toast.success('Deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Fee Management</h1>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab('structure')} className={`px-4 py-2 rounded ${activeTab === 'structure' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Fee Structure</button>
        <button onClick={() => setActiveTab('payments')} className={`px-4 py-2 rounded ${activeTab === 'payments' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Payments</button>
        <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Pending Fees</button>
      </div>

      {activeTab === 'structure' && (
        <div>
          <button onClick={() => setShowModal(true)} className="mb-4 px-4 py-2 bg-green-600 text-white rounded">Add Fee Structure</button>
          <div className="grid gap-4">
            {feeStructures.map(fee => (
              <div key={fee._id} className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">Class {fee.class} - Section {fee.section}</h3>
                <p>Total: ₹{fee.totalAmount}</p>
                <p>Due Date: {new Date(fee.dueDate).toLocaleDateString()}</p>
                <button onClick={() => handleDelete(fee._id)} className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          <button onClick={() => { setShowPaymentModal(true); loadStudents(); }} className="mb-4 px-4 py-2 bg-green-600 text-white rounded">Record Payment</button>
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Receipt</th>
                  <th className="p-3 text-left">Student</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Method</th>
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment._id} className="border-t">
                    <td className="p-3">{payment.receiptNumber}</td>
                    <td className="p-3">{payment.student?.name} {payment.student?.lastname}</td>
                    <td className="p-3">₹{payment.amount}</td>
                    <td className="p-3">{payment.paymentMethod}</td>
                    <td className="p-3">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Total Fee</th>
                <th className="p-3 text-left">Paid</th>
                <th className="p-3 text-left">Pending</th>
              </tr>
            </thead>
            <tbody>
              {pendingFees.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-3">{item.student?.name} {item.student?.lastname}</td>
                  <td className="p-3">{item.student?.class}-{item.student?.section}</td>
                  <td className="p-3">₹{item.totalFee}</td>
                  <td className="p-3">₹{item.paidAmount}</td>
                  <td className="p-3 text-red-600 font-bold">₹{item.pendingAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Fee Structure</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Class" value={formData.class} onChange={(e) => setFormData({...formData, class: e.target.value})} className="w-full mb-2 p-2 border rounded" required />
              <input type="text" placeholder="Section" value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} className="w-full mb-2 p-2 border rounded" required />
              <input type="text" placeholder="Academic Year" value={formData.academicYear} onChange={(e) => setFormData({...formData, academicYear: e.target.value})} className="w-full mb-2 p-2 border rounded" required />
              <input type="number" placeholder="Tuition Fee" value={formData.fees.tuition} onChange={(e) => setFormData({...formData, fees: {...formData.fees, tuition: Number(e.target.value)}})} className="w-full mb-2 p-2 border rounded" />
              <input type="number" placeholder="Transport Fee" value={formData.fees.transport} onChange={(e) => setFormData({...formData, fees: {...formData.fees, transport: Number(e.target.value)}})} className="w-full mb-2 p-2 border rounded" />
              <input type="number" placeholder="Library Fee" value={formData.fees.library} onChange={(e) => setFormData({...formData, fees: {...formData.fees, library: Number(e.target.value)}})} className="w-full mb-2 p-2 border rounded" />
              <input type="number" placeholder="Sports Fee" value={formData.fees.sports} onChange={(e) => setFormData({...formData, fees: {...formData.fees, sports: Number(e.target.value)}})} className="w-full mb-2 p-2 border rounded" />
              <input type="number" placeholder="Exam Fee" value={formData.fees.exam} onChange={(e) => setFormData({...formData, fees: {...formData.fees, exam: Number(e.target.value)}})} className="w-full mb-2 p-2 border rounded" />
              <input type="number" placeholder="Other Fee" value={formData.fees.other} onChange={(e) => setFormData({...formData, fees: {...formData.fees, other: Number(e.target.value)}})} className="w-full mb-2 p-2 border rounded" />
              <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full mb-4 p-2 border rounded" required />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <form onSubmit={handlePaymentSubmit}>
              <select value={paymentData.student} onChange={(e) => setPaymentData({...paymentData, student: e.target.value})} className="w-full mb-2 p-2 border rounded" required>
                <option value="">Select Student</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.name} {s.lastname} - {s.rollNumber}</option>)}
              </select>
              <input type="number" placeholder="Amount" value={paymentData.amount} onChange={(e) => setPaymentData({...paymentData, amount: Number(e.target.value)})} className="w-full mb-2 p-2 border rounded" required />
              <select value={paymentData.paymentMethod} onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})} className="w-full mb-2 p-2 border rounded">
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Card</option>
              </select>
              <input type="text" placeholder="Transaction ID (optional)" value={paymentData.transactionId} onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})} className="w-full mb-2 p-2 border rounded" />
              <textarea placeholder="Remarks" value={paymentData.remarks} onChange={(e) => setPaymentData({...paymentData, remarks: e.target.value})} className="w-full mb-4 p-2 border rounded"></textarea>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Record</button>
                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
