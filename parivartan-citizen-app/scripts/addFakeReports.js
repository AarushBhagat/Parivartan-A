const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXjKyjjpIzfViaPwqNaFm8h6d_Oqs4ybY",
  authDomain: "parivartan-12.firebaseapp.com",
  projectId: "parivartan-12",
  storageBucket: "parivartan-12.firebasestorage.app",
  messagingSenderId: "779445083679",
  appId: "1:779445083679:web:9ad7ea10183628beb4bf2a",
  measurementId: "G-J1E4JKGFG5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fake reports data for Jalandhar area
const fakeReports = [
  {
    title: "Pothole on GT Road",
    description: "Large pothole causing traffic issues near Model Town. Needs immediate attention.",
    category: "Roads",
    department: "PWD",
    status: "pending",
    priority: "high",
    location: {
      latitude: 31.3260,
      longitude: 75.5762,
      address: "GT Road, Model Town, Jalandhar",
      district: "Jalandhar"
    },
    upvotes: 15,
    citizenName: "Rajesh Kumar",
    citizenEmail: "rajesh.k@example.com",
    citizenPhone: "+91-9876543210"
  },
  {
    title: "Broken Streetlight at Civil Lines",
    description: "Streetlight not working for past 2 weeks. Area becomes very dark at night.",
    category: "Infrastructure",
    department: "Electricity",
    status: "in-progress",
    priority: "medium",
    location: {
      latitude: 31.3290,
      longitude: 75.5710,
      address: "Civil Lines, Jalandhar",
      district: "Jalandhar"
    },
    upvotes: 8,
    citizenName: "Priya Sharma",
    citizenEmail: "priya.s@example.com",
    citizenPhone: "+91-9876543211"
  },
  {
    title: "Garbage Pile Near Bus Stand",
    description: "Accumulated garbage near the bus stand causing health hazards and bad smell.",
    category: "Sanitation",
    department: "Sanitation",
    status: "pending",
    priority: "high",
    location: {
      latitude: 31.3256,
      longitude: 75.5792,
      address: "Near Bus Stand, Jalandhar",
      district: "Jalandhar"
    },
    upvotes: 23,
    citizenName: "Amit Singh",
    citizenEmail: "amit.singh@example.com",
    citizenPhone: "+91-9876543212"
  },
  {
    title: "Park Bench Vandalized",
    description: "Public park benches have been vandalized. Wood is broken and paint is scratched.",
    category: "Vandalism",
    department: "Horticulture",
    status: "pending",
    priority: "low",
    location: {
      latitude: 31.3310,
      longitude: 75.5680,
      address: "Nehru Garden, Jalandhar",
      district: "Jalandhar"
    },
    upvotes: 5,
    citizenName: "Neha Gupta",
    citizenEmail: "neha.g@example.com",
    citizenPhone: "+91-9876543213"
  },
  {
    title: "Waterlogging Issue",
    description: "Road gets flooded during rain. Drainage system needs repair.",
    category: "Infrastructure",
    department: "Drainage",
    status: "pending",
    priority: "high",
    location: {
      latitude: 31.3200,
      longitude: 75.5850,
      address: "Ladowali Road, Jalandhar",
      district: "Jalandhar"
    },
    upvotes: 18,
    citizenName: "Harpreet Kaur",
    citizenEmail: "harpreet.k@example.com",
    citizenPhone: "+91-9876543214"
  },
  {
    title: "Illegal Dumping Site",
    description: "People are dumping construction waste illegally. Creating environmental hazard.",
    category: "Sanitation",
    department: "Environment",
    status: "pending",
    priority: "medium",
    location: {
      latitude: 31.3350,
      longitude: 75.5640,
      address: "Near Surya Enclave, Jalandhar",
      district: "Jalandhar"
    },
    upvotes: 12,
    citizenName: "Sukhwinder Singh",
    citizenEmail: "sukh.s@example.com",
    citizenPhone: "+91-9876543215"
  },
  {
    title: "Traffic Signal Not Working",
    description: "Traffic signal at major intersection is malfunctioning. High accident risk.",
    category: "Infrastructure",
    department: "Traffic Police",
    status: "in-progress",
    priority: "high",
    location: {
      latitude: 31.3280,
      longitude: 75.5740,
      address: "BMC Chowk, Jalandhar",
      district: "Jalandhar"
    },
    upvotes: 31,
    citizenName: "Manjeet Kaur",
    citizenEmail: "manjeet.k@example.com",
    citizenPhone: "+91-9876543216"
  },
  {
    title: "Graffiti on Public Wall",
    description: "Offensive graffiti on government building wall. Needs immediate cleaning.",
    category: "Vandalism",
    department: "Municipal Corporation",
    status: "pending",
    priority: "medium",
    location: {
      latitude: 31.3240,
      longitude: 75.5800,
      address: "Old City Area, Jalandhar",
      district: "Jalandhar"
    },
    upvotes: 7,
    citizenName: "Rahul Verma",
    citizenEmail: "rahul.v@example.com",
    citizenPhone: "+91-9876543217"
  },
  {
    title: "Overgrown Trees Blocking Road",
    description: "Tree branches hanging low over the road. Blocking visibility for vehicles.",
    category: "Parks",
    department: "Horticulture",
    status: "pending",
    priority: "medium",
    location: {
      latitude: 31.3320,
      longitude: 75.5700,
      address: "Cantt Area, Jalandhar",
      district: "Jalandhar"
    },
    upvotes: 9,
    citizenName: "Simran Kaur",
    citizenEmail: "simran.k@example.com",
    citizenPhone: "+91-9876543218"
  },
  {
    title: "Broken Water Pipeline",
    description: "Water pipeline leaking continuously. Water wastage and road damage.",
    category: "Infrastructure",
    department: "Water Supply",
    status: "resolved",
    priority: "high",
    location: {
      latitude: 31.3220,
      longitude: 75.5820,
      address: "Rama Mandi, Jalandhar",
      district: "Jalandhar"
    },
    upvotes: 25,
    citizenName: "Deepak Kumar",
    citizenEmail: "deepak.k@example.com",
    citizenPhone: "+91-9876543219"
  }
];

// Function to add reports to Firebase
async function addFakeReports() {
  console.log('Starting to add fake reports...');
  
  try {
    for (let i = 0; i < fakeReports.length; i++) {
      const report = fakeReports[i];
      
      // Add timestamps
      const reportData = {
        ...report,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        submittedDate: new Date().toISOString(),
        imageUrl: null,
        comments: [],
        createdBy: {
          displayName: report.citizenName,
          email: report.citizenEmail,
          photoURL: null
        }
      };
      
      const docRef = await addDoc(collection(db, 'grievances'), reportData);
      console.log(`✓ Added report ${i + 1}/${fakeReports.length}: "${report.title}" (ID: ${docRef.id})`);
    }
    
    console.log('\n✅ Successfully added all fake reports!');
    console.log(`Total reports added: ${fakeReports.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding reports:', error);
    process.exit(1);
  }
}

// Run the script
addFakeReports();