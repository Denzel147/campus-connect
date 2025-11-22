const db = require('../config/database');
const User = require('../models/User');
const Category = require('../models/Category');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const logger = require('../config/logger');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Seed categories
    console.log('Seeding categories...');
    const categories = [
      {
        category_name: 'Computer Science',
        description: 'Programming, algorithms, software engineering books',
        icon: 'computer'
      },
      {
        category_name: 'Mathematics',
        description: 'Calculus, algebra, statistics, and other math textbooks',
        icon: 'calculator'
      },
      {
        category_name: 'Science',
        description: 'Physics, chemistry, biology, and other science books',
        icon: 'beaker'
      },
      {
        category_name: 'Business',
        description: 'Economics, finance, management, and business books',
        icon: 'briefcase'
      },
      {
        category_name: 'Engineering',
        description: 'Mechanical, electrical, civil engineering textbooks',
        icon: 'settings'
      },
      {
        category_name: 'Literature',
        description: 'English literature, creative writing, linguistics',
        icon: 'book'
      },
      {
        category_name: 'Social Sciences',
        description: 'Psychology, sociology, anthropology, political science',
        icon: 'users'
      },
      {
        category_name: 'Art & Design',
        description: 'Graphic design, fine arts, architecture books',
        icon: 'palette'
      }
    ];

    for (const categoryData of categories) {
      try {
        await Category.create(categoryData);
        console.log(`  Created category: ${categoryData.category_name}`);
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`  Category already exists: ${categoryData.category_name}`);
        } else {
          throw error;
        }
      }
    }

    // Seed demo users - updated with all fields from User.js model
    console.log('Seeding demo users...');
    const demoUsers = [
      {
        full_name: 'Alice Johnson',
        email: 'alice@alustudent.com',
        password: 'password123',
        phone_number: '+250781234567',
        institution: 'African Leadership University',
        department: 'Computer Science',
        student_id: 'CS2024001',
        major: 'Computer Science',
        year: 'Year 2',
        campus: 'Rwanda',
        dorm: 'Innovation Hall',
        room_number: 'A101',
        whatsapp_number: '+250781234567',
        academic_interests: ['Programming', 'AI', 'Web Development'],
        role: 'student',
        terms_agreed: true
      },
      {
        full_name: 'Bob Smith',
        email: 'bob@alustudent.com',
        password: 'password123',
        phone_number: '+250781234568',
        institution: 'African Leadership University',
        department: 'Mathematics',
        student_id: 'MATH2024002',
        major: 'Applied Mathematics',
        year: 'Year 3',
        campus: 'Rwanda',
        dorm: 'Leadership Hall',
        room_number: 'B205',
        whatsapp_number: '+250781234568',
        academic_interests: ['Statistics', 'Data Science', 'Calculus'],
        role: 'student',
        terms_agreed: true
      },
      {
        full_name: 'Carol Davis',
        email: 'carol@alustudent.com',
        password: 'password123',
        phone_number: '+250781234569',
        institution: 'African Leadership University',
        department: 'Engineering',
        student_id: 'ENG2024003',
        major: 'Electrical Engineering',
        year: 'Year 4',
        campus: 'Rwanda',
        dorm: 'Innovation Hall',
        room_number: 'C301',
        whatsapp_number: '+250781234569',
        academic_interests: ['Electronics', 'Renewable Energy', 'Robotics'],
        role: 'student',
        terms_agreed: true
      },
      {
        full_name: 'David Wilson',
        email: 'david@alustudent.com',
        password: 'password123',
        phone_number: '+250781234570',
        institution: 'African Leadership University',
        department: 'Business',
        student_id: 'BUS2024004',
        major: 'Business Administration',
        year: 'Year 1',
        campus: 'Rwanda',
        dorm: 'Leadership Hall',
        room_number: 'D102',
        whatsapp_number: '+250781234570',
        academic_interests: ['Entrepreneurship', 'Finance', 'Marketing'],
        role: 'student',
        terms_agreed: true
      },
      {
        full_name: 'Admin User',
        email: 's.abijuru1@alustudent.com',
        password: 'admin123',
        phone_number: '+250781234571',
        institution: 'African Leadership University',
        department: 'Administration',
        student_id: 'ADMIN001',
        major: 'System Administration',
        year: 'Staff',
        campus: 'Rwanda',
        dorm: null,
        room_number: null,
        whatsapp_number: '+250781234571',
        academic_interests: ['System Administration', 'Database Management'],
        role: 'admin',
        terms_agreed: true
      }
    ];

    for (const userData of demoUsers) {
      try {
        const user = await User.create(userData);
        console.log(`  Created user: ${user.full_name} (${user.email})`);
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`  User already exists: ${userData.email}`);
        } else {
          throw error;
        }
      }
    }

    // Get created categories for seeding items
    const categoriesResult = await db.query('SELECT * FROM categories ORDER BY category_id');
    const categoryMap = {};
    categoriesResult.rows.forEach(cat => {
      categoryMap[cat.category_name] = cat.category_id;
    });

    // Get created users for seeding items
    const usersResult = await db.query('SELECT * FROM users WHERE role = $1 ORDER BY user_id', ['student']);
    const users = usersResult.rows;

    if (users.length > 0) {
      console.log('Seeding sample items...');
      const sampleItems = [
        {
          item_name: 'Introduction to Algorithms',
          category: categoryMap['Computer Science'],
          description: 'Comprehensive guide to algorithms by Cormen, Leiserson, Rivest, and Stein. Fourth edition.',
          condition: 'good',
          sharing_type: 'lend',
          location: 'Main Campus Library',
          isbn: '9780262046305',
          author: 'Thomas H. Cormen',
          publication_year: 2022,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        },
        {
          item_name: 'Clean Code',
          category: categoryMap['Computer Science'],
          description: 'A handbook of agile software craftsmanship by Robert C. Martin.',
          condition: 'like_new',
          sharing_type: 'lend',
          location: 'Engineering Building',
          isbn: '9780132350884',
          author: 'Robert C. Martin',
          publication_year: 2008,
          due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 21 days from now
        },
        {
          item_name: 'Calculus: Early Transcendentals',
          category: categoryMap['Mathematics'],
          description: 'Essential calculus textbook for engineering and science students.',
          condition: 'good',
          sharing_type: 'lend',
          location: 'Mathematics Department',
          isbn: '9781337613927',
          author: 'James Stewart',
          publication_year: 2020,
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
        },
        {
          item_name: 'Physics for Scientists and Engineers',
          category: categoryMap['Science'],
          description: 'Comprehensive physics textbook covering mechanics, thermodynamics, and electromagnetism.',
          condition: 'fair',
          sharing_type: 'lend',
          location: 'Science Laboratory',
          isbn: '9781337553292',
          author: 'Raymond A. Serway',
          publication_year: 2019,
          due_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000) // 28 days from now
        },
        {
          item_name: 'Introduction to Business',
          category: categoryMap['Business'],
          description: 'Fundamentals of business administration and entrepreneurship.',
          condition: 'excellent',
          sharing_type: 'lend',
          location: 'Business School',
          isbn: '9780357037729',
          author: 'William G. Nickels',
          publication_year: 2021,
          due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) // 20 days from now
        },
        {
          item_name: 'Fundamentals of Electric Circuits',
          category: categoryMap['Engineering'],
          description: 'Essential circuits textbook for electrical engineering students.',
          condition: 'good',
          sharing_type: 'lend',
          location: 'Engineering Lab',
          isbn: '9780078028229',
          author: 'Charles Alexander',
          publication_year: 2016,
          due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000) // 25 days from now
        }
      ];

      for (let i = 0; i < sampleItems.length; i++) {
        try {
          const ownerIndex = i % users.length; // Distribute items among users
          const item = await Item.create(sampleItems[i], users[ownerIndex].user_id);
          console.log(`  Created item: ${item.item_name} (Owner: ${users[ownerIndex].full_name})`);
        } catch (error) {
          console.error(`  Error creating item ${sampleItems[i].item_name}:`, error.message);
        }
      }

      // Create some sample notifications
      console.log('Seeding sample notifications...');
      const sampleNotifications = [
        {
          user_id: users[0].user_id,
          notification_type: 'item_request',
          message: 'Bob Smith has requested to borrow your "Introduction to Algorithms" book.',
          priority: 'normal'
        },
        {
          user_id: users[1].user_id,
          notification_type: 'due_reminder',
          message: 'Your borrowed item "Clean Code" is due in 3 days.',
          priority: 'high'
        },
        {
          user_id: users[2].user_id,
          notification_type: 'item_returned',
          message: 'Alice Johnson has returned your "Calculus: Early Transcendentals" book.',
          priority: 'normal'
        },
        {
          user_id: users[0].user_id,
          notification_type: 'system',
          message: 'Welcome to CampusConnect! Start sharing and borrowing items with your peers.',
          priority: 'low'
        },
        {
          user_id: users[3].user_id,
          notification_type: 'new_item',
          message: 'New item available: "Physics for Scientists and Engineers" by Raymond Serway.',
          priority: 'normal'
        }
      ];

      for (const notificationData of sampleNotifications) {
        try {
          await Notification.create(notificationData);
          console.log(`  Created notification for user ${notificationData.user_id}`);
        } catch (error) {
          console.error(`  Error creating notification:`, error.message);
        }
      }
    }

    console.log('\nDatabase seeding completed successfully!');
    console.log('\nSummary:');
    
    // Get counts
    const categoryCount = await db.query('SELECT COUNT(*) as count FROM categories');
    const userCount = await db.query('SELECT COUNT(*) as count FROM users');
    const itemCount = await db.query('SELECT COUNT(*) as count FROM items');
    const notificationCount = await db.query('SELECT COUNT(*) as count FROM notifications');
    
    console.log(`   Categories: ${categoryCount.rows[0].count}`);
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Items: ${itemCount.rows[0].count}`);
    console.log(`   Notifications: ${notificationCount.rows[0].count}`);
    
    console.log('\nDemo user credentials:');
    console.log('   Email: alice@alustudent.com | Password: password123');
    console.log('   Email: bob@alustudent.com   | Password: password123');
    console.log('   Email: carol@alustudent.com | Password: password123');
    console.log('   Email: david@alustudent.com | Password: password123');
    console.log('   Email: s.abijuru1@alustudent.com | Password: admin123 (ADMIN)');

  } catch (error) {
    logger.error('Error seeding database:', error);
    console.error('Database seeding failed:', error.message);
    throw error;
  }
};

// Clear all data from tables
const clearDatabase = async () => {
  try {
    console.log('Clearing database...');
    await db.query('DELETE FROM notifications');
    await db.query('DELETE FROM reviews');
    await db.query('DELETE FROM transactions');
    await db.query('DELETE FROM items');
    await db.query('DELETE FROM categories');
    await db.query('DELETE FROM users');
    
    // Reset sequences
    await db.query('ALTER SEQUENCE users_user_id_seq RESTART WITH 1');
    await db.query('ALTER SEQUENCE categories_category_id_seq RESTART WITH 1');
    await db.query('ALTER SEQUENCE items_item_id_seq RESTART WITH 1');
    await db.query('ALTER SEQUENCE notifications_notification_id_seq RESTART WITH 1');
    
    console.log('Database cleared successfully');
  } catch (error) {
    logger.error('Error clearing database:', error);
    console.error('Database clearing failed:', error.message);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'clear') {
    clearDatabase()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    seedDatabase()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = { seedDatabase, clearDatabase };
