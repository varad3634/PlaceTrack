/**
 * Deterministic Eligibility Engine for PlaceTrack
 * Evaluates student profiles against placement drive criteria.
 */

export const checkStudentEligibility = (student, drive) => {
  const reasons = [];

  if (!drive) {
    return {
      isEligible: false,
      reasons: ['Placement drive details not found.'],
    };
  }

  if (!student) {
    return {
      isEligible: false,
      reasons: ['Student academic profile not found.'],
    };
  }

  // 1. Check drive status
  if (drive.status !== 'Published') {
    reasons.push(
      `Drive is currently '${drive.status}' and not open for applications.`
    );
  }

  // 2. Check application deadline
  const now = new Date();
  const deadline = new Date(drive.applicationDeadline);
  if (now > deadline) {
    reasons.push(
      `Application deadline passed on ${deadline.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}.`
    );
  }

  // 3. Check CGPA requirement
  const studentCgpa = Number(student.cgpa) || 0;
  const minCgpa = Number(drive.minCgpa) || 0;
  if (studentCgpa < minCgpa) {
    reasons.push(
      `CGPA (${studentCgpa.toFixed(2)}) is below the required minimum (${minCgpa.toFixed(2)}).`
    );
  }

  // 4. Check active backlogs requirement
  const studentBacklogs = Number(student.activeBacklogs) || 0;
  const maxAllowedBacklogs = Number(drive.maxBacklogs) || 0;
  if (studentBacklogs > maxAllowedBacklogs) {
    reasons.push(
      `Active backlogs (${studentBacklogs}) exceed maximum permitted (${maxAllowedBacklogs}).`
    );
  }

  // 5. Check department eligibility
  const eligibleDepartments = Array.isArray(drive.eligibleDepartments)
    ? drive.eligibleDepartments
    : [];
  if (
    eligibleDepartments.length > 0 &&
    !eligibleDepartments.includes(student.department)
  ) {
    reasons.push(
      `Department '${student.department}' is not among eligible departments: [${eligibleDepartments.join(', ')}].`
    );
  }

  // 6. Check graduation year requirement
  const graduationYears = Array.isArray(drive.graduationYears)
    ? drive.graduationYears.map(Number)
    : [];
  const studentGradYear = Number(student.graduationYear);
  if (
    graduationYears.length > 0 &&
    !graduationYears.includes(studentGradYear)
  ) {
    reasons.push(
      `Graduation year (${studentGradYear}) is not eligible. Required batch: [${graduationYears.join(', ')}].`
    );
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
};

/**
 * Filter a list of students into eligible and ineligible cohorts for a drive
 */
export const evaluateStudentsForDrive = (students = [], drive) => {
  const eligible = [];
  const ineligible = [];

  for (const student of students) {
    const result = checkStudentEligibility(student, drive);
    if (result.isEligible) {
      eligible.push({ student, ...result });
    } else {
      ineligible.push({ student, ...result });
    }
  }

  return {
    totalEvaluated: students.length,
    eligibleCount: eligible.length,
    ineligibleCount: ineligible.length,
    eligible,
    ineligible,
  };
};
