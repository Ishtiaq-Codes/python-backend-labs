import { useState, useEffect, useCallback } from 'react';
import { ethers, BrowserProvider, Contract } from 'ethers';
import TokenForgeABI from '../contracts/TokenForge.json';
import ContractAddress from '../contracts/contract-address.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Ensure you replace this with Sepolia chain id in production
const TARGET_CHAIN_ID = 11155111n; // Sepolia
const LOCAL_CHAIN_ID = 31337n; // Hardhat

export interface Web3State {
  provider: BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  contract: Contract | null;
  isOwner: boolean;
  balance: string;
  ethBalance: string;
  totalSupply: string;
  chainId: bigint | null;
  error: string | null;
  isLoading: boolean;
}

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    provider: null,
    signer: null,
    account: null,
    contract: null,
    isOwner: false,
    balance: '0',
    ethBalance: '0',
    totalSupply: '0',
    chainId: null,
    error: null,
    isLoading: true,
  });

  const connectWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this application.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      // Optionally restrict to Sepolia or Hardhat local network
      if (network.chainId !== TARGET_CHAIN_ID && network.chainId !== LOCAL_CHAIN_ID) {
        throw new Error('Wrong network detected. Please connect to Sepolia or Local Hardhat network.');
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      const account = accounts[0];
      const signer = await provider.getSigner();

      // Ensure contract-address exists (might fail if not deployed yet)
      if (!ContractAddress.TokenForge) {
        throw new Error('Contract address not found. Did you deploy the contract?');
      }

      const contract = new ethers.Contract(
        ContractAddress.TokenForge,
        TokenForgeABI.abi,
        signer
      );

      // Fetch initial data
      const owner = await contract.owner();
      const isOwner = owner.toLowerCase() === account.toLowerCase();
      
      const balanceWei = await contract.balanceOf(account);
      const balance = ethers.formatUnits(balanceWei, 18);
      
      const totalSupplyWei = await contract.totalSupply();
      const totalSupply = ethers.formatUnits(totalSupplyWei, 18);

      const ethBalanceWei = await provider.getBalance(account);
      const ethBalance = ethers.formatEther(ethBalanceWei);

      setState({
        provider,
        signer,
        account,
        contract,
        isOwner,
        balance,
        ethBalance,
        totalSupply,
        chainId: network.chainId,
        error: null,
        isLoading: false,
      });

    } catch (err: any) {
      console.error("Connection error:", err);
      setState(prev => ({ 
        ...prev, 
        error: err.message || 'Failed to connect wallet', 
        isLoading: false 
      }));
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!state.contract || !state.account || !state.provider) return;
    
    try {
      const balanceWei = await state.contract.balanceOf(state.account);
      const balance = ethers.formatUnits(balanceWei, 18);
      
      const totalSupplyWei = await state.contract.totalSupply();
      const totalSupply = ethers.formatUnits(totalSupplyWei, 18);

      const ethBalanceWei = await state.provider.getBalance(state.account);
      const ethBalance = ethers.formatEther(ethBalanceWei);

      setState(prev => ({
        ...prev,
        balance,
        ethBalance,
        totalSupply
      }));
    } catch (err) {
      console.error("Failed to refresh data", err);
    }
  }, [state.contract, state.account, state.provider]);

  // Listen for account/network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // Disconnected
          setState(prev => ({ ...prev, account: null, contract: null }));
        } else {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [connectWallet]);

  return {
    ...state,
    connectWallet,
    refreshData
  };
}
