import React from 'react';
import { BookCheck, User, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomeProps {
  connectWallet: () => void;
  account: string | null;
  isTeacher: boolean;
}

export const Home: React.FC<HomeProps> = ({ connectWallet, account, isTeacher }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <BookCheck className="w-16 h-16 text-blue-600" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AttendanceChain
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
          A tamper-resistant blockchain attendance verification system. 
          Teachers can securely record attendance, and students can verify their records immutably.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          
          {/* Teacher Section */}
          <div className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors bg-gray-50">
            <User className="w-8 h-8 text-blue-600 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold mb-2">For Teachers</h2>
            <p className="text-sm text-gray-500 mb-6">Connect your wallet to mark and record attendance securely on the blockchain.</p>
            
            {account ? (
              <div className="space-y-4">
                <div className="bg-green-100 text-green-800 text-sm py-2 px-4 rounded-lg break-all">
                  Connected: {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                {isTeacher ? (
                  <Link to="/teacher" className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Go to Teacher Panel
                  </Link>
                ) : (
                  <div className="text-red-500 text-sm font-medium">You are not the authorized teacher.</div>
                )}
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Connect MetaMask
              </button>
            )}
          </div>

          {/* Student Section */}
          <div className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-colors bg-gray-50">
            <Search className="w-8 h-8 text-indigo-600 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold mb-2">For Students</h2>
            <p className="text-sm text-gray-500 mb-6">Search using your Student ID to view your immutable attendance history. No login required.</p>
            
            <Link to="/student" className="inline-block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Verify Attendance
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
