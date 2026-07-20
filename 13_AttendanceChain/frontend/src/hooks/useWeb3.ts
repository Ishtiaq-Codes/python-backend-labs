import { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import contractAddress from '../contracts/contract-address.json';
import AttendanceChainABI from '../contracts/AttendanceChain.json';

// Global window declaration for ethers
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed!");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);

      // Connect to contract
      const signer = await provider.getSigner();
      const attendanceContract = new ethers.Contract(
        contractAddress.AttendanceChain,
        AttendanceChainABI.abi,
        signer
      );

      setContract(attendanceContract);
      
      // Fetch owner to check if connected user is the teacher
      const contractOwner = await attendanceContract.owner();
      setOwner(contractOwner.toLowerCase());
      setError(null);

    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    }
  };

  // Setup read-only contract for students (no wallet connection needed)
  useEffect(() => {
    const setupReadOnly = async () => {
      try {
        setLoading(true);
        // We use MetaMask provider if available for read-only, otherwise a default JSON RPC
        const rpcUrl = "http://127.0.0.1:8545"; // Fallback to local hardhat
        let provider;
        
        if (window.ethereum) {
            provider = new ethers.BrowserProvider(window.ethereum);
        } else {
            provider = new ethers.JsonRpcProvider(rpcUrl);
        }
        
        const readOnlyContract = new ethers.Contract(
          contractAddress.AttendanceChain,
          AttendanceChainABI.abi,
          provider
        );
        
        // Only set this if a signer contract isn't already set
        setContract(prev => prev || readOnlyContract);
        setError(null);
      } catch (err: any) {
         console.warn("Read-only setup failed, waiting for user to connect.", err);
      } finally {
        setLoading(false);
      }
    };
    
    setupReadOnly();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          connectWallet();
        } else {
          setAccount(null);
          setOwner(null);
        }
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    }
  }, []);

  return { account, contract, connectWallet, error, loading, isTeacher: account?.toLowerCase() === owner };
}
