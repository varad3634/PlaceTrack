import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../src/models/User.js';
import StudentProfile from '../src/models/StudentProfile.js';
import Company from '../src/models/Company.js';
import PlacementDrive from '../src/models/PlacementDrive.js';
import Application from '../src/models/Application.js';
import InterviewRound from '../src/models/InterviewRound.js';
import Offer from '../src/models/Offer.js';
import Notification from '../src/models/Notification.js';
import AuditLog from '../src/models/AuditLog.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

export const seedData = async () => {
  try {
    console.log('🌱 Starting PlaceTrack database seeding...');
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // Clear existing collections safely
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      StudentProfile.deleteMany(),
      Company.deleteMany(),
      PlacementDrive.deleteMany(),
      Application.deleteMany(),
      InterviewRound.deleteMany(),
      Offer.deleteMany(),
      Notification.deleteMany(),
      AuditLog.deleteMany(),
    ]);

    // 1. Create Admin and TPO users
    console.log('👤 Creating administrative users...');
    const adminUser = await User.create({
      name: 'Dr. Rajesh Deshmukh (Admin)',
      email: 'admin@placetrack.edu',
      password: 'Password@123',
      role: 'admin',
      department: 'College Administration',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    });

    const tpoUser = await User.create({
      name: 'Prof. Sunita Kulkarni (TPO)',
      email: 'tpo@placetrack.edu',
      password: 'Password@123',
      role: 'tpo',
      department: 'Training & Placement Office',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    });

    // 2. Create Student users and profiles
    console.log('🎓 Creating student accounts and academic profiles...');
    const studentsData = [
      {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@student.edu',
        password: 'Password@123',
        department: 'Computer Engineering',
        prn: 'PRN2024001',
        academicYear: 'Final Year',
        graduationYear: 2025,
        cgpa: 9.25,
        activeBacklogs: 0,
        totalBacklogs: 0,
        skills: ['React', 'Node.js', 'Python', 'Algorithms', 'System Design', 'Docker'],
        phone: '+91 9822011221',
        resumeUrl: 'https://example.com/resumes/rahul-sharma.pdf',
        linkedinUrl: 'https://linkedin.com/in/rahulsharma-demo',
        githubUrl: 'https://github.com/rahulsharma-demo',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@student.edu',
        password: 'Password@123',
        department: 'Information Technology',
        prn: 'PRN2024002',
        academicYear: 'Final Year',
        graduationYear: 2025,
        cgpa: 8.78,
        activeBacklogs: 0,
        totalBacklogs: 0,
        skills: ['Java', 'Spring Boot', 'SQL', 'TypeScript', 'AWS', 'Microservices'],
        phone: '+91 9822011222',
        resumeUrl: 'https://example.com/resumes/priya-patel.pdf',
        linkedinUrl: 'https://linkedin.com/in/priyapatel-demo',
        githubUrl: 'https://github.com/priyapatel-demo',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      },
      {
        name: 'Amit Kumar',
        email: 'amit.kumar@student.edu',
        password: 'Password@123',
        department: 'Electronics & Telecom',
        prn: 'PRN2024003',
        academicYear: 'Final Year',
        graduationYear: 2025,
        cgpa: 7.82,
        activeBacklogs: 0,
        totalBacklogs: 1,
        skills: ['C++', 'Embedded Systems', 'IoT', 'Python', 'MATLAB'],
        phone: '+91 9822011223',
        resumeUrl: 'https://example.com/resumes/amit-kumar.pdf',
        linkedinUrl: 'https://linkedin.com/in/amitkumar-demo',
        githubUrl: 'https://github.com/amitkumar-demo',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      {
        name: 'Sneha Deshmukh',
        email: 'sneha.deshmukh@student.edu',
        password: 'Password@123',
        department: 'Computer Engineering',
        prn: 'PRN2024004',
        academicYear: 'Final Year',
        graduationYear: 2025,
        cgpa: 8.45,
        activeBacklogs: 0,
        totalBacklogs: 0,
        skills: ['Machine Learning', 'PyTorch', 'Data Structures', 'Python', 'SQL'],
        phone: '+91 9822011224',
        resumeUrl: 'https://example.com/resumes/sneha-deshmukh.pdf',
        linkedinUrl: 'https://linkedin.com/in/snehadeshmukh-demo',
        githubUrl: 'https://github.com/snehadeshmukh-demo',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      {
        name: 'Rohan Verma',
        email: 'rohan.verma@student.edu',
        password: 'Password@123',
        department: 'Mechanical Engineering',
        prn: 'PRN2024005',
        academicYear: 'Final Year',
        graduationYear: 2025,
        cgpa: 6.75,
        activeBacklogs: 1,
        totalBacklogs: 2,
        skills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'Python Basics'],
        phone: '+91 9822011225',
        resumeUrl: 'https://example.com/resumes/rohan-verma.pdf',
        linkedinUrl: 'https://linkedin.com/in/rohanverma-demo',
        githubUrl: 'https://github.com/rohanverma-demo',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@student.edu',
        password: 'Password@123',
        department: 'Information Technology',
        prn: 'PRN2024006',
        academicYear: 'Final Year',
        graduationYear: 2025,
        cgpa: 5.85,
        activeBacklogs: 2,
        totalBacklogs: 3,
        skills: ['HTML', 'CSS', 'JavaScript Basics', 'SQL'],
        phone: '+91 9822011226',
        resumeUrl: 'https://example.com/resumes/ananya-iyer.pdf',
        linkedinUrl: 'https://linkedin.com/in/ananyaiyer-demo',
        githubUrl: 'https://github.com/ananyaiyer-demo',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      },
    ];

    const studentProfiles = [];
    const studentUsers = [];

    for (const s of studentsData) {
      const user = await User.create({
        name: s.name,
        email: s.email,
        password: s.password,
        role: 'student',
        department: s.department,
        avatar: s.avatar,
      });
      studentUsers.push(user);

      const profile = await StudentProfile.create({
        user: user._id,
        prn: s.prn,
        department: s.department,
        academicYear: s.academicYear,
        graduationYear: s.graduationYear,
        cgpa: s.cgpa,
        activeBacklogs: s.activeBacklogs,
        totalBacklogs: s.totalBacklogs,
        skills: s.skills,
        phone: s.phone,
        resumeUrl: s.resumeUrl,
        linkedinUrl: s.linkedinUrl,
        githubUrl: s.githubUrl,
      });
      studentProfiles.push(profile);
    }

    // 3. Create Companies
    console.log('🏢 Creating companies...');
    const companies = await Company.create([
      {
        name: 'Google India',
        industry: 'Software & IT',
        website: 'https://careers.google.com',
        hrContactName: 'Vikram Mehta',
        hrContactEmail: 'vikram.mehta@google-demo.com',
        hrContactPhone: '+91 80 6721 0000',
        description: 'Global technology leader specializing in search, cloud computing, and AI innovations.',
        location: 'Bangalore / Hyderabad',
        isActive: true,
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      },
      {
        name: 'Microsoft IDC',
        industry: 'Software & IT',
        website: 'https://careers.microsoft.com',
        hrContactName: 'Shalini Sengupta',
        hrContactEmail: 'shalini@microsoft-demo.com',
        hrContactPhone: '+91 40 6695 0000',
        description: 'World-renowned cloud, software, hardware, and developer platform pioneer.',
        location: 'Hyderabad / Noida / Bangalore',
        isActive: true,
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
      },
      {
        name: 'Amazon Web Services',
        industry: 'Cloud Computing & IT',
        website: 'https://amazon.jobs',
        hrContactName: 'Karan Mehra',
        hrContactEmail: 'karan@amazon-demo.com',
        hrContactPhone: '+91 80 4100 0000',
        description: 'Leading global cloud computing services and e-commerce platform.',
        location: 'Bangalore / Pune',
        isActive: true,
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      },
      {
        name: 'Tata Consultancy Services',
        industry: 'IT Services & Consulting',
        website: 'https://www.tcs.com',
        hrContactName: 'Ramesh Nambiar',
        hrContactEmail: 'ramesh.nambiar@tcs-demo.com',
        hrContactPhone: '+91 22 6778 9999',
        description: 'India’s premier IT services, consulting and business solutions company.',
        location: 'Mumbai / Pune / Pan India',
        isActive: true,
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
      },
      {
        name: 'Deloitte USI',
        industry: 'Management & Technology Consulting',
        website: 'https://www2.deloitte.com',
        hrContactName: 'Pooja Bhatia',
        hrContactEmail: 'pooja.bhatia@deloitte-demo.com',
        hrContactPhone: '+91 22 6185 4000',
        description: 'Global audit, consulting, advisory, and enterprise transformation leader.',
        location: 'Hyderabad / Mumbai / Gurgaon',
        isActive: true,
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg',
      },
      {
        name: 'Larsen & Toubro',
        industry: 'Core Engineering & Infrastructure',
        website: 'https://www.larsentoubro.com',
        hrContactName: 'Anil Godbole',
        hrContactEmail: 'anil.godbole@lnt-demo.com',
        hrContactPhone: '+91 22 6752 5656',
        description: 'India’s largest engineering, construction, and high-tech manufacturing conglomerate.',
        location: 'Mumbai / Hazira / Chennai',
        isActive: true,
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/L%26T.png',
      },
    ]);

    // 4. Create Placement Drives
    console.log('📢 Creating placement drives with criteria...');
    const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const pastDate = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const googleDrive = await PlacementDrive.create({
      company: companies[0]._id, // Google
      jobTitle: 'Software Development Engineer I',
      jobDescription: 'Design, develop, test, deploy, and improve large-scale distributed systems and user-facing web products.',
      jobType: 'Full-Time',
      jobLocation: 'Bangalore, India',
      salaryPackage: 32.5,
      requiredSkills: ['Data Structures', 'Algorithms', 'System Design', 'C++', 'Java', 'Python'],
      minCgpa: 8.5,
      maxBacklogs: 0,
      eligibleDepartments: ['Computer Engineering', 'Information Technology'],
      graduationYears: [2025],
      applicationOpenDate: pastDate(15),
      applicationDeadline: futureDate(10),
      driveDate: futureDate(15),
      status: 'Published',
      createdBy: tpoUser._id,
    });

    const msftDrive = await PlacementDrive.create({
      company: companies[1]._id, // Microsoft
      jobTitle: 'Software Engineer - Cloud & AI',
      jobDescription: 'Build next-generation enterprise cloud platforms and generative AI services on Azure.',
      jobType: 'Full-Time',
      jobLocation: 'Hyderabad, India',
      salaryPackage: 28.0,
      requiredSkills: ['Java', 'C#', 'Cloud Computing', 'SQL', 'Algorithms'],
      minCgpa: 8.0,
      maxBacklogs: 0,
      eligibleDepartments: ['Computer Engineering', 'Information Technology', 'Electronics & Telecom'],
      graduationYears: [2025],
      applicationOpenDate: pastDate(20),
      applicationDeadline: futureDate(8),
      driveDate: futureDate(14),
      status: 'Published',
      createdBy: tpoUser._id,
    });

    const tcsDrive = await PlacementDrive.create({
      company: companies[3]._id, // TCS
      jobTitle: 'Digital Software Developer',
      jobDescription: 'Enterprise application development, modernization, cloud migration, and automation.',
      jobType: 'Full-Time',
      jobLocation: 'Pan India',
      salaryPackage: 7.2,
      requiredSkills: ['Java', 'Python', 'Web Development', 'SQL', 'Problem Solving'],
      minCgpa: 6.5,
      maxBacklogs: 1,
      eligibleDepartments: [
        'Computer Engineering',
        'Information Technology',
        'Electronics & Telecom',
        'Mechanical Engineering',
      ],
      graduationYears: [2025],
      applicationOpenDate: pastDate(30),
      applicationDeadline: futureDate(20),
      driveDate: futureDate(25),
      status: 'Published',
      createdBy: tpoUser._id,
    });

    const deloitteDrive = await PlacementDrive.create({
      company: companies[4]._id, // Deloitte
      jobTitle: 'Technology Consulting Analyst',
      jobDescription: 'Analyze business workflows, design IT architecture, implement enterprise ERP solutions.',
      jobType: 'Full-Time',
      jobLocation: 'Mumbai / Bangalore',
      salaryPackage: 9.5,
      requiredSkills: ['Analytics', 'SQL', 'Communication', 'Python', 'Consulting'],
      minCgpa: 7.0,
      maxBacklogs: 0,
      eligibleDepartments: [
        'Computer Engineering',
        'Information Technology',
        'Electronics & Telecom',
        'Mechanical Engineering',
      ],
      graduationYears: [2025],
      applicationOpenDate: pastDate(10),
      applicationDeadline: futureDate(12),
      driveDate: futureDate(18),
      status: 'Published',
      createdBy: tpoUser._id,
    });

    const amazonDrive = await PlacementDrive.create({
      company: companies[2]._id, // Amazon
      jobTitle: 'Cloud Support Associate',
      jobDescription: 'Deep technical support for AWS global cloud architecture and networking customers.',
      jobType: 'Full-Time',
      jobLocation: 'Bangalore, India',
      salaryPackage: 21.0,
      requiredSkills: ['Networking', 'Linux', 'AWS', 'Python', 'Troubleshooting'],
      minCgpa: 7.5,
      maxBacklogs: 0,
      eligibleDepartments: ['Computer Engineering', 'Information Technology', 'Electronics & Telecom'],
      graduationYears: [2025],
      applicationOpenDate: pastDate(40),
      applicationDeadline: pastDate(5), // Expired deadline for testing!
      driveDate: pastDate(2),
      status: 'Closed',
      createdBy: tpoUser._id,
    });

    const lntDrive = await PlacementDrive.create({
      company: companies[5]._id, // L&T
      jobTitle: 'Graduate Engineer Trainee (GET)',
      jobDescription: 'Design, execution, automation, and project planning in heavy infrastructure engineering.',
      jobType: 'Full-Time',
      jobLocation: 'Hazira / Mumbai',
      salaryPackage: 6.8,
      requiredSkills: ['AutoCAD', 'SolidWorks', 'Manufacturing', 'Quality Control'],
      minCgpa: 6.5,
      maxBacklogs: 0,
      eligibleDepartments: ['Mechanical Engineering'],
      graduationYears: [2025],
      applicationOpenDate: futureDate(2),
      applicationDeadline: futureDate(25),
      driveDate: futureDate(30),
      status: 'Draft',
      createdBy: tpoUser._id,
    });

    // 5. Create Applications & Status Histories
    console.log('📝 Submitting realistic applications...');
    // Rahul applied to Google (Selected)
    const rahulGoogleApp = await Application.create({
      student: studentProfiles[0]._id, // Rahul
      user: studentUsers[0]._id,
      drive: googleDrive._id,
      company: companies[0]._id,
      appliedAt: pastDate(12),
      status: 'Selected',
      currentRound: 4,
      statusHistory: [
        { status: 'Applied', changedAt: pastDate(12), changedBy: studentUsers[0]._id, comment: 'Application submitted.' },
        { status: 'Shortlisted', changedAt: pastDate(10), changedBy: tpoUser._id, comment: 'CGPA 9.25 meets cutoff.' },
        { status: 'In Process', changedAt: pastDate(8), changedBy: tpoUser._id, comment: 'Cleared Online Assessment.' },
        { status: 'Selected', changedAt: pastDate(2), changedBy: tpoUser._id, comment: 'Final Selection approved.' },
      ],
    });

    // Priya applied to Microsoft (Selected)
    const priyaMsftApp = await Application.create({
      student: studentProfiles[1]._id, // Priya
      user: studentUsers[1]._id,
      drive: msftDrive._id,
      company: companies[1]._id,
      appliedAt: pastDate(18),
      status: 'Selected',
      currentRound: 3,
      statusHistory: [
        { status: 'Applied', changedAt: pastDate(18), changedBy: studentUsers[1]._id, comment: 'Application submitted.' },
        { status: 'Shortlisted', changedAt: pastDate(14), changedBy: tpoUser._id, comment: 'Shortlisted for technical round.' },
        { status: 'In Process', changedAt: pastDate(10), changedBy: tpoUser._id, comment: 'Interview rounds in progress.' },
        { status: 'Selected', changedAt: pastDate(3), changedBy: tpoUser._id, comment: 'Selection verified.' },
      ],
    });

    // Amit applied to TCS (In Process)
    const amitTcsApp = await Application.create({
      student: studentProfiles[2]._id, // Amit
      user: studentUsers[2]._id,
      drive: tcsDrive._id,
      company: companies[3]._id,
      appliedAt: pastDate(15),
      status: 'In Process',
      currentRound: 2,
      statusHistory: [
        { status: 'Applied', changedAt: pastDate(15), changedBy: studentUsers[2]._id, comment: 'Application submitted.' },
        { status: 'Shortlisted', changedAt: pastDate(10), changedBy: tpoUser._id, comment: 'Eligible for TCS National Qualifier.' },
        { status: 'In Process', changedAt: pastDate(5), changedBy: tpoUser._id, comment: 'Cleared Aptitude test.' },
      ],
    });

    // Sneha applied to Microsoft (Shortlisted)
    const snehaMsftApp = await Application.create({
      student: studentProfiles[3]._id, // Sneha
      user: studentUsers[3]._id,
      drive: msftDrive._id,
      company: companies[1]._id,
      appliedAt: pastDate(12),
      status: 'Shortlisted',
      currentRound: 1,
      statusHistory: [
        { status: 'Applied', changedAt: pastDate(12), changedBy: studentUsers[3]._id, comment: 'Application submitted.' },
        { status: 'Shortlisted', changedAt: pastDate(6), changedBy: tpoUser._id, comment: 'Profiles screened and shortlisted.' },
      ],
    });

    // Rohan applied to TCS (Applied)
    const rohanTcsApp = await Application.create({
      student: studentProfiles[4]._id, // Rohan
      user: studentUsers[4]._id,
      drive: tcsDrive._id,
      company: companies[3]._id,
      appliedAt: pastDate(4),
      status: 'Applied',
      currentRound: 1,
      statusHistory: [
        { status: 'Applied', changedAt: pastDate(4), changedBy: studentUsers[4]._id, comment: 'Application submitted.' },
      ],
    });

    // 6. Create Interview Rounds
    console.log('🎙️ Scheduling interview rounds...');
    // Rahul's interviews at Google
    await InterviewRound.create([
      {
        application: rahulGoogleApp._id,
        drive: googleDrive._id,
        student: studentProfiles[0]._id,
        roundNumber: 1,
        roundName: 'Online Coding Assessment',
        scheduledDate: pastDate(9),
        venueOrLink: 'HackerRank Platform',
        status: 'Cleared',
        feedback: 'Score 100/100, optimal time complexity in dynamic programming problem.',
        interviewerName: 'Google Automated Suite',
      },
      {
        application: rahulGoogleApp._id,
        drive: googleDrive._id,
        student: studentProfiles[0]._id,
        roundNumber: 2,
        roundName: 'Technical Interview (Algorithms)',
        scheduledDate: pastDate(6),
        venueOrLink: 'Google Meet',
        status: 'Cleared',
        feedback: 'Strong graph traversal problem solving and clear communication.',
        interviewerName: 'Akash Narang, Staff SWE',
      },
      {
        application: rahulGoogleApp._id,
        drive: googleDrive._id,
        student: studentProfiles[0]._id,
        roundNumber: 3,
        roundName: 'System Design & Googleyness',
        scheduledDate: pastDate(4),
        venueOrLink: 'Google Meet',
        status: 'Cleared',
        feedback: 'Demonstrated high ownership and collaborative mindset.',
        interviewerName: 'Divya R., Engineering Director',
      },
    ]);

    // Priya's interviews at Microsoft
    await InterviewRound.create([
      {
        application: priyaMsftApp._id,
        drive: msftDrive._id,
        student: studentProfiles[1]._id,
        roundNumber: 1,
        roundName: 'Technical Screening',
        scheduledDate: pastDate(12),
        venueOrLink: 'Microsoft Teams',
        status: 'Cleared',
        feedback: 'Excellent grasp of Java multi-threading and REST architecture.',
        interviewerName: 'Praveen Saxena',
      },
      {
        application: priyaMsftApp._id,
        drive: msftDrive._id,
        student: studentProfiles[1]._id,
        roundNumber: 2,
        roundName: 'Technical Interview & System Architecture',
        scheduledDate: pastDate(5),
        venueOrLink: 'Microsoft Teams',
        status: 'Cleared',
        feedback: 'Solid object-oriented design and distributed caching design.',
        interviewerName: 'Anandita Roy, Principal SDE',
      },
    ]);

    // Amit's interviews at TCS (1 completed, 1 upcoming)
    await InterviewRound.create([
      {
        application: amitTcsApp._id,
        drive: tcsDrive._id,
        student: studentProfiles[2]._id,
        roundNumber: 1,
        roundName: 'Aptitude & Technical MCQ',
        scheduledDate: pastDate(5),
        venueOrLink: 'TCS iON Center',
        status: 'Cleared',
        feedback: 'Percentile: 94.2%',
        interviewerName: 'TCS iON Evaluation',
      },
      {
        application: amitTcsApp._id,
        drive: tcsDrive._id,
        student: studentProfiles[2]._id,
        roundNumber: 2,
        roundName: 'Technical & Managerial Interview',
        scheduledDate: futureDate(3),
        venueOrLink: 'TCS Virtual Interview Room 4',
        status: 'Scheduled',
        feedback: '',
        interviewerName: 'Nitin Sharma, Delivery Manager',
      },
    ]);

    // Sneha's interview at Microsoft (Upcoming)
    await InterviewRound.create({
      application: snehaMsftApp._id,
      drive: msftDrive._id,
      student: studentProfiles[3]._id,
      roundNumber: 1,
      roundName: 'Technical Interview (Data Structures & ML)',
      scheduledDate: futureDate(4),
      venueOrLink: 'Microsoft Teams Link #MS-4891',
      status: 'Scheduled',
      feedback: '',
      interviewerName: 'Sanjay Reddy, Senior SDE',
    });

    // 7. Create Job Offers & update placed student statuses
    console.log('🎉 Generating job offers and updating placed profiles...');
    // Rahul's Offer from Google
    const rahulOffer = await Offer.create({
      application: rahulGoogleApp._id,
      student: studentProfiles[0]._id,
      drive: googleDrive._id,
      company: companies[0]._id,
      jobRole: 'Software Development Engineer I',
      packageLpa: 32.5,
      offerLetterUrl: 'https://example.com/offers/rahul-google.pdf',
      issueDate: pastDate(2),
      responseDeadline: futureDate(15),
      status: 'Accepted',
      respondedAt: pastDate(1),
    });

    studentProfiles[0].isPlaced = true;
    studentProfiles[0].placedCompany = companies[0]._id;
    studentProfiles[0].placedPackage = 32.5;
    await studentProfiles[0].save();

    // Priya's Offer from Microsoft
    const priyaOffer = await Offer.create({
      application: priyaMsftApp._id,
      student: studentProfiles[1]._id,
      drive: msftDrive._id,
      company: companies[1]._id,
      jobRole: 'Software Engineer - Cloud & AI',
      packageLpa: 28.0,
      offerLetterUrl: 'https://example.com/offers/priya-microsoft.pdf',
      issueDate: pastDate(3),
      responseDeadline: futureDate(12),
      status: 'Accepted',
      respondedAt: pastDate(1),
    });

    studentProfiles[1].isPlaced = true;
    studentProfiles[1].placedCompany = companies[1]._id;
    studentProfiles[1].placedPackage = 28.0;
    await studentProfiles[1].save();

    // 8. Notifications
    console.log('🔔 Creating in-app notifications...');
    await Notification.create([
      {
        recipient: studentUsers[0]._id,
        title: 'Offer Accepted: Google India',
        message: 'Congratulations Rahul! Your acceptance of the SDE-I offer (32.5 LPA) has been recorded.',
        type: 'offer',
        isRead: true,
      },
      {
        recipient: studentUsers[1]._id,
        title: 'Offer Accepted: Microsoft IDC',
        message: 'Congratulations Priya! Your acceptance of the Software Engineer offer (28.0 LPA) has been recorded.',
        type: 'offer',
        isRead: true,
      },
      {
        recipient: studentUsers[2]._id,
        title: 'Interview Scheduled: TCS Technical Round',
        message: 'Your TCS Digital Technical & Managerial Interview is scheduled on ' + futureDate(3).toLocaleDateString() + '.',
        type: 'interview',
        isRead: false,
      },
      {
        recipient: studentUsers[3]._id,
        title: 'Shortlisted: Microsoft IDC Drive',
        message: 'You have been shortlisted for Microsoft Cloud & AI drive. Interview scheduled soon.',
        type: 'application',
        isRead: false,
      },
    ]);

    // 9. Audit Logs
    console.log('📋 Recording initial audit trail...');
    await AuditLog.create([
      {
        action: 'SYSTEM_INITIALIZED',
        performedBy: adminUser._id,
        role: 'admin',
        targetModel: 'System',
        details: { description: 'PlaceTrack system seed data initialized successfully.' },
      },
      {
        action: 'DRIVE_PUBLISHED',
        performedBy: tpoUser._id,
        role: 'tpo',
        targetModel: 'PlacementDrive',
        targetId: googleDrive._id,
        details: { jobTitle: 'Software Development Engineer I', company: 'Google India' },
      },
      {
        action: 'OFFER_ACCEPTED',
        performedBy: studentUsers[0]._id,
        role: 'student',
        targetModel: 'Offer',
        targetId: rahulOffer._id,
        details: { packageLpa: 32.5, company: 'Google India' },
      },
    ]);

    console.log('\n======================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demonstration Credentials:');
    console.log('1. Admin:   admin@placetrack.edu   | Password: Password@123');
    console.log('2. TPO:     tpo@placetrack.edu     | Password: Password@123');
    console.log('3. Student: rahul.sharma@student.edu | Password: Password@123 (Placed: Google, 32.5 LPA)');
    console.log('4. Student: priya.patel@student.edu  | Password: Password@123 (Placed: Microsoft, 28 LPA)');
    console.log('5. Student: amit.kumar@student.edu   | Password: Password@123 (In Process: TCS)');
    console.log('6. Student: sneha.deshmukh@student.edu | Password: Password@123 (Shortlisted: Microsoft)');
    console.log('7. Student: rohan.verma@student.edu  | Password: Password@123 (Applied: TCS)');
    console.log('8. Student: ananya.iyer@student.edu  | Password: Password@123 (Test low CGPA)');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

// If run directly via command line
if (process.argv[1].endsWith('seed.js')) {
  seedData().then(async () => {
    await disconnectDB();
    process.exit(0);
  });
}
