export interface PolicyClause {
  title: string;
  text: string;
}

export interface PolicyData {
  id: string;
  title: string;
  category: 'Core Agreements' | 'Fee & Billing Rules' | 'Academic Integrity' | 'Security & Data Use' | 'Regulatory & Compliance';
  lastUpdated: string;
  iconName: string;
  summary: string;
  clauses: PolicyClause[];
}

export const defaultPolicies: PolicyData[] = [
  {
    id: 'terms',
    title: 'Terms of Service & Conditions',
    category: 'Core Agreements',
    lastUpdated: 'June 2026',
    iconName: 'FileText',
    summary: 'Governing user access, enrollment registrations, digital study portals, and fee schedules.',
    clauses: [
      {
        title: '1. Agreement Acceptance',
        text: 'By registering, accessing the formula compiler, downloading graded test sheets, or initiating fee payments on Concept Made Easy (CME), you agree to be bound by these Terms of Service. If you do not agree, please do not use our portals.'
      },
      {
        title: '2. Eligibility and Enrollment',
        text: 'Students enrolled in CBSE, JEE, NEET, or school tuition must have parental consent if under 18. All enrollment details provided must be truthful and accurate.'
      },
      {
        title: '3. Compliance and Verification',
        text: 'As per academic compliance in India, active test portals require Aadhaar verification to prevent proxy examinees. Suspicion of proxy testing results in immediate account lockdown.'
      },
      {
        title: '4. Service Scope',
        text: 'CME provides digital classrooms, live lectures, curated study sets, and AI-powered doubt solving. We reserve the right to alter batch schedules or switch mentors for optimal educational delivery.'
      }
    ]
  },
  {
    id: 'privacy',
    title: 'Privacy & Data Protection Policy',
    category: 'Core Agreements',
    lastUpdated: 'June 2026',
    iconName: 'Shield',
    summary: 'How CME collects, stores, secures, and handles student identity and academic telemetry.',
    clauses: [
      {
        title: '1. Data Collection Scope',
        text: 'We collect name, email, contact number, school grade, stream selection, and uploaded identification documents (Aadhaar or equivalent) required for KYC compliance.'
      },
      {
        title: '2. Class Recording and Visual Shielding',
        text: 'Live digital whiteboard lectures are recorded for revision purposes. Peer chat logs and audio interactions are encrypted and shielded from third-party advertising algorithms.'
      },
      {
        title: '3. Security Standards',
        text: 'CME employs industry-standard 256-bit encryption. CME does not collect card numbers, CVVs, UPI PINs, or banking passwords on this website. Fees are paid directly through the published CME UPI QR and the transaction reference is used for manual reconciliation.'
      },
      {
        title: '4. Your Privacy Rights',
        text: 'Students and guardians can review, update, or request permanent deletion of their personal identity records by sending a request to conceptmadeeasyclasses@gmail.com.'
      }
    ]
  },
  {
    id: 'refund',
    title: 'Refund & Cancellation Policy',
    category: 'Core Agreements',
    lastUpdated: 'June 2026',
    iconName: 'RotateCcw',
    summary: 'Transparent, time-bound refund brackets designed under the Consumer Protection Act, 2019.',
    clauses: [
      {
        title: '1. Time-Bound Refund Brackets',
        text: 'A 100% tuition fee refund is applicable if a written withdrawal request is submitted within 7 calendar days from enrollment. A pro-rata refund (deducting scheduled classes held) applies between 7 to 14 days. No refunds are granted beyond 14 calendar days from enrollment.'
      },
      {
        title: '2. Exclusion of Standalone Digital Assets',
        text: 'Fees paid for standalone items like the Graded Test Series, instant downloadable PYQ papers, formula cheat sheets, or specific short-term board exam crash courses are strictly non-refundable.'
      },
      {
        title: '3. Payment Modes and Settlement SLA',
        text: 'Approved refunds are handled against the verified UPI transaction reference and returned through the appropriate payment channel, subject to bank processing timelines.'
      },
      {
        title: '4. Claim Procedure',
        text: 'To initiate a withdrawal and request a refund, please send an official email with your Payment ID and Registered Email to conceptmadeeasyclasses@gmail.com.'
      }
    ]
  },
  {
    id: 'transfer',
    title: 'Course & Batch Transfer Policy',
    category: 'Core Agreements',
    lastUpdated: 'June 2026',
    iconName: 'RefreshCw',
    summary: 'Regulatory rules for swapping batch slots, course streams, and scheduled learning blocks.',
    clauses: [
      {
        title: '1. Slot Timing Transfer',
        text: 'Students can request transfer to a different batch timing slot up to two times in an academic term, subject to seat vacancy in the target batch.'
      },
      {
        title: '2. Stream & Subject Switches',
        text: 'Switches between Science and Commerce streams (Grades 11 & 12) or subject-specific blocks (e.g., swapping a Mathematics slot for Physics) must be submitted at least 48 hours prior to the module start.'
      },
      {
        title: '3. Strict Account Non-Transferability',
        text: 'Registered CME student accounts, active portal licenses, and compiled study history are personal. They cannot be transferred, sold, or shared with siblings, friends, or third parties.'
      },
      {
        title: '4. Processing Timelines',
        text: 'Validated transfer requests carry zero administrative fees and are updated in the virtual classroom directory within 24 working hours of coordinator approval.'
      }
    ]
  },
  {
    id: 'pricing',
    title: 'Pricing & Fee Structure Policy',
    category: 'Fee & Billing Rules',
    lastUpdated: 'June 2026',
    iconName: 'DollarSign',
    summary: 'Clear definitions of flat tuition prices, government taxation, and installment grace periods.',
    clauses: [
      {
        title: '1. Pricing Transparency',
        text: 'All tuition, test series, and board prep course fees are displayed upfront under the Programs & Fees section. CME does not charge hidden admission or administrative fees.'
      },
      {
        title: '2. GST Compliance',
        text: 'As per educational service taxation laws in India, all fees processed through our website are subject to a standard 18% Goods and Services Tax (GST), clearly detailed on your payment invoice.'
      },
      {
        title: '3. Installment Facility & Schedules',
        text: 'For annual coaching packages, guardians can choose the EMI option. Installments are billed on the 1st of every month. A 5-day grace period is provided.'
      },
      {
        title: '4. Installment Default Penalty',
        text: 'Failure to settle monthly dues beyond the grace period results in a temporary suspension of portal logins. Interactive classroom access is unlocked immediately upon payment reconciliation.'
      }
    ]
  },
  {
    id: 'payments',
    title: 'Secure Payments & Billing Policy',
    category: 'Fee & Billing Rules',
    lastUpdated: 'June 2026',
    iconName: 'CreditCard',
    summary: 'Direct UPI QR payment safety, transaction references, and reconciliation of payment submissions.',
    clauses: [
      {
        title: '1. Secure Gateway Partners',
        text: 'Online fees are currently collected through the CME payment QR displayed in the student portal. No card-payment gateway is currently enabled.'
      },
      {
        title: '2. Zero Payment Credentials Storage',
        text: 'CME servers do not capture, record, or store any confidential banking data, card numbers, CVVs, or secure UPI PINs.'
      },
      {
        title: '3. Handling Failed Transactions',
        text: 'If money is debited but the portal status remains pending, keep the UPI transaction reference and contact CME support for manual reconciliation. Any bank-side reversal follows the bank or UPI provider timeline.'
      },
      {
        title: '4. Disputed Charges',
        text: 'In cases of duplicate charges, send the UPI transaction references to the CME billing desk so the payment records can be checked and the appropriate resolution can be initiated.'
      }
    ]
  },
  {
    id: 'delivery',
    title: 'Enrollment Fulfillment & Delivery',
    category: 'Fee & Billing Rules',
    lastUpdated: 'June 2026',
    iconName: 'Truck',
    summary: 'Fulfillment matrices for instant digital features and tracked physical course kits.',
    clauses: [
      {
        title: '1. Immediate Digital Access',
        text: 'After payment verification, access to virtual classrooms, the formula sheet compiler, doubt portals, and mock tests can be provisioned by CME administration.'
      },
      {
        title: '2. Physical Materials Dispatch',
        text: 'For premium programs, printed test bundles, formula booklets, and cheatsheets are dispatched from our Bengaluru center within 48 hours.'
      },
      {
        title: '3. Shipping Timelines & Tracking',
        text: 'We deliver materials across India within 5 to 7 working days. A tracking link is automatically shared via SMS and on the student portal.'
      },
      {
        title: '4. Damage and Replacement Guarantee',
        text: 'In the rare event of receiving water-damaged or misprinted study booklets, submit a support ticket within 48 hours for a free replacement.'
      }
    ]
  },
  {
    id: 'termination',
    title: 'Termination of Service Policy',
    category: 'Fee & Billing Rules',
    lastUpdated: 'June 2026',
    iconName: 'PowerOff',
    summary: 'Grounds and procedures for temporary lockout or permanent student account revocation.',
    clauses: [
      {
        title: '1. Grounds for Termination',
        text: 'CME may suspend or terminate service logins in cases of severe code of conduct violations, unpaid tuition fees, copyright piracy, or cyber-harassment inside classrooms.'
      },
      {
        title: '2. Multiple IP Login Violations',
        text: 'Sharing password credentials to allow concurrent logins from multiple geographical regions triggers an automatic safety lockdown by our firewall.'
      },
      {
        title: '3. Appeal Mechanism',
        text: 'Students whose accounts have been temporarily suspended can submit an appeal ticket via the Grievance Panel. CEO Gauri Gupta personally reviews all escalations.'
      },
      {
        title: '4. Post-Termination Status',
        text: 'Permanent terminations for code violations or IP theft carry an absolute forfeiture of fees; no refund claims are entertained under these circumstances.'
      }
    ]
  },
  {
    id: 'honor-code',
    title: 'Honor Code & Academic Integrity',
    category: 'Academic Integrity',
    lastUpdated: 'June 2026',
    iconName: 'BookOpen',
    summary: 'Standards of high personal honesty, authentic test performance, and conceptual effort.',
    clauses: [
      {
        title: '1. Integrity in Test Submissions',
        text: 'Students must solve test papers, homework, and weekly boards preparation mock exams individually without using search engines, chat-bots, or external assistance.'
      },
      {
        title: '2. Healthy Collaboration',
        text: 'While brainstorming formulas and concepts in student forums is encouraged, copying homework or sharing solved answer keys is strictly prohibited.'
      },
      {
        title: '3. Proper Use of AI Doubt Solver',
        text: 'Our AI Doubt Bot is designed to bridge conceptual gaps. Submitting raw bot answers as your own graded homework represents a violation of academic integrity.'
      },
      {
        title: '4. Proctoring Actions',
        text: 'Scholarship exams and competitive test series utilize screen proctoring. Academic counselors review suspicious activities to ensure authentic ranks.'
      }
    ]
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property & Copyrights',
    category: 'Academic Integrity',
    lastUpdated: 'June 2026',
    iconName: 'Copyright',
    summary: 'Copyright ownership rules regarding lectures, formulas, software code, and test designs.',
    clauses: [
      {
        title: '1. Content Ownership',
        text: 'All video feeds, whiteboard illustrations, custom cheatsheets, formula compiles, and question papers are the exclusive intellectual property of CME and founder Pranjal Agrawal.'
      },
      {
        title: '2. Anti-Piracy Notice',
        text: 'Distributing recorded sessions or proprietary PDFs on social groups (Telegram, WhatsApp, YouTube) constitutes a violation of copyright law.'
      },
      {
        title: '3. Tool Code Protection',
        text: 'The backend algorithms and interface code powering the Formula Compiler and Doubt Solver are legally protected proprietary assets.'
      },
      {
        title: '4. Student Contributions License',
        text: 'By uploading public questions to the doubt boards, students grant CME a royalty-free license to host, explain, and catalog those academic statements.'
      }
    ]
  },
  {
    id: 'user-conduct',
    title: 'User Conduct & Acceptable Use',
    category: 'Academic Integrity',
    lastUpdated: 'June 2026',
    iconName: 'Users',
    summary: 'Safe, polite, and constructive behavioral codes for virtual classrooms and student chats.',
    clauses: [
      {
        title: '1. Live Classroom Decorum',
        text: 'Students must maintain proper video and audio decorum during interactive sessions. Wear appropriate attire and ensure a quiet background.'
      },
      {
        title: '2. Constructive Comment Policy',
        text: 'Chat panels, doubt threads, and discussion boards must be used solely for academic purposes. Toxicity, personal insults, and political debates are prohibited.'
      },
      {
        title: '3. Anti-Harassment Standards',
        text: 'Harassment or cyber-bullying of peers or mentors is met with zero tolerance and results in immediate reporting to legal guardians and suspension.'
      },
      {
        title: '4. Prohibited Content',
        text: 'Sharing files containing malicious scripts, viruses, or links to external unverified commercial portals inside CME chats is forbidden.'
      }
    ]
  },
  {
    id: 'kyc',
    title: 'Aadhaar Verification & KYC Policy',
    category: 'Academic Integrity',
    lastUpdated: 'June 2026',
    iconName: 'UserCheck',
    summary: 'Standard safety procedures to verify student profile authenticities and secure test ranks.',
    clauses: [
      {
        title: '1. KYC Rationale',
        text: 'Verification of candidate identities ensures that board-level scholarship tests are taken by genuine aspirants and prevents deceptive proxy test-takers.'
      },
      {
        title: '2. Approved Identification',
        text: 'Students can upload their Aadhaar card, school ID card, or passport. Uploading false, edited, or mismatched documents results in account suspension.'
      },
      {
        title: '3. Document Encryption and Protection',
        text: 'Uploaded document images are stored on private, encrypted cloud storage buckets. CME does not sell or share verification records with external agencies.'
      },
      {
        title: '4. Approval SLA',
        text: 'The administrative verification desk processes uploaded documents within 2 hours. Access to premium mock tests is unlocked immediately upon validation.'
      }
    ]
  },
  {
    id: 'cookies',
    title: 'Cookie & Tracking Notice',
    category: 'Security & Data Use',
    lastUpdated: 'June 2026',
    iconName: 'Eye',
    summary: 'How we utilize localized data, cookies, and tokens to keep your dashboards optimized.',
    clauses: [
      {
        title: '1. What Are Cookies',
        text: 'Cookies are small text blocks stored on your browser to facilitate secure login states, session memory, and preference configurations.'
      },
      {
        title: '2. Essential Cookies',
        text: 'We use cookies to maintain your login credentials and active progress state, preventing you from having to sign in repeatedly.'
      },
      {
        title: '3. Performance Cookies',
        text: 'These cookies measure video player buffering speeds and server response latencies, allowing us to balance content loading dynamically.'
      },
      {
        title: '4. Management Toggles',
        text: 'Students can disable cookies through browser options. However, certain persistent components like active timer logs might not function optimally.'
      }
    ]
  },
  {
    id: 'coppa',
    title: 'Children\'s Privacy Protection',
    category: 'Security & Data Use',
    lastUpdated: 'June 2026',
    iconName: 'Lock',
    summary: 'Guidelines for safety, parental controls, and privacy for students under the age of 18.',
    clauses: [
      {
        title: '1. COPPA & Safety Alignment',
        text: 'CME is designed to provide a completely safe, vetted, and academic-only digital space for primary and secondary school children.'
      },
      {
        title: '2. Mandatory Parent Registration',
        text: 'For kids under 18, registrations must be initiated by parents or legal guardians who act as the primary contact for payments.'
      },
      {
        title: '3. Safe Communication Controls',
        text: 'Class chats are monitored by automated profanity filters and academic proctors to prevent cyberbullying or unsafe contacts.'
      },
      {
        title: '4. Parental Access Rights',
        text: 'Parents can request a full summary of their child\'s digital history, chat transcript, or ask for account closure at any time.'
      }
    ]
  },
  {
    id: 'confidentiality',
    title: 'Confidentiality & Non-Disclosure',
    category: 'Security & Data Use',
    lastUpdated: 'June 2026',
    iconName: 'ShieldCheck',
    summary: 'Protecting class counseling logs, exam score profiles, and diagnostic parent briefings.',
    clauses: [
      {
        title: '1. Mentorship Session Secrecy',
        text: 'Discussions during personalized 1-on-1 counseling, stress-relief briefings, and study plan alignments are kept strictly confidential.'
      },
      {
        title: '2. Academic Grade Confidentiality',
        text: 'Detailed analytics of graded test cards and mock scores are accessible only to the student and their verified parents.'
      },
      {
        title: '3. Employee NDA Standards',
        text: 'All CME faculty members, test designers, and tech administrators sign legally binding non-disclosure agreements regarding student files.'
      },
      {
        title: '4. Exceptions to Secrecy',
        text: 'We share student details only when required by official regulatory bodies, police authorities, or in cases of severe self-harm alarms.'
      }
    ]
  },
  {
    id: 'anti-spam',
    title: 'Anti-Spam & Communications Policy',
    category: 'Security & Data Use',
    lastUpdated: 'June 2026',
    iconName: 'MessageSquare',
    summary: 'Rules governing transactional text notifications, email circulars, and phone check-ins.',
    clauses: [
      {
        title: '1. Permitted Communications',
        text: 'We contact students solely for class schedules, syllabus trackers, doubt closures, fee receipts, and critical academic board announcements.'
      },
      {
        title: '2. No Telemarketing',
        text: 'CME does not sell databases, and we never spam students with irrelevant product ads, third-party courses, or promotional deals.'
      },
      {
        title: '3. Channel Optimization',
        text: 'Guardians can customize how they receive updates (WhatsApp, SMS, or Email) through their primary settings panel.'
      },
      {
        title: '4. Unsubscribe SLA',
        text: 'Unsubscribing from marketing alerts is resolved within 24 hours. Transactional updates regarding payments and active classes cannot be muted.'
      }
    ]
  },
  {
    id: 'grievance',
    title: 'Grievance Redressal Mechanism',
    category: 'Regulatory & Compliance',
    lastUpdated: 'June 2026',
    iconName: 'Scale',
    summary: 'Officer designations, physical address listings, and statutory Indian regulatory compliances.',
    clauses: [
      {
        title: '1. Legal Compliance Framework',
        text: 'This policy is established under Section 5(1) of the Information Technology Rules, 2011 to address customer complaints and payments disputes.'
      },
      {
        title: '2. Designated Grievance Officer',
        text: 'Our Chief Executive Officer, Gauri Gupta, serves as the primary Grievance Officer. Correspondence should be sent to conceptmadeeasyclasses@gmail.com.'
      },
      {
        title: '3. Grievance Response Timelines',
        text: 'All complaints receive an official written acknowledgment within 24 hours. The Grievance Officer aims to fully resolve issues within 14 calendar days.'
      },
      {
        title: '4. Contact Directory',
        text: 'Headquarters: Bengaluru, Karnataka, India. Official Hotline: +91 83185 52287. Founder Line: +91 81037 23533.'
      }
    ]
  },
  {
    id: 'disputes',
    title: 'Dispute Resolution & Jurisdiction',
    category: 'Regulatory & Compliance',
    lastUpdated: 'June 2026',
    iconName: 'Hammer',
    summary: 'Legally binding processes for billing arbitrations and administrative conciliation.',
    clauses: [
      {
        title: '1. Amicable Conciliation First',
        text: 'In the event of a dispute, students/guardians agree to undergo a mandatory 15-day amicable negotiation process with our counselor committee.'
      },
      {
        title: '2. Binding Arbitration',
        text: 'Unresolved disputes will be submitted to binding arbitration under the Indian Arbitration and Conciliation Act, 1996. The seat of arbitration shall be Bengaluru.'
      },
      {
        title: '3. Legal Jurisdiction',
        text: 'These agreements are governed by the laws of India. Courts in Bengaluru, Karnataka, shall have exclusive territorial jurisdiction.'
      },
      {
        title: '4. Legal Expenses Recovery',
        text: 'If a frivolous lawsuit is brought against CME, the filing party is liable to reimburse CME\'s full legal counseling fees and court expenses.'
      }
    ]
  },
  {
    id: 'liability',
    title: 'Limitation of Liability Agreement',
    category: 'Regulatory & Compliance',
    lastUpdated: 'June 2026',
    iconName: 'AlertTriangle',
    summary: 'Financial and educational responsibility caps, disclaiming board score guarantees.',
    clauses: [
      {
        title: '1. Score and Rank Disclaimer',
        text: 'While CME provides premium coaching, resources, and live mentorship, final board marks and competitive ranks depend on student effort. We do not guarantee selection scores.'
      },
      {
        title: '2. Maximum Financial Liability Cap',
        text: 'CME\'s maximum cumulative financial liability for any claims, errors, or service defects is capped at the actual tuition fee paid by the claimant.'
      },
      {
        title: '3. Technical Delays and Downtimes',
        text: 'CME is not liable for temporary service interruptions caused by third-party web hosts, payment provider drops, or state-wide internet blackouts.'
      },
      {
        title: '4. Indirect Losses Disclaimed',
        text: 'We are not responsible for indirect, incidental, or speculative academic losses resulting from missed test dates or scheduled school changes.'
      }
    ]
  },
  {
    id: 'indemnity',
    title: 'Indemnity Agreement',
    category: 'Regulatory & Compliance',
    lastUpdated: 'June 2026',
    iconName: 'CheckCircle',
    summary: 'Parental commitment to protect CME, its founders, and faculty from collateral claims.',
    clauses: [
      {
        title: '1. Indemnification Scope',
        text: 'You agree to indemnify, defend, and hold harmless CME, founder Pranjal Agrawal, CEO Gauri Gupta, and instructors from any third-party claims or liabilities.'
      },
      {
        title: '2. Misuse of Credentials',
        text: 'You assume full legal responsibility for any damages, cyber logs, or security alerts resulting from unauthorized sharing of your login credentials.'
      },
      {
        title: '3. Upload Infringement Indemnity',
        text: 'You indemnify CME against intellectual property claims if you upload copyrighted books or homework keys on our community doubt board.'
      },
      {
        title: '4. Legal Representation',
        text: 'CME reserves the right to select its own legal counsel to defend against claims, with all expenses covered under your indemnification duties.'
      }
    ]
  }
];
