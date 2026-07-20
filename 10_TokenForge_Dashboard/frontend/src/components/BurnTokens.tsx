import React, { useState } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import { Contract, ethers } from 'ethers';

interface Props {
  contract: Contract | null;
  refreshData: () => void;
  balance: string;
}

export const BurnTokens: React.FC<Props> = ({ contract, refreshData, balance }) => {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !amount) return;

    try {
      setStatus('pending');
      setMessage('Transaction pending... Please confirm in your wallet.');
      
      const amountWei = ethers.parseUnits(amount, 18);
      const tx = await contract.burn(amountWei);
      
      setMessage('Transaction submitted! Waiting for confirmation...');
      await tx.wait();
      
      setStatus('success');
      setMessage(`Successfully burned ${amount} TFT.`);
      setAmount('');
      refreshData();
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
      
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage(err.shortMessage || err.message || 'Burning failed');
    }
  };

  const setMaxAmount = () => {
    setAmount(balance);
  };

  return (
    <div className="glass-panel p-6 border-l-4 border-l-red-500">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="text-red-500" size={20} />
        <h2 className="text-xl font-semibold">Burn Tokens</h2>
      </div>
      
      <form onSubmit={handleBurn} className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm text-textSecondary">Amount (TFT)</label>
            <button 
              type="button" 
              onClick={setMaxAmount}
              className="text-xs text-primary hover:underline"
            >
              Max: {Number(balance).toFixed(2)}
            </button>
          </div>
          <input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="any"
            min="0"
            max={balance}
            className="input-field focus:ring-red-500 focus:border-red-500"
            required
            disabled={status === 'pending' || !contract}
          />
        </div>

        <button 
          type="submit" 
          disabled={status === 'pending' || !contract}
          className="btn-danger w-full flex justify-center items-center gap-2 mt-4"
        >
          {status === 'pending' ? (
            <><Loader2 className="animate-spin" size={18} /> Processing...</>
          ) : (
            <><Flame size={18} /> Burn Tokens</>
          )}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm border ${
          status === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
          status === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
          'bg-blue-500/10 border-blue-500/20 text-blue-400'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};
