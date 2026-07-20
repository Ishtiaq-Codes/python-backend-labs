import { expect } from "chai";
import hre from "hardhat";

describe("AttendanceChain", function () {
  let attendanceChain;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    
    const AttendanceChain = await hre.ethers.getContractFactory("AttendanceChain");
    attendanceChain = await AttendanceChain.deploy();
    // In ethers v5 + hardhat-toolbox v2, deployed() is used
    await attendanceChain.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await attendanceChain.owner()).to.equal(owner.address);
    });
  });

  describe("Attendance", function () {
    it("Should allow the owner to mark attendance", async function () {
      await expect(attendanceChain.markAttendance("S123", "Alice", "Math", true))
        .to.emit(attendanceChain, "AttendanceMarked")
        .withArgs("S123", "Alice", "Math", (anyValue) => true, true, owner.address);

      const records = await attendanceChain.getAttendance("S123");
      expect(records.length).to.equal(1);
      expect(records[0].studentName).to.equal("Alice");
      expect(records[0].present).to.equal(true);
    });

    it("Should not allow non-owners to mark attendance", async function () {
      await expect(
        attendanceChain.connect(addr1).markAttendance("S123", "Alice", "Math", true)
      ).to.be.revertedWithCustomError(attendanceChain, "OwnableUnauthorizedAccount");
    });

    it("Should correctly count attendance records", async function () {
      await attendanceChain.markAttendance("S123", "Alice", "Math", true);
      await attendanceChain.markAttendance("S123", "Alice", "Science", false);
      
      const count = await attendanceChain.getAttendanceCount("S123");
      expect(count).to.equal(2);
    });
  });
});
