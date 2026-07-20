import React, { useEffect, useState } from 'react';
import { Activity, ArrowRight, ArrowDownLeft, Plus, Flame } from 'lucide-react';
import { Contract, ethers } from 'ethers';

interface Props {
  contract: Contract | null;
  account: string | null;
}

interface EventLog {
  type: 'Transfer' | 'Mint' | 'Burn';
  hash: string;
  from: string;
  to: string;
  amount: string;
  blockNumber: number;
}

export const TransactionHistory: React.FC<Props> = ({ contract, account }) => {
  const [events, setEvents] = useState<EventLog[]>([]);

  useEffect(() => {
    if (!contract) return;

    const fetchPastEvents = async () => {
      try {
        const transferFilter = contract.filters.Transfer();
        const mintFilter = contract.filters.TokenMinted();
        const burnFilter = contract.filters.TokenBurned();

        // Fetch last 1000 blocks for simplicity
        const currentBlock = await contract.runner?.provider?.getBlockNumber();
        const fromBlock = currentBlock ? Math.max(0, currentBlock - 1000) : 0;

        const [transfers, mints, burns] = await Promise.all([
          contract.queryFilter(transferFilter, fromBlock, 'latest'),
          contract.queryFilter(mintFilter, fromBlock, 'latest'),
          contract.queryFilter(burnFilter, fromBlock, 'latest')
        ]);

        const allLogs: EventLog[] = [];

        transfers.forEach((event: any) => {
          allLogs.push({
            type: 'Transfer',
            hash: event.transactionHash,
            from: event.args[0],
            to: event.args[1],
            amount: ethers.formatUnits(event.args[2], 18),
            blockNumber: event.blockNumber
          });
        });

        mints.forEach((event: any) => {
          allLogs.push({
            type: 'Mint',
            hash: event.transactionHash,
            from: 'Contract',
            to: event.args[0],
            amount: ethers.formatUnits(event.args[1], 18),
            blockNumber: event.blockNumber
          });
        });

        burns.forEach((event: any) => {
          allLogs.push({
            type: 'Burn',
            hash: event.transactionHash,
            from: event.args[0],
            to: '0x0000000000000000000000000000000000000000',
            amount: ethers.formatUnits(event.args[1], 18),
            blockNumber: event.blockNumber
          });
        });

        allLogs.sort((a, b) => b.blockNumber - a.blockNumber);
        setEvents(allLogs.slice(0, 10)); // keep only last 10
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    fetchPastEvents();

    // Setup listeners
    const onTransfer = (from: string, to: string, amount: bigint, event: any) => {
      setEvents(prev => [({
        type: 'Transfer',
        hash: event.log.transactionHash,
        from,
        to,
        amount: ethers.formatUnits(amount, 18),
        blockNumber: event.log.blockNumber
      } as EventLog), ...prev].slice(0, 10));
    };

    const onMint = (to: string, amount: bigint, event: any) => {
      setEvents(prev => [({
        type: 'Mint',
        hash: event.log.transactionHash,
        from: 'Contract',
        to,
        amount: ethers.formatUnits(amount, 18),
        blockNumber: event.log.blockNumber
      } as EventLog), ...prev].slice(0, 10));
    };

    const onBurn = (from: string, amount: bigint, event: any) => {
      setEvents(prev => [({
        type: 'Burn',
        hash: event.log.transactionHash,
        from,
        to: '0x0000000000000000000000000000000000000000',
        amount: ethers.formatUnits(amount, 18),
        blockNumber: event.log.blockNumber
      } as EventLog), ...prev].slice(0, 10));
    };

    contract.on('Transfer', onTransfer);
    contract.on('TokenMinted', onMint);
    contract.on('TokenBurned', onBurn);

    return () => {
      contract.off('Transfer', onTransfer);
      contract.off('TokenMinted', onMint);
      contract.off('TokenBurned', onBurn);
    };
  }, [contract]);

  if (!contract) return null;

  return (
    <div className="glass-panel p-6 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-primary" size={20} />
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-textSecondary border-b border-white/10">
            <tr>
              <th className="pb-3 px-4">Type</th>
              <th className="pb-3 px-4">Amount</th>
              <th className="pb-3 px-4">From</th>
              <th className="pb-3 px-4">To</th>
              <th className="pb-3 px-4">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-textSecondary">
                  No recent transactions found on this network.
                </td>
              </tr>
            ) : (
              events.map((tx, i) => (
                <tr key={`${tx.hash}-${i}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-1.5">
                      {tx.type === 'Mint' && <Plus size={14} className="text-secondary" />}
                      {tx.type === 'Burn' && <Flame size={14} className="text-red-400" />}
                      {tx.type === 'Transfer' && (
                        tx.to.toLowerCase() === account?.toLowerCase() ? 
                          <ArrowDownLeft size={14} className="text-secondary" /> : 
                          <ArrowRight size={14} className="text-blue-400" />
                      )}
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium">{Number(tx.amount).toFixed(2)} TFT</td>
                  <td className="py-4 px-4 font-mono text-textSecondary text-xs">
                    {tx.from === 'Contract' ? 'Contract' : `${tx.from.substring(0, 6)}...${tx.from.substring(tx.from.length - 4)}`}
                  </td>
                  <td className="py-4 px-4 font-mono text-textSecondary text-xs">
                    {tx.to === '0x0000000000000000000000000000000000000000' ? 'Zero Address' : `${tx.to.substring(0, 6)}...${tx.to.substring(tx.to.length - 4)}`}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-primary hover:underline">
                    {tx.hash.substring(0, 10)}...
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
