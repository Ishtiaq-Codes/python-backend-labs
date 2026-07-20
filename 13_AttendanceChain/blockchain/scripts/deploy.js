import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Deploying AttendanceChain...");

  const AttendanceChain = await hre.ethers.getContractFactory("AttendanceChain");
  const attendanceChain = await AttendanceChain.deploy();
  await attendanceChain.deployed();

  const address = attendanceChain.address;
  console.log(`AttendanceChain deployed to: ${address}`);

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
    JSON.stringify({ AttendanceChain: contractAddress }, undefined, 2)
  );

  const AttendanceChainArtifact = hre.artifacts.readArtifactSync("AttendanceChain");

  fs.writeFileSync(
    path.join(frontendDir, "AttendanceChain.json"),
    JSON.stringify(AttendanceChainArtifact, null, 2)
  );
  
  console.log("Frontend ABI and Address updated successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
