import React from 'react';
import { Coins, Layers } from 'lucide-react';

interface Props {
  balance: string;
  totalSupply: string;
  symbol?: string;
}

export const Dashboard: React.FC<Props> = ({ balance, totalSupply, symbol = "TFT" }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Total Supply Card */}
      <div className="glass-panel p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Layers size={80} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-textSecondary mb-2">
            <Layers size={18} />
            <h3 className="font-medium">Total Supply</h3>
          </div>
          <div className="text-4xl font-bold text-white mb-1">
            {Number(totalSupply).toLocaleString()} <span className="text-xl text-primary">{symbol}</span>
          </div>
          <p className="text-sm text-textSecondary">Tokens currently in existence</p>
        </div>
      </div>

      {/* User Balance Card */}
      <div className="glass-panel p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Coins size={80} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-textSecondary mb-2">
            <Coins size={18} />
            <h3 className="font-medium">Your Balance</h3>
          </div>
          <div className="text-4xl font-bold text-white mb-1">
            {Number(balance).toLocaleString()} <span className="text-xl text-secondary">{symbol}</span>
          </div>
          <p className="text-sm text-textSecondary">Tokens available in your wallet</p>
        </div>
      </div>
    </div>
  );
};
