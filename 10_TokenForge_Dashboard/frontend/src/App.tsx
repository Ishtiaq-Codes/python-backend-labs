import { useWeb3 } from './hooks/useWeb3';
import { WalletConnect } from './components/WalletConnect';
import { Dashboard } from './components/Dashboard';
import { TransferTokens } from './components/TransferTokens';
import { MintTokens } from './components/MintTokens';
import { BurnTokens } from './components/BurnTokens';
import { TransactionHistory } from './components/TransactionHistory';
import { Hexagon } from 'lucide-react';

function App() {
  const web3 = useWeb3();

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary selection:text-white pb-20">
      {/* Background Gradients */}
      <div className="fixed top-0 -left-1/4 w-1/2 h-1/2 bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 -right-1/4 w-1/2 h-1/2 bg-secondary/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Hexagon className="text-white" size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">TokenForge</h1>
              <p className="text-xs text-textSecondary uppercase tracking-widest">ERC20 Management</p>
            </div>
          </div>
          <WalletConnect web3={web3} />
        </header>

        {/* Main Content */}
        {!web3.account ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5 relative">
              <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse-slow"></div>
              <Hexagon className="text-textSecondary" size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome to TokenForge</h2>
            <p className="text-textSecondary max-w-md mx-auto mb-8 text-lg">
              Connect your Web3 wallet to manage your tokens, view balances, and interact with the TokenForge smart contract on the blockchain.
            </p>
            <button onClick={web3.connectWallet} className="btn-primary text-lg px-8 py-3">
              Connect MetaMask
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <Dashboard balance={web3.balance} totalSupply={web3.totalSupply} symbol="TFT" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <TransferTokens contract={web3.contract} refreshData={web3.refreshData} />
                {web3.isOwner && (
                  <MintTokens contract={web3.contract} refreshData={web3.refreshData} />
                )}
              </div>
              <div>
                <BurnTokens contract={web3.contract} refreshData={web3.refreshData} balance={web3.balance} />
                <TransactionHistory contract={web3.contract} account={web3.account} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
