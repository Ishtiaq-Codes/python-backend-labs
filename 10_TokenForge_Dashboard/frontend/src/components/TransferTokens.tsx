import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Contract, ethers } from 'ethers';

interface Props {
  contract: Contract | null;
  refreshData: () => void;
}

export const TransferTokens: React.FC<Props> = ({ contract, refreshData }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !recipient || !amount) return;

    try {
      setStatus('pending');
      setMessage('Transaction pending... Please confirm in your wallet.');
      
      const amountWei = ethers.parseUnits(amount, 18);
      const tx = await contract.transfer(recipient, amountWei);
      
      setMessage('Transaction submitted! Waiting for confirmation...');
      await tx.wait();
      
      setStatus('success');
      setMessage(`Successfully transferred ${amount} TFT to ${recipient.substring(0,6)}...`);
      setRecipient('');
      setAmount('');
      refreshData();
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
      
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage(err.shortMessage || err.message || 'Transaction failed');
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <Send className="text-primary" size={20} />
        <h2 className="text-xl font-semibold">Transfer Tokens</h2>
      </div>
      
      <form onSubmit={handleTransfer} className="space-y-4">
        <div>
          <label className="block text-sm text-textSecondary mb-1">Recipient Address</label>
          <input 
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="input-field"
            required
            disabled={status === 'pending' || !contract}
          />
        </div>
        
        <div>
          <label className="block text-sm text-textSecondary mb-1">Amount (TFT)</label>
          <input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="any"
            min="0"
            className="input-field"
            required
            disabled={status === 'pending' || !contract}
          />
        </div>

        <button 
          type="submit" 
          disabled={status === 'pending' || !contract}
          className="btn-primary w-full flex justify-center items-center gap-2 mt-4"
        >
          {status === 'pending' ? (
            <><Loader2 className="animate-spin" size={18} /> Processing...</>
          ) : (
            <><Send size={18} /> Send Tokens</>
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
