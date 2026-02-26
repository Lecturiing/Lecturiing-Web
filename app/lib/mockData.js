// ─── Lecturers ────────────────────────────────────────────────────────────────
export const MOCK_LECTURERS = [
  {
    id: '1', name: 'Dr. Amara Osei', initials: 'AO', color: '#4f46e5',
    title: 'Associate Professor of Computer Science',
    field: 'Computer Science', qualification: 'PhD', experience: 12,
    country: 'Ghana', timezone: 'GMT+0', rate: 85, currency: 'USD',
    rating: 4.8, reviews: 23, availability: 'Part-time',
    specializations: ['Machine Learning', 'Data Science', 'Python'],
    bio: 'Award-winning educator with 12 years in academia. Published researcher in ML and NLP with a passion for bridging theory and practice.',
    shortlisted: true,
    accountStatus: 'active', approvalStatus: 'approved', joinedAt: '2025-08-15',
    email: 'amara.osei@lecturiing.com', phone: '+233 24 555 0001',
  },
  {
    id: '2', name: 'Prof. Lena Müller', initials: 'LM', color: '#7c3aed',
    title: 'Professor of Business Administration',
    field: 'Business', qualification: 'PhD', experience: 18,
    country: 'Germany', timezone: 'GMT+1', rate: 110, currency: 'USD',
    rating: 4.9, reviews: 41, availability: 'Full-time',
    specializations: ['Strategic Management', 'Finance', 'Entrepreneurship'],
    bio: 'Senior professor with two decades of international teaching. Consulted for Fortune 500 firms and authored three textbooks.',
    shortlisted: false,
    accountStatus: 'active', approvalStatus: 'approved', joinedAt: '2025-07-20',
    email: 'lena.muller@lecturiing.com', phone: '+49 30 555 0002',
  },
  {
    id: '3', name: 'Mr. James Kariuki', initials: 'JK', color: '#059669',
    title: 'Lecturer in Civil Engineering',
    field: 'Engineering', qualification: 'MSc', experience: 7,
    country: 'Kenya', timezone: 'GMT+3', rate: 60, currency: 'USD',
    rating: 4.6, reviews: 15, availability: 'Full-time',
    specializations: ['Structural Analysis', 'AutoCAD', 'Project Management'],
    bio: 'Practicing civil engineer and part-time lecturer. Brings real-world project experience into the classroom.',
    shortlisted: true,
    accountStatus: 'active', approvalStatus: 'approved', joinedAt: '2025-09-10',
    email: 'james.kariuki@lecturiing.com', phone: '+254 20 555 0003',
  },
  {
    id: '4', name: 'Dr. Priya Sharma', initials: 'PS', color: '#d97706',
    title: 'Senior Lecturer in Mathematics',
    field: 'Mathematics', qualification: 'PhD', experience: 9,
    country: 'India', timezone: 'GMT+5:30', rate: 70, currency: 'USD',
    rating: 4.7, reviews: 32, availability: 'Part-time',
    specializations: ['Calculus', 'Statistics', 'Linear Algebra'],
    bio: 'Research mathematician with a gift for making complex concepts accessible. Experienced in online and hybrid teaching.',
    shortlisted: false,
    accountStatus: 'suspended', approvalStatus: 'approved', joinedAt: '2025-10-01',
    email: 'priya.sharma@lecturiing.com', phone: '+91 22 555 0004',
    suspensionReason: 'Multiple complaints about missed classes',
  },
  {
    id: '5', name: 'Dr. Sofia Andrade', initials: 'SA', color: '#be185d',
    title: 'Associate Professor of Literature',
    field: 'Humanities', qualification: 'PhD', experience: 14,
    country: 'Brazil', timezone: 'GMT-3', rate: 75, currency: 'USD',
    rating: 4.9, reviews: 28, availability: 'Full-time',
    specializations: ['Postcolonial Studies', 'Creative Writing', 'Linguistics'],
    bio: 'Published author and educator specialising in Latin American literature and creative writing workshops.',
    shortlisted: false,
    accountStatus: 'active', approvalStatus: 'approved', joinedAt: '2025-11-05',
    email: 'sofia.andrade@lecturiing.com', phone: '+55 11 555 0005',
  },
  {
    id: '6', name: 'Mr. Kwame Asante', initials: 'KA', color: '#0891b2',
    title: 'Instructor in Graphic Design',
    field: 'Arts & Design', qualification: 'BFA', experience: 5,
    country: 'Ghana', timezone: 'GMT+0', rate: 50, currency: 'USD',
    rating: 4.5, reviews: 18, availability: 'Part-time',
    specializations: ['UI/UX Design', 'Adobe Suite', 'Brand Identity'],
    bio: 'Award-winning graphic designer transitioning into education. Expert in industry tools and design thinking methodology.',
    shortlisted: false,
    accountStatus: 'active', approvalStatus: 'pending', joinedAt: '2026-02-20',
    email: 'kwame.asante@lecturiing.com', phone: '+233 24 555 0006',
  },
  {
    id: '7', name: 'Dr. Chen Wei', initials: 'CW', color: '#dc2626',
    title: 'Professor of Computer Engineering',
    field: 'Engineering', qualification: 'PhD', experience: 15,
    country: 'China', timezone: 'GMT+8', rate: 95, currency: 'USD',
    rating: 0, reviews: 0, availability: 'Full-time',
    specializations: ['Embedded Systems', 'IoT', 'Robotics'],
    bio: 'Leading researcher in embedded systems and IoT. Published 50+ papers in top-tier conferences.',
    shortlisted: false,
    accountStatus: 'active', approvalStatus: 'pending', joinedAt: '2026-02-22',
    email: 'chen.wei@lecturiing.com', phone: '+86 10 555 0007',
  },
];

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const MOCK_JOBS = [
  {
    id: '1', title: 'Senior Lecturer in Data Science',
    field: 'Computer Science', status: 'active',
    applicants: 8, deadline: '2026-03-15',
    budgetMin: 2000, budgetMax: 3000, currency: 'USD',
    contractType: 'Part-time', duration: '6 months',
    description: 'We are seeking an experienced data science lecturer to teach advanced modules including ML, deep learning, and data visualisation.',
    requirements: ['PhD in CS or Data Science', '5+ years teaching experience', 'Proficiency in Python, TensorFlow'],
    createdAt: '2026-02-01',
  },
  {
    id: '2', title: 'Business Strategy Instructor',
    field: 'Business', status: 'active',
    applicants: 5, deadline: '2026-03-20',
    budgetMin: 3000, budgetMax: 4500, currency: 'USD',
    contractType: 'Full-time', duration: '1 year',
    description: 'Looking for a dynamic instructor to deliver MBA-level strategic management and entrepreneurship modules.',
    requirements: ['MBA or PhD in Business', '8+ years industry/academic experience'],
    createdAt: '2026-02-05',
  },
  {
    id: '3', title: 'Mathematics Tutor — Calculus & Stats',
    field: 'Mathematics', status: 'draft',
    applicants: 0, deadline: '2026-04-01',
    budgetMin: 1200, budgetMax: 1800, currency: 'USD',
    contractType: 'Part-time', duration: '3 months',
    description: 'Undergraduate-level calculus and statistics tutor for an online-first institution.',
    requirements: ['MSc or PhD in Mathematics', 'Online teaching experience preferred'],
    createdAt: '2026-02-12',
  },
  {
    id: '4', title: 'Civil Engineering Lecturer',
    field: 'Engineering', status: 'closed',
    applicants: 12, deadline: '2026-01-31',
    budgetMin: 2500, budgetMax: 3500, currency: 'USD',
    contractType: 'Full-time', duration: '1 year',
    description: 'Structural engineering and project management modules for second-year engineering students.',
    requirements: ['MSc/PhD in Civil Engineering', 'Professional engineering licence preferred'],
    createdAt: '2025-12-10',
  },
];

// ─── Shortlist ─────────────────────────────────────────────────────────────────
export const MOCK_SHORTLIST = [
  {
    id: 's1', lecturerId: '1', lecturerName: 'Dr. Amara Osei',
    lecturerInitials: 'AO', lecturerColor: '#4f46e5',
    jobId: '1', jobTitle: 'Senior Lecturer in Data Science',
    status: 'interview_scheduled', interviewDate: '2026-02-25T10:00',
    addedAt: '2026-02-10',
  },
  {
    id: 's2', lecturerId: '3', lecturerName: 'Mr. James Kariuki',
    lecturerInitials: 'JK', lecturerColor: '#059669',
    jobId: '1', jobTitle: 'Senior Lecturer in Data Science',
    status: 'new', interviewDate: null,
    addedAt: '2026-02-11',
  },
  {
    id: 's3', lecturerId: '2', lecturerName: 'Prof. Lena Müller',
    lecturerInitials: 'LM', lecturerColor: '#7c3aed',
    jobId: '2', jobTitle: 'Business Strategy Instructor',
    status: 'offer_sent', interviewDate: '2026-02-18T14:00',
    addedAt: '2026-02-08',
  },
];

// ─── Contracts ─────────────────────────────────────────────────────────────────
export const MOCK_CONTRACTS = [
  {
    id: 'c1', lecturerId: '1', lecturerName: 'Dr. Amara Osei',
    lecturerInitials: 'AO', lecturerColor: '#4f46e5',
    jobTitle: 'Senior Lecturer in Data Science',
    status: 'active', amount: 2500, currency: 'USD',
    startDate: '2026-03-01', endDate: '2026-08-31',
    escrowStatus: 'in_escrow', contractType: 'Part-time',
    createdAt: '2026-02-20',
  },
  {
    id: 'c2', lecturerId: '2', lecturerName: 'Prof. Lena Müller',
    lecturerInitials: 'LM', lecturerColor: '#7c3aed',
    jobTitle: 'Business Strategy Instructor',
    status: 'pending_acceptance', amount: 4000, currency: 'USD',
    startDate: '2026-03-15', endDate: '2027-03-14',
    escrowStatus: 'not_initiated', contractType: 'Full-time',
    createdAt: '2026-02-22',
  },
  {
    id: 'c3', lecturerId: '3', lecturerName: 'Mr. James Kariuki',
    lecturerInitials: 'JK', lecturerColor: '#059669',
    jobTitle: 'Civil Engineering Lecturer',
    status: 'completed', amount: 3000, currency: 'USD',
    startDate: '2025-09-01', endDate: '2026-01-31',
    escrowStatus: 'released', contractType: 'Full-time',
    createdAt: '2025-08-20',
  },
];

// ─── Performance Reviews ────────────────────────────────────────────────────────
export const MOCK_REVIEWS = [
  {
    id: 'r1', lecturerId: '3', lecturerName: 'Mr. James Kariuki',
    lecturerInitials: 'JK', lecturerColor: '#059669',
    jobTitle: 'Civil Engineering Lecturer',
    overallRating: 4.6,
    categories: { teaching: 5, punctuality: 4.5, communication: 4.5, studentFeedback: 4.3 },
    review: 'James brought real-world examples that students loved. Slightly late submitting grades but overall a fantastic engagement.',
    completedAt: '2026-01-31', reviewedAt: '2026-02-05',
  },
];

// ─── Activity Feed ──────────────────────────────────────────────────────────────
export const MOCK_ACTIVITY = [
  { id: 'a1', type: 'application', text: 'Dr. Amara Osei applied to Senior Lecturer in Data Science', time: '2 hours ago', color: '#4f46e5' },
  { id: 'a2', type: 'interview', text: 'Interview scheduled with Dr. Amara Osei for Feb 25', time: '4 hours ago', color: '#7c3aed' },
  { id: 'a3', type: 'contract', text: 'Contract sent to Prof. Lena Müller — awaiting acceptance', time: '1 day ago', color: '#d97706' },
  { id: 'a4', type: 'review', text: 'Performance review submitted for Mr. James Kariuki', time: '3 days ago', color: '#059669' },
  { id: 'a5', type: 'job', text: 'Job posting "Business Strategy Instructor" went live', time: '5 days ago', color: '#0891b2' },
];

// ─── Applicants ─────────────────────────────────────────────────────────────────
export const MOCK_APPLICANTS = [
  // Job 1: Senior Lecturer in Data Science
  { id: 'app1', jobId: '1', lecturerId: '1', appliedAt: '2026-02-10', status: 'shortlisted', interviewDate: null },
  { id: 'app2', jobId: '1', lecturerId: '3', appliedAt: '2026-02-11', status: 'interview_scheduled', interviewDate: '2026-02-25T10:00' },
  { id: 'app3', jobId: '1', lecturerId: '4', appliedAt: '2026-02-12', status: 'pending', interviewDate: null },
  { id: 'app4', jobId: '1', lecturerId: '6', appliedAt: '2026-02-13', status: 'declined', interviewDate: null },
  { id: 'app5', jobId: '1', lecturerId: '5', appliedAt: '2026-02-14', status: 'pending', interviewDate: null },
  // Job 2: Business Strategy Instructor
  { id: 'app6', jobId: '2', lecturerId: '2', appliedAt: '2026-02-08', status: 'offer_sent', interviewDate: '2026-02-18T14:00' },
  { id: 'app7', jobId: '2', lecturerId: '4', appliedAt: '2026-02-09', status: 'interview_scheduled', interviewDate: '2026-02-22T14:00' },
  { id: 'app8', jobId: '2', lecturerId: '1', appliedAt: '2026-02-10', status: 'pending', interviewDate: null },
  // Job 4: Civil Engineering Lecturer (closed)
  { id: 'app9', jobId: '4', lecturerId: '3', appliedAt: '2026-01-10', status: 'offer_sent', interviewDate: '2026-01-20T09:00' },
  { id: 'app10', jobId: '4', lecturerId: '6', appliedAt: '2026-01-11', status: 'declined', interviewDate: null },
  { id: 'app11', jobId: '4', lecturerId: '5', appliedAt: '2026-01-12', status: 'declined', interviewDate: null },
];

// ─── Extended Lecturer Details ───────────────────────────────────────────────────
export const MOCK_LECTURER_DETAILS = {
  '1': {
    languages: ['English', 'Twi'],
    teachingPhilosophy: 'I believe in learning by doing. Every concept I teach is grounded in real data and practical problems, so students leave with skills they can apply immediately.',
    education: [
      { degree: 'PhD in Computer Science', institution: 'University of Ghana', year: '2014' },
      { degree: 'MSc in Artificial Intelligence', institution: 'University of Edinburgh', year: '2010' },
      { degree: 'BSc in Computer Science', institution: 'KNUST', year: '2008' },
    ],
    experience: [
      { role: 'Associate Professor', institution: 'University of Ghana', period: '2018 – Present', description: 'Lead ML and NLP research lab. Teach graduate-level machine learning and data engineering courses.' },
      { role: 'Research Fellow', institution: 'Alan Turing Institute, London', period: '2016 – 2018', description: 'Conducted research on fairness in algorithmic decision-making. Co-authored 4 peer-reviewed papers.' },
      { role: 'Lecturer', institution: 'KNUST', period: '2014 – 2016', description: 'Delivered undergraduate programming and databases modules.' },
    ],
    portfolio: [
      { title: 'Fairness in ML: A West African Dataset Study', type: 'Publication', year: '2022', url: '#' },
      { title: 'Python for Data Science — Open Course', type: 'Course', year: '2021', url: '#' },
      { title: 'NLP Pipeline for Low-Resource Languages', type: 'Project', year: '2020', url: '#' },
    ],
    certifications: ['TensorFlow Developer Certificate', 'AWS Certified ML Specialist', 'Google Data Analytics'],
  },
  '2': {
    languages: ['German', 'English', 'French'],
    teachingPhilosophy: 'Rigorous theory meets real-world application. I push students to think critically about strategy and leadership, drawing from decades of corporate consulting.',
    education: [
      { degree: 'PhD in Business Administration', institution: 'Ludwig Maximilian University', year: '2006' },
      { degree: 'MBA', institution: 'INSEAD', year: '2002' },
      { degree: 'BSc in Economics', institution: 'University of Bonn', year: '2000' },
    ],
    experience: [
      { role: 'Professor of Business', institution: 'Frankfurt School of Finance', period: '2012 – Present', description: 'Head of MBA strategy track. Author of three adopted textbooks.' },
      { role: 'Strategy Consultant', institution: 'McKinsey & Company', period: '2008 – 2012', description: 'Led engagements for European DAX companies on market entry and M&A.' },
      { role: 'Assistant Professor', institution: 'Humboldt University Berlin', period: '2006 – 2008', description: 'Research in corporate governance and organizational theory.' },
    ],
    portfolio: [
      { title: 'Strategic Management: A Global Perspective (3rd Ed.)', type: 'Textbook', year: '2021', url: '#' },
      { title: 'Corporate Governance in Emerging Markets', type: 'Publication', year: '2019', url: '#' },
      { title: 'MBA Strategy Bootcamp (5,000+ enrollments)', type: 'Course', year: '2020', url: '#' },
    ],
    certifications: ['Chartered Management Consultant (CMC)', 'Harvard Leadership Program'],
  },
  '3': {
    languages: ['English', 'Swahili'],
    teachingPhilosophy: 'Engineering is built in the field, not just the classroom. I bring site visits, live case studies, and industry tools into every course I teach.',
    education: [
      { degree: 'MSc in Structural Engineering', institution: 'University of Nairobi', year: '2019' },
      { degree: 'BEng in Civil Engineering', institution: 'Jomo Kenyatta University', year: '2016' },
    ],
    experience: [
      { role: 'Lecturer in Civil Engineering', institution: 'Technical University of Kenya', period: '2021 – Present', description: 'Teaches structural analysis, construction management, and AutoCAD to 2nd and 3rd year students.' },
      { role: 'Site Engineer', institution: 'Hashi Engineering Ltd', period: '2019 – 2021', description: 'Supervised construction of three major road projects in Nairobi worth $12M combined.' },
      { role: 'Graduate Intern', institution: 'Kenya National Highways Authority', period: '2016 – 2019', description: 'Assisted in bridge design review and project documentation.' },
    ],
    portfolio: [
      { title: 'Load Distribution in Pre-stressed Concrete Beams', type: 'Publication', year: '2022', url: '#' },
      { title: 'AutoCAD for Civil Engineers — Practical Course', type: 'Course', year: '2021', url: '#' },
      { title: 'Nairobi Ring Road Phase II (Site Engineer)', type: 'Project', year: '2020', url: '#' },
    ],
    certifications: ['Professional Engineer (PE) — Kenya', 'Autodesk Certified AutoCAD Professional'],
  },
  '4': {
    languages: ['English', 'Hindi', 'Marathi'],
    teachingPhilosophy: 'Mathematics is a language. My goal is fluency — intuitive understanding first, formal rigor second. Every student can succeed with the right scaffolding.',
    education: [
      { degree: 'PhD in Pure Mathematics', institution: 'Indian Institute of Science', year: '2017' },
      { degree: 'MSc in Mathematics', institution: 'University of Pune', year: '2013' },
      { degree: 'BSc in Mathematics', institution: 'Fergusson College', year: '2011' },
    ],
    experience: [
      { role: 'Senior Lecturer', institution: 'IIT Bombay', period: '2019 – Present', description: 'Teaches undergraduate calculus, statistics, and advanced linear algebra. Supervises 3 PhD students.' },
      { role: 'Postdoctoral Fellow', institution: 'ETH Zurich', period: '2017 – 2019', description: 'Research in algebraic topology and its applications to data science.' },
      { role: 'Teaching Assistant', institution: 'Indian Institute of Science', period: '2013 – 2017', description: 'Led tutorial sessions and graded assessments for 300+ students per semester.' },
    ],
    portfolio: [
      { title: 'Topology and Persistent Homology in ML', type: 'Publication', year: '2021', url: '#' },
      { title: 'Calculus Made Intuitive — MOOC', type: 'Course', year: '2020', url: '#' },
      { title: 'Open-Source Statistics Problem Bank (2,000+ problems)', type: 'Project', year: '2022', url: '#' },
    ],
    certifications: ['NPTEL Teaching Excellence Award', 'Coursera Instructor Certification'],
  },
  '5': {
    languages: ['Portuguese', 'English', 'Spanish', 'French'],
    teachingPhilosophy: 'Literature is alive. I teach it through performance, debate, and creative response — not passive reading. Students become producers of meaning, not just consumers.',
    education: [
      { degree: 'PhD in Comparative Literature', institution: 'Universidade de São Paulo', year: '2012' },
      { degree: 'MA in Literary Studies', institution: 'PUC-Rio', year: '2008' },
      { degree: 'BA in Languages and Literature', institution: 'UNICAMP', year: '2006' },
    ],
    experience: [
      { role: 'Associate Professor of Literature', institution: 'Universidade Federal Fluminense', period: '2014 – Present', description: 'Teaches postcolonial theory, creative writing, and world literature. Programme coordinator for Humanities.' },
      { role: 'Visiting Lecturer', institution: 'University of Lisbon', period: '2012 – 2014', description: 'Delivered a bilingual course series on Lusophone literature and diaspora identity.' },
      { role: 'Researcher', institution: 'FAPESP Research Institute', period: '2008 – 2012', description: 'Published work on magical realism and decolonial aesthetics in Latin American fiction.' },
    ],
    portfolio: [
      { title: 'Decolonising the Syllabus: Perspectives from Latin America', type: 'Publication', year: '2020', url: '#' },
      { title: 'Creative Writing Masterclass (3,500 enrollments)', type: 'Course', year: '2019', url: '#' },
      { title: 'Between Languages: A Novel (published)', type: 'Book', year: '2018', url: '#' },
    ],
    certifications: ['CELTA (Cambridge English)', 'UNESCO Creative Cities Network Fellow'],
  },
  '6': {
    languages: ['English', 'Akan', 'Twi'],
    teachingPhilosophy: 'Design changes lives. I teach tools but also thinking — how to see problems as design opportunities and communicate ideas that connect.',
    education: [
      { degree: 'BFA in Graphic Design', institution: 'KNUST School of Art and Design', year: '2019' },
      { degree: 'HND in Visual Communication', institution: 'Accra Technical University', year: '2017' },
    ],
    experience: [
      { role: 'Design Instructor', institution: 'AfriDesign Academy, Accra', period: '2021 – Present', description: 'Teaches UI/UX fundamentals, brand identity, and the full Adobe Creative Suite to cohorts of 25–40 students.' },
      { role: 'Senior Graphic Designer', institution: 'Ogilvy Africa', period: '2019 – 2021', description: 'Led visual identity projects for multinational brands including MTN and Unilever Ghana.' },
      { role: 'Freelance Designer', period: '2017 – 2019', description: 'Built brand identities, packaging, and digital campaigns for 40+ SMEs across West Africa.' },
    ],
    portfolio: [
      { title: 'MTN Ghana Rebrand 2021 — Lead Designer', type: 'Project', year: '2021', url: '#' },
      { title: 'UI/UX Design Fundamentals (Udemy, 4.8★)', type: 'Course', year: '2022', url: '#' },
      { title: 'African Pattern Systems in Modern Branding', type: 'Publication', year: '2023', url: '#' },
    ],
    certifications: ['Google UX Design Certificate', 'Adobe Certified Expert (ACE)', 'Nielsen Norman UX Certification'],
  },
};

// ─── Contract Document Library ─────────────────────────────────────────────────
export const MOCK_CONTRACT_DOCS = [
  { id: 'doc1', title: 'Standard Lecturer Agreement', category: 'Contract', pages: 8, lastUpdated: '2026-01-10', description: 'Full engagement contract covering duties, remuneration, and termination clauses.' },
  { id: 'doc2', title: 'Non-Disclosure Agreement (NDA)', category: 'NDA', pages: 3, lastUpdated: '2026-01-10', description: 'Confidentiality agreement covering institutional IP, student data, and proprietary course content.' },
  { id: 'doc3', title: 'Intellectual Property Assignment', category: 'IP', pages: 4, lastUpdated: '2025-11-20', description: 'Assigns course materials and research outputs developed during the engagement to the institution.' },
  { id: 'doc4', title: 'Part-Time Lecturer Contract', category: 'Contract', pages: 5, lastUpdated: '2026-02-01', description: 'Shortened engagement contract for part-time and hourly lecturers.' },
  { id: 'doc5', title: 'Code of Conduct & Ethics Policy', category: 'Policy', pages: 6, lastUpdated: '2025-09-15', description: 'Institutional standards for professional conduct, academic integrity, and student interaction.' },
  { id: 'doc6', title: 'Remote Work Agreement', category: 'Policy', pages: 3, lastUpdated: '2025-12-01', description: 'Terms and conditions for remote delivery of lectures and online engagement.' },
];

// ─── Job → Document mappings (internal, not shown to applicants) ───────────────
export const MOCK_JOB_DOCS = {
  '1': ['doc1', 'doc2', 'doc5'],
  '2': ['doc4', 'doc2', 'doc5'],
  '4': ['doc1', 'doc2', 'doc3'],
};

// ─── Offers ────────────────────────────────────────────────────────────────────
export const MOCK_OFFERS = [
  {
    id: 'of1', jobId: '1', lecturerId: '1',
    lecturerName: 'Dr. Amara Osei', lecturerInitials: 'AO', lecturerColor: '#4f46e5',
    jobTitle: 'Senior Lecturer in Data Science',
    offeredAt: '2026-02-20', status: 'pending',
    sentDocs: [], signedDocs: [],
  },
  {
    id: 'of2', jobId: '2', lecturerId: '2',
    lecturerName: 'Prof. Lena Müller', lecturerInitials: 'LM', lecturerColor: '#7c3aed',
    jobTitle: 'Business Strategy Instructor',
    offeredAt: '2026-02-18', status: 'approved',
    sentDocs: ['doc4', 'doc2'], signedDocs: ['doc4', 'doc2'],
  },
  {
    id: 'of3', jobId: '4', lecturerId: '3',
    lecturerName: 'Mr. James Kariuki', lecturerInitials: 'JK', lecturerColor: '#059669',
    jobTitle: 'Civil Engineering Lecturer',
    offeredAt: '2026-01-15', status: 'approved',
    sentDocs: ['doc1', 'doc2', 'doc3'], signedDocs: ['doc1', 'doc2', 'doc3'],
  },
  {
    id: 'of4', jobId: '1', lecturerId: '4',
    lecturerName: 'Dr. Priya Sharma', lecturerInitials: 'PS', lecturerColor: '#d97706',
    jobTitle: 'Senior Lecturer in Data Science',
    offeredAt: '2026-02-22', status: 'declined',
    sentDocs: [], signedDocs: [],
  },
];

// ─── Hired Lecturers ──────────────────────────────────────────────────────────
export const MOCK_HIRED = [
  {
    id: 'hire1', lecturerId: '3',
    lecturerName: 'Mr. James Kariuki', lecturerInitials: 'JK', lecturerColor: '#059669',
    jobId: '4', jobTitle: 'Civil Engineering Lecturer',
    hiredAt: '2026-01-20', contractType: 'Full-time',
    startDate: '2026-09-01', endDate: '2027-08-31',
    rate: 60, currency: 'USD',
    signedDocs: ['doc1', 'doc2', 'doc3'],
    status: 'active',
  },
  {
    id: 'hire2', lecturerId: '2',
    lecturerName: 'Prof. Lena Müller', lecturerInitials: 'LM', lecturerColor: '#7c3aed',
    jobId: '2', jobTitle: 'Business Strategy Instructor',
    hiredAt: '2026-02-22', contractType: 'Full-time',
    startDate: '2026-03-15', endDate: '2027-03-14',
    rate: 110, currency: 'USD',
    signedDocs: ['doc4', 'doc2'],
    status: 'starting_soon',
  },
];

// ─── Institution-Lecturer Assignments ─────────────────────────────────────────
export const MOCK_INSTITUTION_LECTURERS = {
  'inst1': [ // African Institute of Technology
    { lecturerId: '1', hoursThisMonth: 120, status: 'active', hiredDate: '2025-09-01' },
    { lecturerId: '3', hoursThisMonth: 80, status: 'active', hiredDate: '2025-10-15' },
    { lecturerId: '4', hoursThisMonth: 95, status: 'active', hiredDate: '2025-11-01' },
  ],
  'inst2': [ // Berlin Business School
    { lecturerId: '2', hoursThisMonth: 160, status: 'active', hiredDate: '2025-08-20' },
    { lecturerId: '5', hoursThisMonth: 140, status: 'active', hiredDate: '2025-09-10' },
  ],
  'inst3': [ // Nairobi College of Engineering
    { lecturerId: '3', hoursThisMonth: 100, status: 'active', hiredDate: '2025-10-05' },
    { lecturerId: '6', hoursThisMonth: 75, status: 'active', hiredDate: '2025-11-12' },
  ],
  'inst4': [ // Mumbai Institute of Mathematics
    { lecturerId: '4', hoursThisMonth: 60, status: 'active', hiredDate: '2026-01-20' },
  ],
  'inst5': [ // São Paulo Arts Academy
    { lecturerId: '5', hoursThisMonth: 110, status: 'active', hiredDate: '2025-12-01' },
    { lecturerId: '6', hoursThisMonth: 85, status: 'active', hiredDate: '2025-12-15' },
  ],
  'inst6': [], // Lagos Digital Academy (suspended)
  'inst7': [ // Toronto Tech Institute
    { lecturerId: '1', hoursThisMonth: 155, status: 'active', hiredDate: '2025-07-25' },
    { lecturerId: '2', hoursThisMonth: 145, status: 'active', hiredDate: '2025-08-01' },
    { lecturerId: '4', hoursThisMonth: 130, status: 'active', hiredDate: '2025-08-15' },
  ],
  'inst8': [ // Cape Town University Extension
    { lecturerId: '3', hoursThisMonth: 125, status: 'active', hiredDate: '2025-12-20' },
    { lecturerId: '5', hoursThisMonth: 105, status: 'active', hiredDate: '2026-01-05' },
  ],
};

// ─── Institution-Jobs Mapping ─────────────────────────────────────────────────
export const MOCK_INSTITUTION_JOBS = {
  'inst1': ['1', '2'], // African Institute of Technology
  'inst2': ['2', '4'], // Berlin Business School
  'inst3': ['3'], // Nairobi College of Engineering
  'inst4': ['1'], // Mumbai Institute of Mathematics
  'inst5': ['4'], // São Paulo Arts Academy
  'inst6': [], // Lagos Digital Academy
  'inst7': ['1', '2', '3', '4'], // Toronto Tech Institute
  'inst8': ['2', '3'], // Cape Town University Extension
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1', type: 'application', read: false,
    title: 'New application received',
    body: 'Dr. Amara Osei applied for Senior Lecturer in Data Science.',
    time: '2 min ago', timeRaw: '2026-02-19T10:58:00Z',
    initials: 'AO', color: '#4f46e5',
    href: '/dashboard/jobs/1/applicants',
  },
  {
    id: 'n2', type: 'offer_accepted', read: false,
    title: 'Offer accepted',
    body: 'Prof. Lena Müller accepted your offer for Business Strategy Instructor.',
    time: '1 hr ago', timeRaw: '2026-02-19T10:00:00Z',
    initials: 'LM', color: '#7c3aed',
    href: '/dashboard/offers',
  },
  {
    id: 'n3', type: 'doc_signed', read: false,
    title: 'Document signed',
    body: 'Mr. James Kariuki signed the Standard Lecturer Agreement.',
    time: '3 hr ago', timeRaw: '2026-02-19T08:00:00Z',
    initials: 'JK', color: '#059669',
    href: '/dashboard/hired',
  },
  {
    id: 'n4', type: 'offer_declined', read: true,
    title: 'Offer declined',
    body: 'Dr. Priya Sharma declined the offer for Senior Lecturer in Data Science.',
    time: 'Yesterday', timeRaw: '2026-02-18T14:30:00Z',
    initials: 'PS', color: '#d97706',
    href: '/dashboard/offers',
  },
  {
    id: 'n5', type: 'verification', read: true,
    title: 'Verification update',
    body: 'Your institution documents are under review by our compliance team.',
    time: 'Yesterday', timeRaw: '2026-02-18T09:00:00Z',
    initials: null, color: '#4f46e5', icon: 'shield',
    href: '/dashboard/verification',
  },
  {
    id: 'n6', type: 'shortlist', read: true,
    title: 'Shortlist reminder',
    body: 'You have 3 shortlisted applicants awaiting a decision for Civil Engineering Lecturer.',
    time: '2 days ago', timeRaw: '2026-02-17T11:00:00Z',
    initials: null, color: '#0891b2', icon: 'star',
    href: '/dashboard/shortlist',
  },
  {
    id: 'n7', type: 'doc_signed', read: true,
    title: 'Document signed',
    body: 'Prof. Lena Müller signed the Non-Disclosure Agreement.',
    time: '2 days ago', timeRaw: '2026-02-17T09:15:00Z',
    initials: 'LM', color: '#7c3aed',
    href: '/dashboard/hired',
  },
  {
    id: 'n8', type: 'application', read: true,
    title: 'New application received',
    body: 'Dr. Sofia Andrade applied for Humanities Lecturer — Creative Writing.',
    time: '3 days ago', timeRaw: '2026-02-16T15:45:00Z',
    initials: 'SA', color: '#be185d',
    href: '/dashboard/jobs',
  },
];

// ─── Admin: Institutions ──────────────────────────────────────────────────────
export const MOCK_INSTITUTIONS = [
  {
    id: 'inst1', name: 'African Institute of Technology', initials: 'AIT', color: '#4f46e5',
    type: 'University', country: 'Ghana', city: 'Accra',
    status: 'active', verificationStatus: 'verified',
    joinedAt: '2025-08-15', lastActive: '2 hours ago',
    stats: { jobs: 12, lecturers: 8, activeContracts: 5, pendingVerifications: 0 },
    contact: { name: 'Dr. Kwame Mensah', email: 'kmensah@ait.edu.gh', phone: '+233 24 123 4567' },
    plan: 'Enterprise', monthlySpend: 4200,
  },
  {
    id: 'inst2', name: 'Berlin Business School', initials: 'BBS', color: '#7c3aed',
    type: 'Business School', country: 'Germany', city: 'Berlin',
    status: 'active', verificationStatus: 'verified',
    joinedAt: '2025-09-20', lastActive: '1 day ago',
    stats: { jobs: 8, lecturers: 15, activeContracts: 12, pendingVerifications: 0 },
    contact: { name: 'Prof. Heidi Schmidt', email: 'schmidt@bbs.de', phone: '+49 30 1234567' },
    plan: 'Professional', monthlySpend: 6800,
  },
  {
    id: 'inst3', name: 'Nairobi College of Engineering', initials: 'NCE', color: '#059669',
    type: 'College', country: 'Kenya', city: 'Nairobi',
    status: 'active', verificationStatus: 'verified',
    joinedAt: '2025-10-05', lastActive: '3 hours ago',
    stats: { jobs: 6, lecturers: 4, activeContracts: 3, pendingVerifications: 0 },
    contact: { name: 'Mr. John Mwangi', email: 'jmwangi@nce.ac.ke', phone: '+254 20 1234567' },
    plan: 'Starter', monthlySpend: 1800,
  },
  {
    id: 'inst4', name: 'Mumbai Institute of Mathematics', initials: 'MIM', color: '#d97706',
    type: 'Institute', country: 'India', city: 'Mumbai',
    status: 'active', verificationStatus: 'in_review',
    joinedAt: '2026-01-12', lastActive: '5 hours ago',
    stats: { jobs: 4, lecturers: 2, activeContracts: 1, pendingVerifications: 3 },
    contact: { name: 'Dr. Priya Kumar', email: 'pkumar@mim.edu.in', phone: '+91 22 12345678' },
    plan: 'Starter', monthlySpend: 950,
  },
  {
    id: 'inst5', name: 'São Paulo Arts Academy', initials: 'SAA', color: '#be185d',
    type: 'Academy', country: 'Brazil', city: 'São Paulo',
    status: 'active', verificationStatus: 'verified',
    joinedAt: '2025-11-18', lastActive: '1 week ago',
    stats: { jobs: 3, lecturers: 6, activeContracts: 4, pendingVerifications: 0 },
    contact: { name: 'Prof. Ana Silva', email: 'asilva@saa.edu.br', phone: '+55 11 98765-4321' },
    plan: 'Professional', monthlySpend: 3200,
  },
  {
    id: 'inst6', name: 'Lagos Digital Academy', initials: 'LDA', color: '#0891b2',
    type: 'Academy', country: 'Nigeria', city: 'Lagos',
    status: 'suspended', verificationStatus: 'failed',
    joinedAt: '2026-02-01', lastActive: '2 weeks ago',
    stats: { jobs: 2, lecturers: 0, activeContracts: 0, pendingVerifications: 5 },
    contact: { name: 'Mr. Emeka Obi', email: 'eobi@lda.ng', phone: '+234 80 1234 5678' },
    plan: 'Starter', monthlySpend: 0,
  },
  {
    id: 'inst7', name: 'Toronto Tech Institute', initials: 'TTI', color: '#dc2626',
    type: 'Institute', country: 'Canada', city: 'Toronto',
    status: 'active', verificationStatus: 'verified',
    joinedAt: '2025-07-22', lastActive: '30 min ago',
    stats: { jobs: 18, lecturers: 22, activeContracts: 18, pendingVerifications: 0 },
    contact: { name: 'Dr. Sarah Chen', email: 'schen@tti.ca', phone: '+1 416 123 4567' },
    plan: 'Enterprise', monthlySpend: 9500,
  },
  {
    id: 'inst8', name: 'Cape Town University Extension', initials: 'CTU', color: '#16a34a',
    type: 'University', country: 'South Africa', city: 'Cape Town',
    status: 'active', verificationStatus: 'verified',
    joinedAt: '2025-12-10', lastActive: '2 days ago',
    stats: { jobs: 9, lecturers: 11, activeContracts: 7, pendingVerifications: 0 },
    contact: { name: 'Prof. Thabo Mbeki', email: 'tmbeki@ctu.ac.za', phone: '+27 21 123 4567' },
    plan: 'Professional', monthlySpend: 5100,
  },
];

// ─── Admin: Platform Statistics ───────────────────────────────────────────────
export const MOCK_ADMIN_STATS = {
  institutions: { total: 8, active: 7, suspended: 1, pending: 0 },
  lecturers: { total: 68, active: 62, inactive: 6 },
  jobs: { total: 62, active: 48, filled: 14 },
  contracts: { total: 50, active: 50, completed: 0 },
  revenue: { thisMonth: 32550, lastMonth: 28900, growth: 12.6 },
  verifications: { pending: 8, approved: 42, rejected: 3 },
};

// ─── Admin: Recent Activities ─────────────────────────────────────────────────
export const MOCK_ADMIN_ACTIVITIES = [
  {
    id: 'act1', type: 'institution_joined', time: '2 hours ago',
    title: 'New institution registered',
    body: 'Mumbai Institute of Mathematics completed registration.',
    institutionId: 'inst4', institutionName: 'Mumbai Institute of Mathematics', initials: 'MIM', color: '#d97706',
  },
  {
    id: 'act2', type: 'verification_submitted', time: '5 hours ago',
    title: 'Verification submitted',
    body: 'Mumbai Institute of Mathematics submitted documents for review.',
    institutionId: 'inst4', institutionName: 'Mumbai Institute of Mathematics', initials: 'MIM', color: '#d97706',
  },
  {
    id: 'act3', type: 'contract_signed', time: '1 day ago',
    title: 'Contract signed',
    body: 'African Institute of Technology signed a contract with Dr. Amara Osei.',
    institutionId: 'inst1', institutionName: 'African Institute of Technology', initials: 'AIT', color: '#4f46e5',
  },
  {
    id: 'act4', type: 'institution_suspended', time: '2 days ago',
    title: 'Institution suspended',
    body: 'Lagos Digital Academy was suspended due to failed verification.',
    institutionId: 'inst6', institutionName: 'Lagos Digital Academy', initials: 'LDA', color: '#0891b2',
  },
  {
    id: 'act5', type: 'job_posted', time: '2 days ago',
    title: 'Job posting created',
    body: 'Toronto Tech Institute posted a new job: Machine Learning Professor.',
    institutionId: 'inst7', institutionName: 'Toronto Tech Institute', initials: 'TTI', color: '#dc2626',
  },
  {
    id: 'act6', type: 'lecturer_hired', time: '3 days ago',
    title: 'Lecturer hired',
    body: 'Berlin Business School hired Prof. Lena Müller for Business Strategy.',
    institutionId: 'inst2', institutionName: 'Berlin Business School', initials: 'BBS', color: '#7c3aed',
  },
  {
    id: 'act7', type: 'verification_approved', time: '4 days ago',
    title: 'Verification approved',
    body: 'Cape Town University Extension verification was approved.',
    institutionId: 'inst8', institutionName: 'Cape Town University Extension', initials: 'CTU', color: '#16a34a',
  },
  {
    id: 'act8', type: 'payment_received', time: '5 days ago',
    title: 'Payment received',
    body: 'Toronto Tech Institute paid $9,500 for Enterprise plan.',
    institutionId: 'inst7', institutionName: 'Toronto Tech Institute', initials: 'TTI', color: '#dc2626',
  },
];

export const FIELDS = ['Computer Science', 'Business', 'Engineering', 'Mathematics', 'Humanities', 'Arts & Design', 'Medicine', 'Law', 'Education'];
export const QUALIFICATIONS = ['Bachelor\'s', 'Master\'s / MSc', 'PhD', 'Professional Cert.'];
export const COUNTRIES = ['Ghana', 'Nigeria', 'Kenya', 'South Africa', 'Germany', 'UK', 'USA', 'India', 'Brazil', 'Canada'];
export const TIMEZONES = ['GMT-8', 'GMT-5', 'GMT-3', 'GMT+0', 'GMT+1', 'GMT+2', 'GMT+3', 'GMT+5:30', 'GMT+8'];
export const CONTRACT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Hourly'];
