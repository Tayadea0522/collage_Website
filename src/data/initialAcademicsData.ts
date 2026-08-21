import { AcademicsData } from '../types';

export const initialAcademicsData: AcademicsData = {
  // 1. ADMISSIONS GROUP
  coursesOffered: {
    isActive: true,
    degreeTitle: "B.Tech (Dairy Technology)",
    courseName: "Bachelor of Technology in Dairy Technology",
    degreeType: "4-Year Full-Time Professional Degree Program",
    duration: "4 Years (8 Semesters)",
    numberOfSemesters: 8,
    affiliation: "Affiliated to Maharashtra Animal & Fishery Sciences University (MAFSU), Nagpur",
    approvalInfo: "Approved by ICAR, New Delhi & Govt. of Maharashtra",
    curriculumPattern: "ICAR VIth Deans' Committee Recommended Syllabus",
    careerScopeHeading: "Broad Professional Scope & Industry Demands",
    careerOpportunities: [
      {
        id: "co-1",
        title: "Dairy Plant Operations & Production Management",
        description: "Managerial and executive roles overseeing milk processing, pasteurization, packaging, and high-tech manufacturing plants.",
        displayOrder: 1
      },
      {
        id: "co-2",
        title: "Quality Assurance, Food Safety & QC Analytics",
        description: "Chemical and microbiological testing of milk and dairy derivatives adhering to FSSAI and global export standards.",
        displayOrder: 2
      },
      {
        id: "co-3",
        title: "R&D, Sensory Evaluation & Product Formulation",
        description: "Formulation of novel functional dairy foods, probiotics, nutraceuticals, artisanal cheeses, and plant-dairy hybrids.",
        displayOrder: 3
      },
      {
        id: "co-4",
        title: "Supply Chain, Cold Storage & Dairy Logistics",
        description: "Optimization of farm-to-consumer cold chain networks, bulk milk chilling centers, and procurement logistics.",
        displayOrder: 4
      },
      {
        id: "co-5",
        title: "Government Dairy Development & Regulatory Officers",
        description: "Technical officers in NDDB, FSSAI, State Dairy Development Boards, and research organizations.",
        displayOrder: 5
      }
    ],
    applyButtonText: "Apply for 2026–27 Admission",
    applyButtonUrl: "portal"
  },

  intakeCapacity: {
    isActive: true,
    sectionTitle: "Official Seat Matrix & Reservation Framework",
    academicYear: "2026–27",
    totalIntake: 64,
    totalIntakeLabel: "64 Sanctioned Seats",
    stateQuotaPercentage: "80%",
    stateQuotaNote: "51 Seats through MCAER / State CET Cell Centralized Allotment Process (CAP)",
    institutionalQuotaPercentage: "20%",
    institutionalQuotaNote: "13 Seats under Institute / Management Level Quota as per State Government Norms",
    quotas: [
      {
        id: "iq-1",
        title: "Centralized Admission Process (CAP) Quota",
        seatsOrPercentage: "80% (51 Seats)",
        badge: "State Merit",
        description: "Allotted via Centralized Admission rounds conducted by Maharashtra State CET Cell & MCAER Pune based on MHT-CET / NEET / JEE percentiles.",
        isActive: true,
        displayOrder: 1
      },
      {
        id: "iq-2",
        title: "Institutional / Management Level Quota",
        seatsOrPercentage: "20% (13 Seats)",
        badge: "Institute Level",
        description: "Filled at institute level following merit and eligibility criteria as mandated by the Directorate of AH & Dairy Development, Maharashtra.",
        isActive: true,
        displayOrder: 2
      },
      {
        id: "iq-3",
        title: "Agriculturalist Weightage (7/12 & Certificate)",
        seatsOrPercentage: "12% Weightage",
        badge: "Agr. Weightage",
        description: "12% additional marks weightage granted for candidates possessing valid Agriculturist certificate and 7/12 land revenue extracts.",
        isActive: true,
        displayOrder: 3
      },
      {
        id: "iq-4",
        title: "Constitutional Reservations (SC / ST / VJ / NT / OBC / EWS)",
        seatsOrPercentage: "As per Govt. Rules",
        badge: "Statutory",
        description: "Statutory reservation benefits applicable for Maharashtra domicile candidates with valid Caste Certificate, Validity, and Non-Creamy Layer.",
        isActive: true,
        displayOrder: 4
      }
    ]
  },

  eligibility: {
    isActive: true,
    heading: "Admission Eligibility Matrix & Qualifying Exam Requirements",
    subtitle: "Criteria prescribed by Maharashtra Animal & Fishery Sciences University (MAFSU) & MCAER Pune",
    items: [
      {
        id: "el-1",
        title: "Qualifying Board Examination (10+2 / HSC)",
        description: "Candidate must have passed XII Std. (10+2 pattern) examination from Maharashtra State Board of Higher Secondary Education or an equivalent recognized Board.",
        requiredSubjects: "Physics, Chemistry, Mathematics and/or Biology, and English",
        minimumMarks: "50% aggregate in PCM/PCB (40% for SC/ST/VJ/NT/OBC/SBC/EWS & PwD categories of Maharashtra State)",
        entranceExams: "Valid score/percentile in MHT-CET / NEET / JEE (Main)",
        notes: "Candidates who have not offered Mathematics or Biology at 10+2 level shall have to complete deficiency remedial courses as prescribed by MAFSU Nagpur.",
        badge: "Mandatory Criteria",
        isActive: true,
        displayOrder: 1
      },
      {
        id: "el-2",
        title: "Entrance Examination Participation",
        description: "Candidate must have appeared in MHT-CET (PCB/PCM) / NEET-UG / JEE (Main) conducted in the current academic year and hold a non-zero score card.",
        requiredSubjects: "Physics, Chemistry, and Mathematics/Biology",
        minimumMarks: "Non-zero positive percentile / score in relevant state/national entrance examination",
        entranceExams: "MHT-CET / NEET / JEE",
        notes: "CET Cell normalized percentile is considered for CAP merit list generation.",
        badge: "Entrance Exam",
        isActive: true,
        displayOrder: 2
      },
      {
        id: "el-3",
        title: "Age & Domicile Criteria",
        description: "Candidate must have completed 17 years of age on or before 31st December of the admission year. Maharashtra State candidates must produce valid Domicile Certificate.",
        notes: "Other State (OMS) candidates are also eligible to apply through All India quota or Institutional rounds as per university directives.",
        badge: "Age & Nationality",
        isActive: true,
        displayOrder: 3
      }
    ]
  },

  admissionProcess: {
    isActive: true,
    introText: "Online centralized admission process is conducted by Maharashtra Council of Agriculture Education & Research (MCAER), Pune and CET Cell after the declaration of results of MHT-CET/NEET/JEE. The standard procedure is outlined below:",
    capRegistrationUrl: "https://cetcell.mahacet.org/",
    capRegistrationButtonText: "Visit State CET Cell Portal",
    steps: [
      {
        id: "step-1",
        stepNumber: 1,
        title: "Declaration of Results of MHT-CET / NEET / JEE",
        description: "Entrance examination authorities declare official scorecards and percentiles.",
        isActive: true,
        displayOrder: 1
      },
      {
        id: "step-2",
        stepNumber: 2,
        title: "Online CAP Registration & Form Filling",
        description: "Eligible aspirants submit online application on the official Maharashtra State CET Cell / MCAER portal.",
        linkUrl: "https://cetcell.mahacet.org/",
        linkText: "Visit State CET Portal",
        isActive: true,
        displayOrder: 2
      },
      {
        id: "step-3",
        stepNumber: 3,
        title: "Document Upload & E-Scrutiny",
        description: "Upload academic credentials, category certificates, 7/12 extracts, and entrance scorecards for verification.",
        isActive: true,
        displayOrder: 3
      },
      {
        id: "step-4",
        stepNumber: 4,
        title: "Display of Provisional & Final Merit List",
        description: "CET Cell publishes the state merit list after addressing grievances.",
        isActive: true,
        displayOrder: 4
      },
      {
        id: "step-5",
        stepNumber: 5,
        title: "Option Form Filling (College Preferences)",
        description: "Select Late Shaktikumar Sancheti College of Dairy Technology (LSSCDT), Malkapur as preferred institute.",
        isActive: true,
        displayOrder: 5
      },
      {
        id: "step-6",
        stepNumber: 6,
        title: "Round-Wise Seat Allotment Publication",
        description: "Allotment lists released for CAP Round I, Round II, and Institutional Mop-Up rounds.",
        isActive: true,
        displayOrder: 6
      },
      {
        id: "step-7",
        stepNumber: 7,
        title: "Physical Reporting to LSSCDT Malkapur",
        description: "Report to college campus with all original documents, photos, and demand draft / online fee receipt within scheduled window.",
        isActive: true,
        displayOrder: 7
      },
      {
        id: "step-8",
        stepNumber: 8,
        title: "Document Verification & Biometrics",
        description: "Verification of original certificates by the college admission committee.",
        isActive: true,
        displayOrder: 8
      },
      {
        id: "step-9",
        stepNumber: 9,
        title: "Final Fee Payment & Admission Confirmation",
        description: "Issuance of university enrollment acknowledgement and official admission confirmation slip.",
        isActive: true,
        displayOrder: 9
      }
    ]
  },

  documentsRequired: {
    isActive: true,
    heading: "Mandatory Document Checklist for Physical Verification",
    subtitle: "Submit 1 set of Original Documents along with 3 sets of self-attested photocopies during reporting",
    documents: [
      {
        id: "doc-1",
        name: "HSC / 12th Standard Marksheet & Passing Certificate",
        description: "Original statement of marks along with board certificate.",
        isMandatory: true,
        isActive: true,
        displayOrder: 1
      },
      {
        id: "doc-2",
        name: "SSC / 10th Standard Marksheet & Passing Certificate",
        description: "Proof of date of birth and secondary school passing.",
        isMandatory: true,
        isActive: true,
        displayOrder: 2
      },
      {
        id: "doc-3",
        name: "MHT-CET / NEET / JEE (Main) Scorecard 2026",
        description: "Official printed entrance examination result scorecard.",
        isMandatory: true,
        isActive: true,
        displayOrder: 3
      },
      {
        id: "doc-4",
        name: "College Leaving Certificate (T.C. / L.C.)",
        description: "Original transfer certificate from the last attended junior college.",
        isMandatory: true,
        isActive: true,
        displayOrder: 4
      },
      {
        id: "doc-5",
        name: "Domicile & Nationality Certificate",
        description: "Issued by competent Executive Magistrate / Tahsildar.",
        isMandatory: true,
        isActive: true,
        displayOrder: 5
      },
      {
        id: "doc-6",
        name: "Caste Certificate & Caste Validity Certificate",
        description: "Mandatory for SC, ST, VJ, NT, OBC, SBC category applicants of Maharashtra State.",
        isMandatory: false,
        isActive: true,
        displayOrder: 6
      },
      {
        id: "doc-7",
        name: "Non-Creamy Layer Certificate (Valid for Current Financial Year)",
        description: "Applicable for VJ, NT, OBC, SBC and EWS category candidates.",
        isMandatory: false,
        isActive: true,
        displayOrder: 7
      },
      {
        id: "doc-8",
        name: "7/12 Land Revenue Extract / Agriculturist Certificate",
        description: "Required for claiming 12% agriculturist weightage (in name of father/mother/grandfather).",
        isMandatory: false,
        isActive: true,
        displayOrder: 8
      },
      {
        id: "doc-9",
        name: "Aadhaar Card Photocopy & 6 Passport Size Color Photographs",
        description: "Identity verification and official MAFSU enrollment record.",
        isMandatory: true,
        isActive: true,
        displayOrder: 9
      }
    ]
  },

  feesStructure: {
    isActive: true,
    heading: "Annual Academic Fee Structure (2026–27)",
    academicYear: "2026–27",
    feeRows: [
      {
        id: "fee-1",
        category: "Open / General Category",
        tuitionFee: "₹ 65,000",
        otherFee: "₹ 15,000",
        totalNetFee: "₹ 80,000",
        notes: "Includes Tuition, Library, Laboratory, University Examination, and Sports Gymkhana Fees.",
        isActive: true,
        displayOrder: 1
      },
      {
        id: "fee-2",
        category: "OBC / EBC / EWS Category",
        tuitionFee: "₹ 32,500",
        otherFee: "₹ 15,000",
        totalNetFee: "₹ 47,500",
        notes: "50% Tuition fee concession credited through MahaDBT Government Scholarship scheme.",
        isActive: true,
        displayOrder: 2
      },
      {
        id: "fee-3",
        category: "SC / ST / VJ / NT / SBC Category",
        tuitionFee: "Nil (100% Freeship)",
        otherFee: "₹ 5,000",
        totalNetFee: "₹ 5,000",
        notes: "Tuition and development fees 100% subsidized by Social Welfare & Tribal Development Dept.",
        isActive: true,
        displayOrder: 3
      },
      {
        id: "fee-4",
        category: "Institutional / Management Level Quota",
        tuitionFee: "₹ 1,10,000",
        otherFee: "₹ 20,000",
        totalNetFee: "₹ 1,30,000",
        notes: "As approved by Fees Regulating Authority (FRA) & MAFSU Nagpur for institutional admissions.",
        isActive: true,
        displayOrder: 4
      }
    ]
  },

  admissionEnquiry: {
    isActive: true,
    heading: "Centralized Admission Counseling & Enquiry Cell",
    description: "Get in touch with our expert academic advisors for personalized admission assistance, eligibility verification, scholarship application guidance, and campus tours.",
    phoneNumbers: "+91 8625869560 / +91 9422880000",
    email: "admissions@lsscdt.edu.in",
    officeAddress: "Admission Counseling Cell, Administrative Building, LSSCDT Campus, Dasarkhed MIDC Road, Malkapur – 443101, Dist. Buldhana (M.S.)",
    workingHours: "Monday to Saturday: 9:30 AM to 5:30 PM (Except Public Holidays)",
    whatsappNumber: "918625869560",
    whatsappLink: "https://wa.me/918625869560?text=Hello%20LSSCDT%20Admissions,%20I%20would%20like%20to%20know%20more%20about%20B.Tech%20Dairy%20Technology%20admissions."
  },

  admissionPortal: {
    isActive: true,
    title: "Official Direct Admission Application Portal",
    academicYear: "2026–27",
    description: "Register online in 3 easy steps: Candidate Profile, Academic Marks Entry, and Mandatory Document Upload.",
    buttonText: "Register Online Now",
    statusBadge: "Admissions Open"
  },

  admissionProspectus: {
    isActive: true,
    title: "Official Information Prospectus & Academic Brochure 2026–27",
    description: "Download the complete informational brochure detailing B.Tech (Dairy Technology) curriculum, pilot dairy plant features, career placements, and fee policies."
  },

  trackApplicationStatus: {
    isActive: true,
    heading: "Track Live Application Verification Status",
    description: "Check the live verification status of your online registration using your Application ID or registered Mobile Number.",
    buttonText: "Search Status",
    instructions: "Enter your assigned Application ID (e.g. LSSCDT-2026-1042) or registered 10-digit mobile number."
  },

  // 2. ACADEMICS GROUP
  programOverview: {
    isActive: true,
    programTitle: "B.Tech (Dairy Technology) Degree Program Specifications",
    degreeName: "Bachelor of Technology in Dairy Technology",
    duration: "4 Years (8 Semesters)",
    mediumOfInstruction: "English",
    curriculumFramework: "ICAR VIth Deans' Committee",
    affiliation: "Maharashtra Animal & Fishery Sciences University (MAFSU), Nagpur",
    approval: "Indian Council of Agricultural Research (ICAR), New Delhi & Govt. of Maharashtra",
    description: "The B.Tech (Dairy Technology) is a specialized 4-year professional engineering degree program designed to train technocrats, researchers, and quality controllers for the modern dairy and food processing industry. The program seamlessly integrates engineering principles with biochemistry, microbiology, plant management, and business analytics.",
    objectives: [
      "Develop skilled dairy technologists equipped with practical knowledge of commercial dairy plant machinery and automation.",
      "Impart deep understanding of milk chemistry, quality assurance, microbiology, and food safety regulations (FSSAI, ISO, HACCP).",
      "Foster entrepreneurial mindsets and hands-on operational leadership through experiential learning in commercial pilot plants.",
      "Facilitate 100% campus placement in leading national and international dairy cooperatives and corporations."
    ],
    highlights: [
      "Commercial 500 LPD On-Campus Pilot Dairy Processing Plant with Automated Processing Lines",
      "Modern Chemical, Microbiological & Instrumental QC Testing Laboratories",
      "One Full Year of Industry In-Plant Training (IPT) & Hands-on Experiential Learning (ELP)",
      "Approved by ICAR New Delhi & Affiliated to MAFSU Nagpur with 100% Placement Record"
    ],
    careerOpportunities: [
      "Dairy Plant Technical Manager / General Manager",
      "Quality Assurance & Quality Control Executive",
      "Sensory Analyst & Product Development Scientist",
      "Food Safety Officer (FSSAI / Central / State)",
      "Dairy Entrepreneur / Dairy Processing Plant Owner",
      "Procurement & Supply Chain Logistics Specialist"
    ],
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
  },

  curriculumSyllabus: {
    isActive: true,
    heading: "Semester-Wise Syllabi & Course Scheme",
    subtitle: "Comprehensive curriculum framework structured according to ICAR VIth Deans' Committee guidelines",
    semesters: [
      {
        id: "sem-1",
        sem: 1,
        title: "Semester I — Foundation Sciences & Dairy Technology Essentials",
        courses: [
          { id: "c-1-1", code: "DT-111", name: "Market Milk & Milk Processing", credits: "3 (2+1)", type: "Both", displayOrder: 1 },
          { id: "c-1-2", code: "DC-111", name: "Biochemistry of Milk & Dairy Products", credits: "3 (2+1)", type: "Both", displayOrder: 2 },
          { id: "c-1-3", code: "DM-111", name: "Fundamentals of Dairy Microbiology", credits: "3 (2+1)", type: "Both", displayOrder: 3 },
          { id: "c-1-4", code: "DE-111", name: "Thermodynamics & Engineering Mechanics", credits: "3 (2+1)", type: "Both", displayOrder: 4 },
          { id: "c-1-5", code: "DBM-111", name: "Economics & Applied Dairy Development", credits: "2 (2+0)", type: "Theory", displayOrder: 5 },
          { id: "c-1-6", code: "COMP-111", name: "Computer Programming & Data Processing", credits: "2 (1+1)", type: "Both", displayOrder: 6 }
        ]
      },
      {
        id: "sem-2",
        sem: 2,
        title: "Semester II — Traditional Dairy Products & Engineering Systems",
        courses: [
          { id: "c-2-1", code: "DT-121", name: "Traditional Indian Dairy Products", credits: "3 (2+1)", type: "Both", displayOrder: 1 },
          { id: "c-2-2", code: "DC-121", name: "Organic & Physical Chemistry of Milk", credits: "3 (2+1)", type: "Both", displayOrder: 2 },
          { id: "c-2-3", code: "DM-121", name: "Microbiology of Starter Cultures", credits: "3 (2+1)", type: "Both", displayOrder: 3 },
          { id: "c-2-4", code: "DE-121", name: "Dairy Engineering Mechanics & Fluid Flow", credits: "3 (2+1)", type: "Both", displayOrder: 4 },
          { id: "c-2-5", code: "DBM-121", name: "Principles of Industrial Management", credits: "2 (2+0)", type: "Theory", displayOrder: 5 }
        ]
      },
      {
        id: "sem-3",
        sem: 3,
        title: "Semester III — Fat-Rich Dairy Products & Refrigeration Tech",
        courses: [
          { id: "c-3-1", code: "DT-211", name: "Fat-Rich Dairy Products (Butter, Ghee, Spreads)", credits: "3 (2+1)", type: "Both", displayOrder: 1 },
          { id: "c-3-2", code: "DE-211", name: "Refrigeration & Air Conditioning Engineering", credits: "3 (2+1)", type: "Both", displayOrder: 2 },
          { id: "c-3-3", code: "DC-211", name: "Chemistry of Dairy Products & Additives", credits: "3 (2+1)", type: "Both", displayOrder: 3 },
          { id: "c-3-4", code: "DM-211", name: "Microbiology of Dairy Products & Spoilage", credits: "3 (2+1)", type: "Both", displayOrder: 4 },
          { id: "c-3-5", code: "STAT-211", name: "Applied Statistics for Dairy Sciences", credits: "2 (1+1)", type: "Both", displayOrder: 5 }
        ]
      },
      {
        id: "sem-4",
        sem: 4,
        title: "Semester IV — Cheese Technology, Ice Cream & Thermal Processing",
        courses: [
          { id: "c-4-1", code: "DT-221", name: "Cheese & Fermented Milk Products Technology", credits: "3 (2+1)", type: "Both", displayOrder: 1 },
          { id: "c-4-2", code: "DT-222", name: "Ice-Cream & Frozen Dessert Technology", credits: "3 (2+1)", type: "Both", displayOrder: 2 },
          { id: "c-4-3", code: "DE-221", name: "Dairy Process Equipment Design & Plant Layout", credits: "3 (2+1)", type: "Both", displayOrder: 3 },
          { id: "c-4-4", code: "DC-221", name: "Chemical Quality Assurance & Analytical Instruments", credits: "3 (1+2)", type: "Both", displayOrder: 4 },
          { id: "c-4-5", code: "DBM-221", name: "Dairy Marketing, Export & Financial Management", credits: "3 (2+1)", type: "Both", displayOrder: 5 }
        ]
      },
      {
        id: "sem-5",
        sem: 5,
        title: "Semester V — Condensed & Dried Milks, Membrane Filtration & QC",
        courses: [
          { id: "c-5-1", code: "DT-311", name: "Condensed & Dried Milks (Milk Powders, Infant Formula)", credits: "3 (2+1)", type: "Both", displayOrder: 1 },
          { id: "c-5-2", code: "DT-312", name: "By-Products Technology & Membrane Filtration", credits: "3 (2+1)", type: "Both", displayOrder: 2 },
          { id: "c-5-3", code: "DE-311", name: "Instrumentation, Process Automation & SCADA", credits: "3 (2+1)", type: "Both", displayOrder: 3 },
          { id: "c-5-4", code: "DM-311", name: "Quality Assurance & Food Safety Systems (HACCP)", credits: "3 (2+1)", type: "Both", displayOrder: 4 },
          { id: "c-5-5", code: "DT-313", name: "Packaging of Dairy Products & Novel Polymers", credits: "3 (2+1)", type: "Both", displayOrder: 5 }
        ]
      },
      {
        id: "sem-6",
        sem: 6,
        title: "Semester VI — Food Technology, Sensory Science & Waste Management",
        courses: [
          { id: "c-6-1", code: "DT-321", name: "Food Technology & Preservation Engineering", credits: "3 (2+1)", type: "Both", displayOrder: 1 },
          { id: "c-6-2", code: "DT-322", name: "Sensory Evaluation of Dairy Products", credits: "2 (1+1)", type: "Both", displayOrder: 2 },
          { id: "c-6-3", code: "DE-321", name: "Dairy Plant Utilities, Energy Audit & Effluent Treatment", credits: "3 (2+1)", type: "Both", displayOrder: 3 },
          { id: "c-6-4", code: "DBM-321", name: "Dairy Business Management & Project Formulation", credits: "3 (2+1)", type: "Both", displayOrder: 4 },
          { id: "c-6-5", code: "DBM-322", name: "Entrepreneurship Development & Intellectual Property", credits: "2 (1+1)", type: "Both", displayOrder: 5 }
        ]
      },
      {
        id: "sem-7",
        sem: 7,
        title: "Semester VII — Experiential Learning Program (ELP Pilot Plant)",
        courses: [
          { id: "c-7-1", code: "ELP-411", name: "Commercial Pilot Dairy Plant Operation & Production", credits: "10 (0+10)", type: "Hands-on / In-Plant", displayOrder: 1 },
          { id: "c-7-2", code: "ELP-412", name: "Hands-on Product Formulation, QC & Marketing", credits: "10 (0+10)", type: "Hands-on / In-Plant", displayOrder: 2 }
        ]
      },
      {
        id: "sem-8",
        sem: 8,
        title: "Semester VIII — Industry In-Plant Training (IPT in Mega Dairies)",
        courses: [
          { id: "c-8-1", code: "IPT-421", name: "Industrial In-Plant Training in Commercial Mega Dairies", credits: "20 (0+20)", type: "Hands-on / In-Plant", displayOrder: 1 }
        ]
      }
    ]
  },

  academicCalendar: {
    isActive: true,
    heading: "Academic Calendar & Examination Schedule (2026–27)",
    academicYear: "2026–27",
    terms: [
      {
        id: "term-1",
        termTitle: "Odd Semesters (Sem I, III, V, VII)",
        commencementDate: "August 1, 2026",
        midTermDate: "October 12–20, 2026",
        semesterEndDate: "December 10–24, 2026",
        displayOrder: 1,
        events: [
          { id: "ev-1", eventName: "Commencement of Classes & Orientation", dateRange: "August 1, 2026", displayOrder: 1 },
          { id: "ev-2", eventName: "Mid-Term Examinations", dateRange: "October 12–20, 2026", displayOrder: 2 },
          { id: "ev-3", eventName: "Diwali Semester Break", dateRange: "November 1–10, 2026", displayOrder: 3 },
          { id: "ev-4", eventName: "Semester End Theory & Practical Exams", dateRange: "December 10–24, 2026", displayOrder: 4 }
        ]
      },
      {
        id: "term-2",
        termTitle: "Even Semesters (Sem II, IV, VI, VIII)",
        commencementDate: "January 5, 2027",
        midTermDate: "March 15–22, 2027",
        semesterEndDate: "May 10–25, 2027",
        displayOrder: 2,
        events: [
          { id: "ev-5", eventName: "Commencement of Classes", dateRange: "January 5, 2027", displayOrder: 1 },
          { id: "ev-6", eventName: "Annual Sports & Cultural Meet", dateRange: "February 18–21, 2027", displayOrder: 2 },
          { id: "ev-7", eventName: "Mid-Term Examinations", dateRange: "March 15–22, 2027", displayOrder: 3 },
          { id: "ev-8", eventName: "Semester End Theory & Practical Exams", dateRange: "May 10–25, 2027", displayOrder: 4 }
        ]
      }
    ]
  },

  academicRegulations: {
    isActive: true,
    heading: "Academic Regulations, Attendance Rules & Evaluation Scheme",
    sections: [
      {
        id: "reg-1",
        title: "Minimum Attendance Policy",
        content: "Minimum 80% attendance in theory lectures and practical laboratories is mandatory for each course to be eligible to appear for MAFSU University End-Semester examinations. A maximum relaxation of 5% may be granted by the Dean on valid medical grounds.",
        displayOrder: 1,
        isActive: true
      },
      {
        id: "reg-2",
        title: "Evaluation & Grading Framework",
        content: "Continuous evaluation consists of 20% mid-term written test, 10% practical assessment & assignments, and 70% University End-Semester Theory & Practical Examination. The passing standard requires minimum 50% aggregate in each individual course.",
        displayOrder: 2,
        isActive: true
      },
      {
        id: "reg-3",
        title: "Discipline & Anti-Ragging Norms",
        content: "Ragging in any form is strictly prohibited on campus and in student hostels as per the directions of Supreme Court of India and UGC/ICAR Regulations. Strict compliance with code of conduct is mandatory.",
        displayOrder: 3,
        isActive: true
      },
      {
        id: "reg-4",
        title: "Industrial Training (IPT) & Experiential Learning (ELP) Guidelines",
        content: "Students undergoing In-Plant Training in mega dairies must maintain daily logbooks, submit a comprehensive project report, and appear for final viva-voce before a university panel.",
        displayOrder: 4,
        isActive: true
      }
    ]
  }
};
