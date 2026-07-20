// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AttendanceChain
 * @dev A simple smart contract to record student attendance on the blockchain.
 * Only the contract owner (Teacher) can mark attendance.
 * Anyone can read the attendance records (Students).
 */
contract AttendanceChain is Ownable {

    struct Attendance {
        string studentId;
        string studentName;
        string subject;
        uint256 date;
        bool present;
        address teacherWallet;
    }

    // Mapping from Student ID to an array of their Attendance records
    mapping(string => Attendance[]) private studentAttendance;

    // Event emitted when a teacher marks attendance
    event AttendanceMarked(
        string indexed studentId,
        string studentName,
        string subject,
        uint256 date,
        bool present,
        address teacherWallet
    );

    /**
     * @dev Constructor sets the deployer as the initial owner.
     * In this project, the owner is considered the Teacher.
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Marks attendance for a student. Only the owner can call this function.
     * @param _studentId The unique ID of the student.
     * @param _studentName The name of the student.
     * @param _subject The subject or class name.
     * @param _present Boolean indicating if the student was present.
     */
    function markAttendance(
        string memory _studentId,
        string memory _studentName,
        string memory _subject,
        bool _present
    ) public onlyOwner {
        Attendance memory newRecord = Attendance({
            studentId: _studentId,
            studentName: _studentName,
            subject: _subject,
            date: block.timestamp,
            present: _present,
            teacherWallet: msg.sender
        });

        studentAttendance[_studentId].push(newRecord);

        emit AttendanceMarked(
            _studentId,
            _studentName,
            _subject,
            block.timestamp,
            _present,
            msg.sender
        );
    }

    /**
     * @dev Retrieves all attendance records for a specific student.
     * @param _studentId The unique ID of the student.
     * @return An array of Attendance structs.
     */
    function getAttendance(string memory _studentId) public view returns (Attendance[] memory) {
        return studentAttendance[_studentId];
    }

    /**
     * @dev Retrieves the total count of attendance records for a specific student.
     * @param _studentId The unique ID of the student.
     * @return The number of records.
     */
    function getAttendanceCount(string memory _studentId) public view returns (uint256) {
        return studentAttendance[_studentId].length;
    }
}
