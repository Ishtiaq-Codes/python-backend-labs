from fastapi import FastAPI, HTTPException
from web3 import Web3

app = FastAPI(title="FastAPI Web3 Bridge")

# Connect to the local Hardhat Node (or Infura/Alchemy)
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI Web3 Bridge"}

@app.get("/network-status")
def get_network_status():
    if w3.is_connected():
        return {
            "status": "Connected",
            "latest_block": w3.eth.block_number,
            "gas_price_gwei": w3.from_wei(w3.eth.gas_price, 'gwei')
        }
    raise HTTPException(status_code=503, detail="Not connected to Ethereum node")

@app.get("/balance/{address}")
def get_balance(address: str):
    if not w3.is_address(address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    balance_wei = w3.eth.get_balance(address)
    balance_eth = w3.from_wei(balance_wei, 'ether')
    
    return {
        "address": address,
        "balance_eth": float(balance_eth)
    }

# To run: uvicorn main:app --reload
