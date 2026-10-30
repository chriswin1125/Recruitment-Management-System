const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Job = require('./models/Job');
const Profile = require('./models/Profile');
const Application = require('./models/Application');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recruitment_db');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Profile.deleteMany({}),
      Application.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@recruit.com',
      password: 'password123',
      role: 'admin'
    });

    const recruiter1 = await User.create({
      name: 'Sarah Johnson',
      email: 'recruiter@recruit.com',
      password: 'password123',
      role: 'recruiter'
    });

    const recruiter2 = await User.create({
      name: 'Mike Chen',
      email: 'mike@techcorp.com',
      password: 'password123',
      role: 'recruiter'
    });

    const candidate1 = await User.create({
      name: 'John Smith',
      email: 'candidate@recruit.com',
      password: 'password123',
      role: 'candidate'
    });

    const candidate2 = await User.create({
      name: 'Emily Davis',
      email: 'emily@example.com',
      password: 'password123',
      role: 'candidate'
    });

    console.log('Users created');

    // Create profiles
    await Profile.create({
      user: candidate1._id,
      headline: 'Full Stack Developer',
      bio: 'Passionate developer with 3 years of experience in React and Node.js',
      location: 'New York, USA',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
      experience: [{
        title: 'Junior Developer',
        company: 'StartupXYZ',
        location: 'New York',
        from: new Date('2021-01-01'),
        current: true,
        description: 'Building full stack web applications'
      }],
      education: [{
        school: 'State University',
        degree: 'B.S.',
        fieldOfStudy: 'Computer Science',
        from: new Date('2017-09-01'),
        to: new Date('2021-05-01')
      }],
      expectedSalary: 90000,
      jobType: 'full-time'
    });

    await Profile.create({
      user: candidate2._id,
      headline: 'UX/UI Designer',
      bio: 'Creative designer specializing in user experience',
      location: 'San Francisco, USA',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'CSS', 'HTML'],
      expectedSalary: 85000,
      jobType: 'full-time'
    });

    console.log('Profiles created');

    // Create jobs
    const jobs = await Job.insertMany([
      {
        title: 'Senior React Developer',
        company: 'TechCorp Inc.',
        description: 'We are looking for an experienced React developer to join our growing team. You will be responsible for building and maintaining our web applications.',
        requirements: ['5+ years React experience', 'TypeScript proficiency', 'Node.js knowledge'],
        responsibilities: ['Build scalable React applications', 'Code reviews', 'Mentor junior devs'],
        skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
        location: 'New York, NY (Remote)',
        jobType: 'full-time',
        experienceLevel: 'senior',
        salary: { min: 120000, max: 160000, currency: 'USD', period: 'yearly', isVisible: true },
        category: 'Technology',
        status: 'active',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        vacancies: 2,
        postedBy: recruiter1._id,
        isFeatured: true
      },
      {
        title: 'Product Designer',
        company: 'DesignHub',
        description: 'Join our creative team as a Product Designer. You\'ll shape the future of our digital products through user-centered design.',
        requirements: ['3+ years design experience', 'Figma expert', 'UX research skills'],
        responsibilities: ['Design user interfaces', 'Conduct user research', 'Create design systems'],
        skills: ['Figma', 'Sketch', 'Adobe XD', 'User Research'],
        location: 'San Francisco, CA',
        jobType: 'full-time',
        experienceLevel: 'mid',
        salary: { min: 90000, max: 120000, currency: 'USD', period: 'yearly', isVisible: true },
        category: 'Design',
        status: 'active',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        vacancies: 1,
        postedBy: recruiter2._id
      },
      {
        title: 'Marketing Manager',
        company: 'GrowthCo',
        description: 'Drive our marketing strategy and lead a talented team to achieve ambitious growth targets.',
        requirements: ['5+ years marketing experience', 'Data-driven mindset', 'Team leadership'],
        responsibilities: ['Develop marketing strategies', 'Manage team of 5', 'Report to CMO'],
        skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
        location: 'Austin, TX',
        jobType: 'full-time',
        experienceLevel: 'senior',
        salary: { min: 95000, max: 130000, currency: 'USD', period: 'yearly', isVisible: true },
        category: 'Marketing',
        status: 'active',
        vacancies: 1,
        postedBy: recruiter1._id
      },
      {
        title: 'Backend Engineer (Node.js)',
        company: 'DataFlow Systems',
        description: 'Build robust and scalable backend services for our data platform serving millions of users.',
        requirements: ['4+ years Node.js', 'MongoDB/PostgreSQL', 'REST API design'],
        responsibilities: ['Design APIs', 'Database optimization', 'DevOps support'],
        skills: ['Node.js', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
        location: 'Remote',
        jobType: 'remote',
        experienceLevel: 'mid',
        salary: { min: 100000, max: 140000, currency: 'USD', period: 'yearly', isVisible: true },
        category: 'Technology',
        status: 'active',
        vacancies: 3,
        postedBy: recruiter2._id,
        isFeatured: true
      },
      {
        title: 'HR Business Partner',
        company: 'PeopleFirst Corp',
        description: 'Partner with business leaders to develop and execute HR strategies that attract and retain top talent.',
        requirements: ['5+ years HR experience', 'SHRM certification preferred', 'Strong communication'],
        responsibilities: ['Talent acquisition', 'Employee relations', 'Performance management'],
        skills: ['HR Strategy', 'Talent Management', 'HRIS', 'Conflict Resolution'],
        location: 'Chicago, IL',
        jobType: 'full-time',
        experienceLevel: 'senior',
        salary: { min: 80000, max: 110000, currency: 'USD', period: 'yearly', isVisible: true },
        category: 'HR',
        status: 'active',
        vacancies: 1,
        postedBy: recruiter1._id
      }
    ]);

    console.log('Jobs created');

    console.log('\n✅ Seed completed successfully!\n');
    console.log('Test accounts:');
    console.log('Admin:     admin@recruit.com / password123');
    console.log('Recruiter: recruiter@recruit.com / password123');
    console.log('Candidate: candidate@recruit.com / password123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
