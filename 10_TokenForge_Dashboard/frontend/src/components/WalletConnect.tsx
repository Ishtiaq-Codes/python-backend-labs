import React from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import type { Web3State } from '../hooks/useWeb3';

interface Props {
  web3: Pick<Web3State, 'account' | 'ethBalance' | 'error' | 'isLoading'> & { connectWallet: () => void };
}

export const WalletConnect: React.FC<Props> = ({ web3 }) => {
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="flex flex-col items-end">
      {web3.error && (
        <div className="flex items-center text-red-400 text-sm mb-2">
          <AlertCircle size={16} className="mr-1" />
          {web3.error}
        </div>
      )}
      
      {!web3.account ? (
        <button 
          onClick={web3.connectWallet}
          disabled={web3.isLoading}
          className="btn-primary flex items-center gap-2"
        >
          <Wallet size={20} />
          {web3.isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="flex items-center gap-4 glass-panel px-4 py-2">
          <div className="flex flex-col text-right">
            <span className="text-xs text-textSecondary">ETH Balance</span>
            <span className="font-medium">{Number(web3.ethBalance).toFixed(4)} ETH</span>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
              <Wallet size={16} className="text-primary" />
            </div>
            <span className="font-mono">{formatAddress(web3.account)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
