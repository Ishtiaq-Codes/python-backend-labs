import React, { useState } from 'react';
import { Contract } from 'ethers';
import { Search, History, Calendar, BookOpen, Check, X, Loader2 } from 'lucide-react';

interface StudentVerificationProps {
  contract: Contract | null;
}

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  subject: string;
  date: number;
  present: boolean;
  teacherWallet: string;
}

export const StudentVerification: React.FC<StudentVerificationProps> = ({ contract }) => {
  const [searchId, setSearchId] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !searchId.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      
      const data = await contract.getAttendance(searchId);
      
      // Parse the proxy array returned by ethers v6
      const parsedRecords = data.map((record: any) => ({
        studentId: record.studentId,
        studentName: record.studentName,
        subject: record.subject,
        date: Number(record.date),
        present: record.present,
        teacherWallet: record.teacherWallet
      }));

      // Sort by newest first
      parsedRecords.sort((a: AttendanceRecord, b: AttendanceRecord) => b.date - a.date);
      setRecords(parsedRecords);

    } catch (err) {
      console.error("Failed to fetch records", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Verification Portal</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enter your Student ID to retrieve your attendance records directly from the Ethereum blockchain.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Student ID (e.g. S1001)"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !contract}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      {searched && !loading && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-gray-700 font-medium mb-4">
            <History className="w-5 h-5" />
            <h3>Found {records.length} Records</h3>
          </div>

          {records.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
              No attendance records found for ID "{searchId}".
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {records.map((record, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{record.studentName}</h4>
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">ID: {record.studentId}</span>
                    </div>
                    
                    {record.present ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Check className="w-4 h-4" /> Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                        <X className="w-4 h-4" /> Absent
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span>{record.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(record.date)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-mono truncate" title={record.teacherWallet}>
                      Signed by: {record.teacherWallet}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
