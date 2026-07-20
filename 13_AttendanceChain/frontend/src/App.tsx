import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ShieldCheck, Wallet } from 'lucide-react';
import { useWeb3 } from './hooks/useWeb3';
import { Home } from './components/Home';
import { TeacherPanel } from './components/TeacherPanel';
import { StudentVerification } from './components/StudentVerification';

function App() {
  const { account, contract, connectWallet, error, loading, isTeacher } = useWeb3();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        
        {/* Navigation Bar */}
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
                <span className="font-bold text-xl tracking-tight">AttendanceChain</span>
              </Link>
              
              <div className="flex items-center gap-6">
                <Link to="/student" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                  Verify Record
                </Link>
                
                {account ? (
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium font-mono text-gray-700">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                    {isTeacher && <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">Teacher</span>}
                  </div>
                ) : (
                  <button 
                    onClick={connectWallet}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-full font-medium transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 text-center border-b border-red-100 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Loading State for initial read-only setup */}
        {loading && !contract && !error && (
          <div className="bg-blue-50 text-blue-600 px-4 py-2 text-center border-b border-blue-100 text-sm">
            Initializing connection to blockchain network...
          </div>
        )}

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home connectWallet={connectWallet} account={account} isTeacher={isTeacher} />} />
            <Route path="/teacher" element={<TeacherPanel contract={contract} isTeacher={isTeacher} />} />
            <Route path="/student" element={<StudentVerification contract={contract} />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;
