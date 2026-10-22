import { describe, it, expect } from 'vitest';
import {
  checkStudentEligibility,
  evaluateStudentsForDrive,
} from '../src/services/eligibilityService.js';

describe('PlaceTrack Deterministic Eligibility Engine Tests', () => {
  const mockDrive = {
    _id: 'drive123',
    jobTitle: 'Software Engineer',
    status: 'Published',
    applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
    minCgpa: 7.5,
    maxBacklogs: 0,
    eligibleDepartments: ['Computer Engineering', 'Information Technology'],
    graduationYears: [2025],
  };

  const eligibleStudent = {
    prn: 'PRN2024001',
    department: 'Computer Engineering',
    graduationYear: 2025,
    cgpa: 8.5,
    activeBacklogs: 0,
  };

  it('should qualify student when all criteria are satisfied', () => {
    const result = checkStudentEligibility(eligibleStudent, mockDrive);
    expect(result.isEligible).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it('should disqualify student when CGPA is below minimum required', () => {
    const lowCgpaStudent = { ...eligibleStudent, cgpa: 7.1 };
    const result = checkStudentEligibility(lowCgpaStudent, mockDrive);
    expect(result.isEligible).toBe(false);
    expect(result.reasons.some((r) => r.includes('CGPA'))).toBe(true);
  });

  it('should disqualify student when active backlogs exceed maximum permitted', () => {
    const backlogStudent = { ...eligibleStudent, activeBacklogs: 1 };
    const result = checkStudentEligibility(backlogStudent, mockDrive);
    expect(result.isEligible).toBe(false);
    expect(result.reasons.some((r) => r.includes('Active backlogs'))).toBe(true);
  });

  it('should disqualify student when department is not in eligible list', () => {
    const civilStudent = { ...eligibleStudent, department: 'Civil Engineering' };
    const result = checkStudentEligibility(civilStudent, mockDrive);
    expect(result.isEligible).toBe(false);
    expect(result.reasons.some((r) => r.includes('Department'))).toBe(true);
  });

  it('should disqualify student when graduation year does not match', () => {
    const nextYearStudent = { ...eligibleStudent, graduationYear: 2026 };
    const result = checkStudentEligibility(nextYearStudent, mockDrive);
    expect(result.isEligible).toBe(false);
    expect(result.reasons.some((r) => r.includes('Graduation year'))).toBe(true);
  });

  it('should reject applications when application deadline has passed', () => {
    const expiredDrive = {
      ...mockDrive,
      applicationDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day in past
    };
    const result = checkStudentEligibility(eligibleStudent, expiredDrive);
    expect(result.isEligible).toBe(false);
    expect(result.reasons.some((r) => r.includes('deadline passed'))).toBe(true);
  });

  it('should reject applications when drive status is Draft or Closed', () => {
    const draftDrive = { ...mockDrive, status: 'Draft' };
    const result = checkStudentEligibility(eligibleStudent, draftDrive);
    expect(result.isEligible).toBe(false);
    expect(result.reasons.some((r) => r.includes('Draft'))).toBe(true);
  });

  it('should evaluate student cohorts correctly and provide breakdown', () => {
    const students = [
      eligibleStudent,
      { ...eligibleStudent, cgpa: 6.0, prn: 'PRN2024002' },
      { ...eligibleStudent, activeBacklogs: 2, prn: 'PRN2024003' },
    ];
    const evaluation = evaluateStudentsForDrive(students, mockDrive);
    expect(evaluation.totalEvaluated).toBe(3);
    expect(evaluation.eligibleCount).toBe(1);
    expect(evaluation.ineligibleCount).toBe(2);
  });
});
