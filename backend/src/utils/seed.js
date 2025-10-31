const db = require('../config/database');
const User = require('../models/User');
const Category = require('../models/Category');
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

    // Seed demo users
    console.log('Seeding demo users...');
    const demoUsers = [
      {
        full_name: 'Alice Johnson',
        email: 'alice@alustudent.com',
        password: 'password123',
        phone_number: '+1234567890',
        institution: 'African Leadership University',
        department: 'Computer Science',
        student_id: 'CS2024001'
      },
      {
        full_name: 'Bob Smith',
        email: 'bob@alustudent.com',
        password: 'password123',
        phone_number: '+1234567891',
        institution: 'African Leadership University',
        department: 'Mathematics',
        student_id: 'MATH2024002'
      },
      {
        full_name: 'Carol Davis',
        email: 'carol@alustudent.com',
        password: 'password123',
        phone_number: '+1234567892',
        institution: 'African Leadership University',
        department: 'Engineering',
        student_id: 'ENG2024003'
      },
      {
        full_name: 'David Wilson',
        email: 'david@alustudent.com',
        password: 'password123',
        phone_number: '+1234567893',
        institution: 'African Leadership University',
        department: 'Business',
        student_id: 'BUS2024004'
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
    const usersResult = await db.query('SELECT * FROM users ORDER BY user_id');
    const users = usersResult.rows;

    if (users.length > 0) {
      console.log('Seeding sample items...');
      const sampleItems = [
        {
          owner_id: users[0].user_id,
          item_name: 'Introduction to Algorithms',
          category: categoryMap['Computer Science'],
          description: 'Comprehensive guide to algorithms by Cormen, Leiserson, Rivest, and Stein. Fourth edition.',
          condition: 'Good',
          sharing_type: 'lend',
          location: 'Main Campus Library',
          isbn: '9780262046305',
          author: 'Thomas H. Cormen',
          publication_year: 2022
        },
        {
          owner_id: users[0].user_id,
          item_name: 'Clean Code',
          category: categoryMap['Computer Science'],
          description: 'A handbook of agile software craftsmanship by Robert C. Martin.',
          condition: 'Like New',
          sharing_type: 'lend',
          location: 'Engineering Building',
          isbn: '9780132350884',
          author: 'Robert C. Martin',
          publication_year: 2008
        },
        {
          owner_id: users[1].user_id,
          item_name: 'Calculus: Early Transcendentals',
          category: categoryMap['Mathematics'],
          description: 'Stewart\'s calculus textbook, 8th edition. Excellent condition.',
          condition: 'Good',
          sharing_type: 'lend',
          location: 'Math Department',
          isbn: '9781285741550',
          author: 'James Stewart',
          publication_year: 2015
        },
        {
          owner_id: users[1].user_id,
          item_name: 'Linear Algebra and Its Applications',
          category: categoryMap['Mathematics'],
          description: 'Comprehensive linear algebra textbook by David Lay.',
          condition: 'Fair',
          sharing_type: 'lend',
          location: 'Science Building',
          isbn: '9780321982384',
          author: 'David C. Lay',
          publication_year: 2015
        },
        {
          owner_id: users[2].user_id,
          item_name: 'Fundamentals of Electric Circuits',
          category: categoryMap['Engineering'],
          description: 'Essential circuits textbook for electrical engineering students.',
          condition: 'Good',
          sharing_type: 'lend',
          location: 'Engineering Lab',
          isbn: '9780078028229',
          author: 'Charles Alexander',
          publication_year: 2016
        },
        {
          owner_id: users[3].user_id,
          item_name: 'Principles of Economics',
          category: categoryMap['Business'],
          description: 'Mankiw\'s economics textbook, widely used in undergraduate courses.',
          condition: 'Good',
          sharing_type: 'lend',
          location: 'Business School',
          isbn: '9781305585126',
          author: 'N. Gregory Mankiw',
          publication_year: 2017
        },
        {
          owner_id: users[0].user_id,
          item_name: 'The Art of Computer Programming Vol. 1',
          category: categoryMap['Computer Science'],
          description: 'Donald Knuth\'s legendary computer science series.',
          condition: 'Like New',
          sharing_type: 'lend',
          location: 'Computer Lab',
          isbn: '9780201896831',
          author: 'Donald E. Knuth',
          publication_year: 1997
        },
        {
          owner_id: users[2].user_id,
          item_name: 'Physics for Scientists and Engineers',
          category: categoryMap['Science'],
          description: 'Comprehensive physics textbook covering mechanics, waves, and thermodynamics.',
          condition: 'Good',
          sharing_type: 'lend',
          location: 'Physics Department',
          isbn: '9781133947271',
          author: 'Raymond Serway',
          publication_year: 2013
        }
      ];

      for (const itemData of sampleItems) {
        try {
          const query = `
            INSERT INTO items (
              owner_id, item_name, category, description, condition, sharing_type,
              location, isbn, author, publication_year
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING item_id, item_name
          `;
          
          const values = [
            itemData.owner_id, itemData.item_name, itemData.category,
            itemData.description, itemData.condition, itemData.sharing_type,
            itemData.location, itemData.isbn, itemData.author, itemData.publication_year
          ];

          const { rows } = await db.query(query, values);
          console.log(`  Created item: ${rows[0].item_name}`);
        } catch (error) {
          console.log(`  Error creating item ${itemData.item_name}:`, error.message);
        }
      }
    }

    console.log('\nDatabase seeding completed successfully!');
    console.log('\nSummary:');
    
    // Get counts
    const categoryCount = await db.query('SELECT COUNT(*) as count FROM categories');
    const userCount = await db.query('SELECT COUNT(*) as count FROM users');
    const itemCount = await db.query('SELECT COUNT(*) as count FROM items');
    
    console.log(`   Categories: ${categoryCount.rows[0].count}`);
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Items: ${itemCount.rows[0].count}`);
    
    console.log('\nDemo user credentials:');
    console.log('   Email: alice@alustudent.com | Password: password123');
    console.log('   Email: bob@alustudent.com   | Password: password123');
    console.log('   Email: carol@alustudent.com | Password: password123');
    console.log('   Email: david@alustudent.com | Password: password123\n');

    logger.info('Database seeded successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    console.error('Database seeding failed:', error.message);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedDatabase };
