const bcrypt = require('bcrypt');
const pool = require('../src/database/db');

const SALT_ROUNDS = 10;

const resources = [
  // Seminar halls & auditoriums
  {
    name: 'Bose Hall',
    category: 'Seminar Hall',
    description:
      'Premier seminar hall located in the Seminar Halls Complex. Fully air-conditioned with modern acoustics, a central stage, and dual projectors — suited for guest lectures, symposiums, and institute-level events.',
    location: 'Seminar Halls Complex, Ground Floor',
    capacity: 160,
    status: 'AVAILABLE',
    image_url: 'https://www.nitw.ac.in/ir/images/events_images/image11.jpg',
  },
  {
    name: 'Raman Hall',
    category: 'Seminar Hall',
    description:
      'Mid-sized tiered seminar hall equipped with ergonomic seating, surround sound audio systems, and digital podiums. Frequently used for department conferences and PhD seminars.',
    location: 'Seminar Halls Complex, First Floor',
    capacity: 120,
    status: 'AVAILABLE',
    image_url: 'https://nitw.ac.in/api/static/files/students_2024-7-29-11-19-16.jpg',
  },
  {
    name: 'Homi Bhabha Hall',
    category: 'Seminar Hall',
    description:
      'Modern seminar space designed for hybrid meetings and interactive sessions. Features dual-display conferencing hardware and dedicated high-speed LAN access.',
    location: 'Seminar Halls Complex, First Floor',
    capacity: 100,
    status: 'AVAILABLE',
    image_url: 'https://www.nitw.ac.in/ir/images/events_images/image8.jpg',
  },
  {
    name: 'Dr. B. R. Ambedkar Learning Centre Auditorium',
    category: 'Seminar Hall',
    description:
      'Large-scale institute auditorium with a steel structure, central AC, professional stage lighting, a PA system, and expansive seating for major student society events and convocations.',
    location: 'Ambedkar Learning Centre (ALC)',
    capacity: 450,
    status: 'AVAILABLE',
    image_url: 'https://www.nitw.ac.in/stuti/images/ap22.jpg',
  },
  {
    name: 'CTL Seminar Hall',
    category: 'Seminar Hall',
    description:
      'Dedicated faculty development seminar hall with a smart board, digital podiums, projection systems, and ergonomic seating, used under the Malaviya Mission Teacher Training Program.',
    location: 'Centre for Teaching and Learning (CTL), First Floor',
    capacity: 120,
    status: 'AVAILABLE',
    image_url: 'https://nitw.ac.in/api/static/files/CTL2_2025-8-11-11-10-8.png',
  },

  // Computer labs
  {
    name: 'CTL Learning Resources Development Lab',
    category: 'Computer Lab',
    description:
      'Advanced hands-on training lab featuring 40 high-end computer systems, a digital podium, and projection systems, used for LMS integration workshops and emerging-technology sessions.',
    location: 'Centre for Teaching and Learning (CTL), Second Floor',
    capacity: 40,
    status: 'MAINTENANCE',
    image_url: 'https://nitw.ac.in/api/static/files/CTL5_2025-8-11-11-57-51.png',
  },
  {
    name: 'CDIS Central Computing Lab A',
    category: 'Computer Lab',
    description:
      'High-performance computing lab powered by campus-wide digital infrastructure. Equipped with Ubuntu/Windows dual-boot systems for programming labs and institute-level hackathons.',
    location: 'Centre for Digital Infrastructure and Services (CDIS), Ground Floor',
    capacity: 80,
    status: 'AVAILABLE',
    image_url: 'https://nitw.ac.in/cdis/assets/images/lab1.jpg',
  },
  {
    name: 'SOM Analytics and Simulation Lab',
    category: 'Computer Lab',
    description:
      'Specialized analytics lab with 30 workstations providing access to IBM SPSS, IBM AMOS, the Capitaline database, R, and Python, backed by a dedicated uninterrupted power supply.',
    location: 'School of Management (SOM), Main Building',
    capacity: 30,
    status: 'AVAILABLE',
    image_url: 'https://nitw.ac.in/cdis/assets/images/lab3.jpeg',
  },

  // Meeting rooms
  {
    name: 'CTL Academic Meeting Hall',
    category: 'Meeting Room',
    description:
      'Executive meeting hall designed for academic discussions, committee reviews, and collaborative research sessions. Includes a videoconferencing soundbar and a 75-inch 4K display.',
    location: 'Centre for Teaching and Learning (CTL), First Floor',
    capacity: 25,
    status: 'AVAILABLE',
    image_url: 'https://nitw.ac.in/api/static/files/CTL3_2025-8-11-11-10-41.png',
  },
  {
    name: 'SOM Group Discussion Hall',
    category: 'Meeting Room',
    description:
      'Air-conditioned interactive group discussion and corporate interaction room with modular seating, Wi-Fi connectivity, and presentation whiteboards.',
    location: 'School of Management (SOM), Ground Floor',
    capacity: 35,
    status: 'AVAILABLE',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBekWWiT2D2DmHhM30G26m7s-jF8pvkCeeFQ&s',
  },

  // Equipment
  {
    name: 'Epson Pro EX9240 Wireless Projector Set',
    category: 'Equipment',
    description:
      'Portable Full-HD 1080p wireless projector with 4,000 lumens of brightness, HDMI/Miracast support, and a portable screen — suited for outdoor or temporary workshop setups.',
    location: 'CDIS Equipment Issue Desk',
    capacity: null,
    status: 'AVAILABLE',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBNDt_Pam_pjgWMmcN1StUGZEvQoQoPuTL0Q&s',
  },
  {
    name: 'Ahuja Portable PA System & Wireless Mics',
    category: 'Equipment',
    description:
      'Mobile public address sound system featuring dual UHF handheld wireless microphones, rechargeable battery backup, and a built-in Bluetooth audio receiver — used for club events.',
    location: 'Student Activity Centre (SAC) Stores',
    capacity: null,
    status: 'AVAILABLE',
    image_url: null,
  },
];

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Clearing existing data (bookings, resources, users)...');
    await client.query('TRUNCATE TABLE bookings, resources, users RESTART IDENTITY CASCADE');

    console.log('Creating demo accounts...');
    const adminPasswordHash = await bcrypt.hash('Pass@1234', SALT_ROUNDS);
    const studentPasswordHash = await bcrypt.hash('Student@123', SALT_ROUNDS);

    await client.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      ['Admin', 'ss6393733665@gmail.com', adminPasswordHash, 'ADMIN']
    );

    await client.query(
      `INSERT INTO users (name, email, password_hash, role, roll_number, registration_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Demo Student', 'student@campus.com', studentPasswordHash, 'STUDENT', 'STU2026001', 'PRIVATE']
    );

    console.log('Creating sample resources...');
    for (const resource of resources) {
      // image_url is now part of the INSERT — the original Phase 4 script
      // predates the Phase 14 column and never picked it up.
      await client.query(
        `INSERT INTO resources (name, category, description, location, capacity, status, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          resource.name,
          resource.category,
          resource.description,
          resource.location,
          resource.capacity,
          resource.status,
          resource.image_url,
        ]
      );
    }

    await client.query('COMMIT');

    console.log('\nSeed complete.');
    console.log('-----------------------------------------');
    console.log('Demo credentials (development only — change before any real deployment):');
    console.log('  Admin:   admin@campus.com / Admin@123');
    console.log('  Student: student@campus.com / Student@123');
    console.log('-----------------------------------------');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed, no changes were made:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();