import fs from "fs";
import path from "path";
import hre from "hardhat";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { ethers, artifacts } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const TokenForge = await ethers.getContractFactory("TokenForge");
  const token = await TokenForge.deploy();

  await token.waitForDeployment();
  const address = await token.getAddress();
  
  console.log("TokenForge deployed to:", address);

  // Save the contract's artifacts and address to the frontend directory
  saveFrontendFiles(address);
}

function saveFrontendFiles(contractAddress) {
  const frontendDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");

  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(frontendDir, "contract-address.json"),
    JSON.stringify({ TokenForge: contractAddress }, undefined, 2)
  );

  const TokenForgeArtifact = artifacts.readArtifactSync("TokenForge");

  fs.writeFileSync(
    path.join(frontendDir, "TokenForge.json"),
    JSON.stringify(TokenForgeArtifact, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
