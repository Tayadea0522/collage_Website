import { CollegeInfo, DepartmentInfo, Facility, FacultyMember, Notice, AdmissionApplication, GalleryItem, CollegeEvent, AdminUser } from '../types';

export const initialCollegeInfo: CollegeInfo = {
  name: "Late Shaktikumar Sancheti College of Dairy Technology",
  shortName: "LSSCDT",
  tagline: "College of Dairy Technology",
  trustName: "Late. Madanlalji Kisanlalji Sancheti Seva Samiti, Malkapur",
  logoImage: "/logo.svg",
  affiliation: "Affiliated to Maharashtra Animal & Fishery Sciences University (MAFSU), Nagpur",
  approval: "Approved by ICAR, New Delhi & Govt. of Maharashtra",
  location: "Malkapur, Maharashtra",
  address: "Dasarkhed MIDC Road, Malkapur 443101, Maharashtra",
  phone: "+91 8625869560",
  email: "info@lsscdt.edu.in",
  admissionHelpline: "+91 8625869560",
  
  deanName: "Dr. P. L. Chaudhari",
  deanDesignation: "Dean, Late Shaktikumar Sancheti College of Dairy Technology",
  deanMessage: "Welcome to Late Shaktikumar Sancheti College of Dairy Technology. Our institution is committed to providing world-class education in dairy science and technology. We nurture students to become skilled professionals who contribute to India's dairy industry.",
  deanImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
  
  secretaryName: "Suresh Kisanlal Sancheti",
  secretaryDesignation: "Secretary, Late Shaktikumar Sancheti College of Dairy Technology",
  secretaryMessage: "It is our commitment to build an institution that not only imparts technical knowledge but also shapes the character and values of our students. LSSCDT stands as a symbol of our dedication to rural development and the dairy industry of India.",
  secretaryImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
  
  adminOfficerName: "Shri S. D. Lokhande",
  adminOfficerDesignation: "Administrative Officer, Late Shaktikumar Sancheti College of Dairy Technology",
  adminOfficerMessage: "Our administrative department is dedicated to ensuring smooth operational management, transparent governance, student guidance, and providing a supportive ecosystem for academic and professional excellence.",
  adminOfficerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  
  shaktikumarImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  shaktikumarMessage: "A visionary philanthropist and dedicated patron of education, Late Shri Shaktikumar Sancheti believed that knowledge is the greatest gift one can give to society. This institution stands as a lasting tribute to his unwavering commitment to rural development and the empowerment of India's dairy sector.",
  
  aboutText1: "Late Shaktikumar Sancheti College of Dairy Technology was established in memory of Late Shri Shaktikumar Sancheti, a visionary philanthropist who believed in the power of education. The college was founded with the mission to develop skilled dairy professionals.",
  aboutText2: "To provide quality education in dairy science and technology through innovative teaching methods, industry partnerships, and research activities.",
  
  stats: {
    placement: "100%",
    labs: "15+",
    dairyPlant: "500 LPD",
    faculty: "20+"
  },
  
  establishedYear: "2008",
  campusArea: "35 Acres Green Campus",
  vision: "To be a premier institution in dairy technology education, research, and innovation, producing leaders who transform the global dairy sector.",
  mission: [
    "Impart modern technical knowledge in dairy processing, engineering, chemistry, and microbiology.",
    "Operate commercial-scale pilot plants for experiential learning.",
    "Establish strong industry-academia ties with top dairy cooperatives and corporates.",
    "Drive rural economic growth through extension services and skill development."
  ],
  heroBanners: [
    {
      id: "b1",
      title: "Late Shaktikumar Sancheti College of Dairy Technology",
      subtitle: "Late Madanlal Kisanlal Sancheti Seva Samiti Malkapur (B.Tech Dairy Technology)",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80",
      ctaText: "Apply Now"
    },
    {
      id: "b2",
      title: "State-of-the-Art 500 LPD Dairy Processing Plant",
      subtitle: "Hands-On Practical Learning for Future Dairy Industry Leaders",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80",
      ctaText: "Explore Campus"
    },
    {
      id: "b3",
      title: "100% Placement Record with Amul, Mother Dairy & Nestlé",
      subtitle: "Empowering Rural Youth with Global Technical Careers",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
      ctaText: "View Placements"
    }
  ]
};

export const initialNotices: Notice[] = [
  {
    id: "n1",
    title: "Last Date for Application Submission",
    date: "05 JUN 2026",
    category: "Admission",
    isNew: true,
    content: "The last date for submission of online application form for all UG programs has been extended to June 30, 2026. Candidates are advised to complete their application before the deadline."
  },
  {
    id: "n2",
    title: "Admission Notice 2026-27",
    date: "01 JUN 2026",
    category: "Admission",
    isNew: true,
    content: "Applications are invited for B.Tech Dairy Technology, B.Tech Dairy Engineering, B.Sc Dairy Chemistry, B.Sc Dairy Microbiology, and B.Sc Animal Husbandry programs for the academic year 2026-27."
  },
  {
    id: "n3",
    title: "Scholarship Scheme Notification",
    date: "28 MAY 2026",
    category: "General",
    isNew: false,
    content: "Maharashtra State Government scholarship scheme for meritorious students from backward classes is now open. Students scoring above 75% in qualifying exam may apply. Visit the scholarship portal."
  },
  {
    id: "n4",
    title: "Annual Technical Festival - DairyFest 2026",
    date: "20 MAY 2026",
    category: "Academic",
    isNew: false,
    content: "LSSCDT is proud to announce the Annual Technical Festival DairyFest 2026 to be held on July 15-17, 2026. Registration open for all students. Events include paper presentation, dairy product development, and quiz competitions."
  },
  {
    id: "n5",
    title: "In-Plant Training Allocation List Announced",
    date: "12 MAY 2026",
    category: "Academic",
    isNew: false,
    content: "Final year B.Tech students allocated to Amul Dairy Anand, Katraj Pune, and Mahanand Mumbai for 7th Semester ELP training."
  }
];

export const initialEvents: CollegeEvent[] = [];

export const initialDepartments: DepartmentInfo[] = [
  {
    id: "dt",
    name: "Department of Dairy Technology",
    code: "DT",
    head: "Dr. Suresh K. Shinde",
    description: "Focuses on liquid milk processing, market milk, ice cream, cheese, butter, milk powders, and traditional indigenous dairy product technology.",
    labs: ["Market Milk Processing Lab", "Ice Cream & Confectionery Lab", "Sensory Evaluation Room", "Cheese & Butter Processing Room"],
    keySubjects: ["Market Milk", "Traditional Dairy Products", "Fat-Rich Dairy Products", "Condensed & Dried Milks", "Packaging Technology"],
    image: "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "de",
    name: "Department of Dairy Engineering",
    code: "DE",
    head: "Prof. Anil B. Kulkarni",
    description: "Covers dairy machinery design, refrigeration, boiler operations, heat exchangers, fluid mechanics, and automated CAD plant layout.",
    labs: ["Boiler & Refrigeration Lab", "Dairy Machinery Workshop", "Fluid Mechanics Lab", "CAD Plant Layout Lab"],
    keySubjects: ["Fluid Mechanics", "Thermodynamics", "Refrigeration & Air Conditioning", "Dairy Process Engineering", "Dairy Plant Design"],
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "dc",
    name: "Department of Dairy Chemistry",
    code: "DC",
    head: "Dr. Meena V. Patil",
    description: "Conducts advanced chemical analysis of milk constituents, milk protein isolation, fatty acid profiles, and adulteration testing.",
    labs: ["Chemical QC Lab", "Advanced Instrumental Analysis Room", "Nutritional Biochemistry Lab"],
    keySubjects: ["Physical Chemistry of Milk", "Milk Constituents Chemistry", "Chemical Quality Assurance", "Food Chemistry"],
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "dm",
    name: "Department of Dairy Microbiology",
    code: "DM",
    head: "Dr. Rajeshwar N. Wagh",
    description: "Specializes in fermentation technology, starter cultures for Dahi/Lassi/Shrikhand, pathogen testing, and probiotic cultures.",
    labs: ["Starter Culture Lab", "Microbiological QC Room", "Pathogen Isolation & Biosafety Cabinet"],
    keySubjects: ["Fundamentals of Microbiology", "Starter Cultures & Fermented Milks", "Microbiological Quality Assurance"],
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "dbm",
    name: "Department of Dairy Business Management",
    code: "DBM",
    head: "Prof. Sunita R. Jadhav",
    description: "Teaches milk procurement logistics, supply chain management, financial planning, marketing, and entrepreneurship.",
    labs: ["Agri-Business Simulation Lab", "Communication & Language Kiosk"],
    keySubjects: ["Milk Procurement & Supply Chain", "Dairy Economics", "Marketing & Export", "Financial Management"],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
  }
];

export const initialFaculty: FacultyMember[] = [
  {
    id: "f1",
    name: "Dr. P. L. Chaudhari",
    designation: "Dean & Principal",
    department: "Department of Dairy Technology",
    qualification: "Ph.D. (Dairy Technology)",
    experience: "22 Years Teaching & Research",
    specialization: "Membrane Processing & Dairy Tech Innovation",
    email: "dean@lsscdt.edu.in",
    phone: "+91 8625869560",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "f2",
    name: "Dr. Suresh K. Shinde",
    designation: "Professor & Head",
    department: "Department of Dairy Technology",
    qualification: "Ph.D. (Dairy Tech)",
    experience: "18 Years",
    specialization: "UHT Processing & Cheese Tech",
    email: "skshinde@lsscdt.edu.in",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "f3",
    name: "Prof. Anil B. Kulkarni",
    designation: "Associate Professor & Head",
    department: "Department of Dairy Engineering",
    qualification: "M.Tech (Dairy Engineering)",
    experience: "16 Years",
    specialization: "Evaporation & Thermal Engineering",
    email: "abkulkarni@lsscdt.edu.in",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "f4",
    name: "Dr. Meena V. Patil",
    designation: "Associate Professor & Head",
    department: "Department of Dairy Chemistry",
    qualification: "Ph.D. (Food Chemistry)",
    experience: "15 Years",
    specialization: "Adulteration Detection & HPLC",
    email: "mvpatil@lsscdt.edu.in",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
  }
];

export const initialFacilities: Facility[] = [
  {
    id: "fac-plant",
    title: "500 LPD Dairy Processing Plant",
    category: "Plant",
    description: "State-of-the-art pilot processing plant with 500 Litres Per Day (LPD) capacity for milk pasteurization, cream separation, paneer, ghee, and curd/lassi manufacturing.",
    features: ["500 LPD Milk Pasteurization", "Paneer & Cheese Processing Vats", "Cream Separator & Ghee Kettle", "Automatic Pouch Packaging & Cold Storage"],
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "fac-lab",
    title: "Latest Laboratories",
    category: "Laboratories",
    description: "Fully equipped modern quality testing and research laboratories with Gerber centrifuges, FTIR milk analyzers, HPLC, laminar airflows, and spectrophotometers.",
    features: ["FTIR Milk Spectroscopy", "Microbiology Incubators & Biosafety", "Chemical Titration Desks", "Sensory & Quality Testing"],
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "fac-lib",
    title: "Complete Library",
    category: "Library",
    description: "Comprehensive learning resource center housing thousands of reference textbooks, scientific dairy journals, ICAR e-learning modules, and digital reading kiosks.",
    features: ["12,000+ Printed Reference Books", "CeRA E-Journal Access", "Digital Reading Kiosks", "Quiet Study Zone"],
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "fac-hostel",
    title: "Hostel Services",
    category: "Hostel",
    description: "Separate, secure student hostels for Boys and Girls with solar hot water systems, study rooms, 24/7 CCTV security, power backup, and mess facilities.",
    features: ["Separate Boys & Girls Hostels", "Solar Water Heaters", "Pure Veg Hygienic Mess", "24/7 CCTV & Security Guard"],
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "fac-smartroom",
    title: "Digital Smart Classroom",
    category: "Classroom",
    description: "Tech-enabled interactive classrooms with digital smart touchboards, high-definition projectors, acoustic sound systems, and video conferencing capabilities.",
    features: ["Interactive Smart Touchboards", "HD Projector & Sound System", "E-Learning & Virtual Lectures", "Ergonomic Air-Conditioned Seating"],
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "fac-bus",
    title: "Bus Service",
    category: "Transport",
    description: "Dedicated college bus fleet providing comfortable and safe daily transport connecting the campus with Malkapur city, railway station, bus stand, and surrounding routes.",
    features: ["Multiple Daily Commute Routes", "Safe Experienced Drivers", "GPS Fleet Tracking", "Punctual Morning & Evening Pickups"],
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "fac-medical",
    title: "Medical Service",
    category: "Healthcare",
    description: "On-campus medical first-aid care center equipped with essential emergency medicines, regular visiting doctor facility, and emergency transport tie-ups.",
    features: ["First-Aid Care Unit", "Visiting Qualified Doctor", "24/7 Emergency Ambulance Tie-up", "Annual Health Checkup Camps"],
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "fac-sports",
    title: "Sports Services",
    category: "Sports",
    description: "Spacious sports ground and indoor games facilities equipped for volleyball, cricket, badminton, table tennis, chess, and athletic events.",
    features: ["Volleyball & Cricket Pitch", "Indoor Badminton & Table Tennis", "Athletics & Track Gear", "Inter-College Sports Competitions"],
    image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "fac-canteen",
    title: "Canteen",
    category: "Canteen",
    description: "Hygienic campus canteen serving fresh, delicious vegetarian meals, snacks, beverages, and fresh dairy items like lassi and peda made on campus.",
    features: ["Fresh & Hygienic Veg Food", "Campus Fresh Dairy Snacks & Drinks", "Clean Dining Space", "Affordable Student Pricing"],
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=800&q=80"
  }
];

export const initialApplications: AdmissionApplication[] = [
  {
    id: "LSSCDT-2026-1042",
    fullName: "Rohan Suresh Deshmukh",
    fatherName: "Suresh R. Deshmukh",
    motherName: "Sunita S. Deshmukh",
    dob: "2007-04-14",
    gender: "Male",
    category: "OBC",
    email: "rohan.deshmukh2007@gmail.com",
    mobile: "9823145670",
    aadharNumber: "784512963012",
    address: "At Post Malkapur, Near Railway Station",
    district: "Buldhana",
    state: "Maharashtra",
    pincode: "443101",

    admissionYear: "First Year (1st Year)",
    admissionBranch: "B.Tech (Dairy Technology)",
    previousQualification: "12th Science / HSC",
    previousInstitute: "Malkapur High School & Junior College",
    previousBoardUniversity: "Maharashtra State Board (MSBSHSE)",
    previousPassingYear: "2026",
    previousStreamBranch: "Science (PCM)",
    previousObtainedMarks: 268,
    previousTotalMarks: 300,
    previousPercentage: 89.33,

    hscPcmMarks: 268,
    hscTotalMarks: 300,
    hscPercentage: 89.33,
    hscBoard: "Maharashtra State Board (MSBSHSE)",
    hscPassingYear: "2026",
    entranceExam: "MHT-CET",
    entranceRollNo: "26098412",
    entrancePercentile: 94.25,
    isAgriculturalist: true,
    isMaharashtraDomicile: true,
    status: "Verified",
    submissionDate: "2026-06-02",
    remarks: "All documents verified. Recommended for CAP Round 1 merit list.",
    documentsUploaded: {
      photo: true,
      signature: true,
      hscMarksheet: true,
      cetScoreCard: true,
      casteCertificate: true,
      domicileCertificate: true,
      agriculturalistCertificate: true
    },
    attachedFiles: [
      {
        id: "att-1",
        title: "12th Science Marksheet",
        fileName: "rohan_hsc_marksheet.pdf",
        fileSize: "1.4 MB",
        uploadedAt: "2026-06-02"
      },
      {
        id: "att-2",
        title: "MHT-CET Score Card",
        fileName: "cet_scorecard_2026.pdf",
        fileSize: "850 KB",
        uploadedAt: "2026-06-02"
      }
    ]
  },
  {
    id: "LSSCDT-2026-1088",
    fullName: "Ananya Nitin Kulkarni",
    fatherName: "Nitin P. Kulkarni",
    motherName: "Aarti N. Kulkarni",
    dob: "2007-09-08",
    gender: "Female",
    category: "OPEN",
    email: "ananya.kulkarni@yahoo.com",
    mobile: "9422918234",
    aadharNumber: "451298632041",
    address: "Dasarkhed Road, Malkapur",
    district: "Buldhana",
    state: "Maharashtra",
    pincode: "443101",

    admissionYear: "Direct Second Year (2nd Year - Lateral Entry)",
    admissionBranch: "B.Tech (Dairy Technology)",
    previousQualification: "Diploma (Dairy Tech / Food Tech / Engg)",
    previousInstitute: "Government Polytechnic College",
    previousBoardUniversity: "MSBTE Mumbai",
    previousPassingYear: "2025",
    previousStreamBranch: "Diploma in Dairy Technology",
    previousObtainedMarks: 880,
    previousTotalMarks: 1000,
    previousPercentage: 88.00,

    hscPcmMarks: 279,
    hscTotalMarks: 300,
    hscPercentage: 93.00,
    hscBoard: "CBSE",
    hscPassingYear: "2026",
    entranceExam: "Not Applicable (Lateral Entry)",
    entranceRollNo: "DIP-98421",
    entrancePercentile: 88.00,
    isAgriculturalist: false,
    isMaharashtraDomicile: true,
    status: "Provisionally Selected",
    submissionDate: "2026-06-04",
    remarks: "Seat allocated under Direct 2nd Year Diploma Lateral Entry.",
    documentsUploaded: {
      photo: true,
      signature: true,
      hscMarksheet: true,
      cetScoreCard: true,
      domicileCertificate: true
    },
    attachedFiles: [
      {
        id: "att-3",
        title: "Diploma Final Year Marksheet",
        fileName: "diploma_marksheet_ananya.pdf",
        fileSize: "2.1 MB",
        uploadedAt: "2026-06-04"
      }
    ]
  }
];

export const initialGallery: GalleryItem[] = [
  {
    id: "g1",
    title: "LSSCDT Building Facade Malkapur",
    category: "Campus",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    date: "2026-05-10"
  },
  {
    id: "g2",
    title: "50,000 LPD Dairy Plant Practical Training",
    category: "Dairy Plant",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    date: "2026-04-18"
  },
  {
    id: "g3",
    title: "Advanced Instrument QC Testing",
    category: "Lab",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
    date: "2026-03-22"
  },
  {
    id: "g4",
    title: "Annual DairyFest Technical Exhibition",
    category: "Events",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    date: "2026-02-15"
  }
];

export const initialAdminUsers: AdminUser[] = [
  {
    id: "admin-1",
    name: "Dr. S. K. Deshmukh (Principal / Head)",
    username: "admin",
    email: "admin@lsscdt.ac.in",
    password: "lsscdt2026",
    role: "Super Admin",
    mobile: "9822100001",
    securityQuestion: "What is the college code?",
    securityAnswer: "LSSCDT",
    createdAt: "2026-01-01"
  },
  {
    id: "admin-2",
    name: "Prof. P. R. Patil (Admission Incharge)",
    username: "admission_admin",
    email: "admissions@lsscdt.ac.in",
    password: "admin123",
    role: "Admission Incharge",
    mobile: "9822100002",
    securityQuestion: "What city is the college located in?",
    securityAnswer: "Malkapur",
    createdAt: "2026-01-15"
  },
  {
    id: "admin-3",
    name: "Dr. A. V. Shinde (Academic Dean)",
    username: "academic_admin",
    email: "academic@lsscdt.ac.in",
    password: "exam2026",
    role: "Academic Admin",
    mobile: "9822100003",
    securityQuestion: "What degree program is offered?",
    securityAnswer: "B.Tech Dairy",
    createdAt: "2026-02-01"
  }
];

