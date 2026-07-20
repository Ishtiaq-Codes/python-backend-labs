import React, { useState } from 'react';
import { Contract } from 'ethers';
import { ClipboardCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface TeacherPanelProps {
  contract: Contract | null;
  isTeacher: boolean;
}

export const TeacherPanel: React.FC<TeacherPanelProps> = ({ contract, isTeacher }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    subject: '',
    present: true
  });
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    
    try {
      setStatus('pending');
      setErrorMessage('');
      setTxHash('');

      const tx = await contract.markAttendance(
        formData.studentId,
        formData.studentName,
        formData.subject,
        formData.present
      );

      const receipt = await tx.wait();
      
      setStatus('success');
      setTxHash(receipt.hash);
      
      // Reset form
      setFormData({
        studentId: '',
        studentName: '',
        subject: '',
        present: true
      });
      
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.reason || err.message || "Transaction failed");
    }
  };

  if (!isTeacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 text-red-800 p-8 rounded-xl shadow-sm text-center max-w-md border border-red-200">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p>Only the authorized teacher (contract owner) can access this panel to mark attendance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-6 text-white flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Teacher Panel</h2>
            <p className="text-blue-100 text-sm">Mark student attendance on the blockchain</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input 
                type="text" 
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                placeholder="e.g. S1001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
              <input 
                type="text" 
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                required
                placeholder="e.g. Alice Smith"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Class</label>
            <input 
              type="text" 
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="e.g. Introduction to Blockchain"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input 
              type="checkbox" 
              id="present"
              name="present"
              checked={formData.present}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="present" className="font-medium text-gray-900 cursor-pointer">
              Mark as Present
            </label>
          </div>

          <button 
            type="submit" 
            disabled={status === 'pending' || !contract}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'pending' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Recording on Blockchain...</>
            ) : (
              'Submit Attendance'
            )}
          </button>
        </form>
      </div>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800">Transaction Successful!</h3>
            <p className="text-sm text-green-700 mt-1">Attendance has been permanently recorded.</p>
            <div className="mt-2 text-xs font-mono bg-green-100 p-2 rounded text-green-800 break-all">
              Tx Hash: {txHash}
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Transaction Failed</h3>
            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
