import { useState, useEffect } from 'react';
import { feeAPI } from '../../../services/api';
import { toast } from 'react-toastify';

const StudentFees = () => {
  const [payments, setPayments] = useState([]);
  const [feeStructure, setFeeStructure] = useState(null);
  const [totalPaid, setTotalPaid] = useState(0);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    loadFeeData();
  }, []);

  const loadFeeData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const studentId = user._id;
      
      const paymentsRes = await feeAPI.getStudentPayments(studentId);
      setPayments(paymentsRes.data || []);
      
      const total = (paymentsRes.data || []).reduce((sum, p) => sum + p.amount, 0);
      setTotalPaid(total);

      const feeRes = await feeAPI.getFeeByClassSection(user.class, user.section);
      setFeeStructure(feeRes.data);
      
      if (feeRes.data) {
        setPending(feeRes.data.totalAmount - total);
      }
    } catch (error) {
      toast.error('Failed to load fee data');
    }
  };

  const downloadReceipt = async (paymentId) => {
    try {
      const res = await feeAPI.getReceipt(paymentId);
      toast.success('Receipt data loaded');
      console.log(res.data);
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">My Fees</h1>

      {feeStructure && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Fee Structure</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><span className="font-semibold">Tuition:</span> ₹{feeStructure.fees.tuition}</div>
            <div><span className="font-semibold">Transport:</span> ₹{feeStructure.fees.transport}</div>
            <div><span className="font-semibold">Library:</span> ₹{feeStructure.fees.library}</div>
            <div><span className="font-semibold">Sports:</span> ₹{feeStructure.fees.sports}</div>
            <div><span className="font-semibold">Exam:</span> ₹{feeStructure.fees.exam}</div>
            <div><span className="font-semibold">Other:</span> ₹{feeStructure.fees.other}</div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-lg"><span className="font-bold">Total Fee:</span> ₹{feeStructure.totalAmount}</div>
            <div className="text-lg text-green-600"><span className="font-bold">Paid:</span> ₹{totalPaid}</div>
            <div className="text-lg text-red-600"><span className="font-bold">Pending:</span> ₹{pending}</div>
            <div className="text-sm text-gray-600 mt-2">Due Date: {new Date(feeStructure.dueDate).toLocaleDateString()}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow">
        <h2 className="text-xl font-bold p-4 border-b">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Receipt No</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Method</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment._id} className="border-t">
                  <td className="p-3">{payment.receiptNumber}</td>
                  <td className="p-3">₹{payment.amount}</td>
                  <td className="p-3">{payment.paymentMethod}</td>
                  <td className="p-3">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button onClick={() => downloadReceipt(payment._id)} className="text-blue-600 hover:underline">View Receipt</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentFees;
