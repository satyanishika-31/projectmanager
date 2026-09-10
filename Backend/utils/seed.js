const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Organization = require('../models/Organization');
const OrganizationMember = require('../models/OrganizationMember');
const Team = require('../models/Team');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Milestone = require('../models/Milestone');
const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const Label = require('../models/Label');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');

dotenv.config({ path: __dirname + '/../.env' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/projectpulse';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      OrganizationMember.deleteMany({}),
      Team.deleteMany({}),
      Project.deleteMany({}),
      ProjectMember.deleteMany({}),
      Milestone.deleteMany({}),
      Sprint.deleteMany({}),
      Task.deleteMany({}),
      Issue.deleteMany({}),
      Comment.deleteMany({}),
      Label.deleteMany({}),
      Notification.deleteMany({}),
      Activity.deleteMany({}),
    ]);
    console.log('Cleared previous database collections.');

    // 1. Create Users
    const password = 'Password123!';
    const alex = await User.create({
      name: 'Alex Morgan',
      email: 'admin@projectpulse.com',
      password,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const sarah = await User.create({
      name: 'Sarah Chen',
      email: 'lead@projectpulse.com',
      password,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    });

    const marcus = await User.create({
      name: 'Marcus Brody',
      email: 'dev@projectpulse.com',
      password,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    const elena = await User.create({
      name: 'Elena Rostova',
      email: 'stakeholder@projectpulse.com',
      password,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });

    console.log('Users created: Admin, Team Lead, Developer, Stakeholder');

    // 2. Create Organization
    const acme = await Organization.create({
      name: 'Acme Cloud Technologies',
      description: 'Enterprise agile software and cloud infrastructure solutions.',
      owner: alex._id,
    });

    await OrganizationMember.create([
      { organization: acme._id, user: alex._id, role: 'admin' },
      { organization: acme._id, user: sarah._id, role: 'member' },
      { organization: acme._id, user: marcus._id, role: 'member' },
      { organization: acme._id, user: elena._id, role: 'member' },
    ]);
    console.log('Organization and Members created.');

    // 3. Create Teams
    const coreTeam = await Team.create({
      name: 'Core Engineering',
      organization: acme._id,
      leader: sarah._id,
      members: [alex._id, sarah._id, marcus._id],
    });

    const opsTeam = await Team.create({
      name: 'Quality & Operations',
      organization: acme._id,
      leader: alex._id,
      members: [alex._id, sarah._id, marcus._id, elena._id],
    });
    console.log('Teams created.');

    // 4. Create Projects
    const projectPulse = await Project.create({
      name: 'ProjectPulse SaaS Suite',
      description: 'Full-stack agile management and team collaboration platform with Kanban, sprints, and metrics.',
      organization: acme._id,
      manager: alex._id,
      status: 'active',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });

    const mobileCompanion = await Project.create({
      name: 'Mobile App Companion',
      description: 'Cross-platform mobile application for real-time task notifications and offline updates.',
      organization: acme._id,
      manager: alex._id,
      status: 'planning',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });

    // Project Members
    await ProjectMember.create([
      { project: projectPulse._id, user: alex._id, role: 'manager' },
      { project: projectPulse._id, user: sarah._id, role: 'lead' },
      { project: projectPulse._id, user: marcus._id, role: 'developer' },
      { project: projectPulse._id, user: elena._id, role: 'stakeholder' },
      { project: mobileCompanion._id, user: alex._id, role: 'manager' },
      { project: mobileCompanion._id, user: sarah._id, role: 'lead' },
      { project: mobileCompanion._id, user: marcus._id, role: 'developer' },
    ]);
    console.log('Projects and Project Members created.');

    // 5. Labels
    const labels = await Label.create([
      { name: 'Frontend', project: projectPulse._id },
      { name: 'Backend', project: projectPulse._id },
      { name: 'DevOps', project: projectPulse._id },
      { name: 'Bug', project: projectPulse._id },
      { name: 'UI/UX', project: projectPulse._id },
      { name: 'Security', project: projectPulse._id },
    ]);

    const labelMap = {};
    labels.forEach((l) => {
      labelMap[l.name] = l._id;
    });

    // 6. Milestones
    const m1 = await Milestone.create({
      project: projectPulse._id,
      name: 'Milestone 1: Architectural Foundation',
      description: 'Setup schemas, authentication, security middleware and organization RBAC.',
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'completed',
    });

    const m2 = await Milestone.create({
      project: projectPulse._id,
      name: 'Milestone 2: Agile Suite & Kanban',
      description: 'Interactive Kanban board, sprint cycles, task dependencies and notifications.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'in-progress',
    });

    const m3 = await Milestone.create({
      project: projectPulse._id,
      name: 'Milestone 3: Production Release',
      description: 'Comprehensive testing, audits, reporting analytics, and deployment.',
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'pending',
    });

    // 7. Sprints
    const sprint1 = await Sprint.create({
      project: projectPulse._id,
      name: 'Sprint 1 - Foundation & Authentication',
      goal: 'Deliver user auth, database models and base API controllers',
      startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      status: 'completed',
    });

    const sprint2 = await Sprint.create({
      project: projectPulse._id,
      name: 'Sprint 2 - Kanban Board & Real-Time Sync',
      goal: 'Deliver responsive drag-and-drop Kanban board, activity feed and notifications',
      startDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active',
    });

    const sprint3 = await Sprint.create({
      project: projectPulse._id,
      name: 'Sprint 3 - Advanced Analytics & Exporting',
      goal: 'Deliver executive dashboard metrics, PDF summaries, and issue resolution workflows',
      startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      status: 'planned',
    });

    // 8. Tasks
    const t1 = await Task.create({
      project: projectPulse._id,
      sprint: sprint1._id,
      milestone: m1._id,
      title: 'Design MongoDB Schemas & Relations',
      description: 'Define models for Users, Organizations, Teams, Projects, Tasks and Activities with indexes.',
      assignedTo: alex._id,
      createdBy: alex._id,
      status: 'done',
      priority: 'high',
      storyPoints: 5,
      dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      labels: [labelMap['Backend'], labelMap['Security']],
    });

    const t2 = await Task.create({
      project: projectPulse._id,
      sprint: sprint1._id,
      milestone: m1._id,
      title: 'Implement JWT Auth & RBAC Middleware',
      description: 'Create authentication pipeline with bcryptjs and organization/project role guards.',
      assignedTo: marcus._id,
      createdBy: alex._id,
      status: 'done',
      priority: 'urgent',
      storyPoints: 5,
      dueDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      labels: [labelMap['Backend'], labelMap['Security']],
    });

    const t3 = await Task.create({
      project: projectPulse._id,
      sprint: sprint1._id,
      milestone: m1._id,
      title: 'Setup Responsive Sidebar & Topbar Shell',
      description: 'Build Tailwind responsive navigation layout with mobile toggle drawer.',
      assignedTo: sarah._id,
      createdBy: alex._id,
      status: 'done',
      priority: 'medium',
      storyPoints: 3,
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      labels: [labelMap['Frontend'], labelMap['UI/UX']],
    });

    const t4 = await Task.create({
      project: projectPulse._id,
      sprint: sprint2._id,
      milestone: m2._id,
      title: 'Build Interactive Kanban Board',
      description: 'Implement TODO, IN PROGRESS, REVIEW, DONE columns with instant drag-and-drop status update.',
      assignedTo: marcus._id,
      createdBy: sarah._id,
      status: 'in-progress',
      priority: 'urgent',
      storyPoints: 8,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      labels: [labelMap['Frontend'], labelMap['UI/UX']],
      dependencies: [t3._id],
    });

    const t5 = await Task.create({
      project: projectPulse._id,
      sprint: sprint2._id,
      milestone: m2._id,
      title: 'Dynamic Project Dashboard Calculations',
      description: 'Compute total tasks, completion percentage, workload and upcoming milestones with zero-task safety.',
      assignedTo: sarah._id,
      createdBy: alex._id,
      status: 'in-progress',
      priority: 'high',
      storyPoints: 5,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      labels: [labelMap['Backend']],
    });

    const t6 = await Task.create({
      project: projectPulse._id,
      sprint: sprint2._id,
      milestone: m2._id,
      title: 'Task Detail Modal with Comments & Uploads',
      description: 'Modal with full task details, live comment threads, and multer file attachments.',
      assignedTo: marcus._id,
      createdBy: sarah._id,
      status: 'review',
      priority: 'high',
      storyPoints: 5,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      labels: [labelMap['Frontend'], labelMap['Backend']],
    });

    const t7 = await Task.create({
      project: projectPulse._id,
      sprint: sprint2._id,
      milestone: m2._id,
      title: 'Notification Bell & Unread Badge Counter',
      description: 'Deliver real-time notification list with mark-all-as-read and type-specific icons.',
      assignedTo: sarah._id,
      createdBy: alex._id,
      status: 'review',
      priority: 'medium',
      storyPoints: 3,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      labels: [labelMap['Frontend'], labelMap['Backend']],
    });

    const t8 = await Task.create({
      project: projectPulse._id,
      sprint: sprint2._id,
      milestone: m2._id,
      title: 'Fix Overdue Tasks Date Evaluation',
      description: 'Ensure overdue tasks show red banner when past due and not marked as done.',
      assignedTo: marcus._id,
      createdBy: alex._id,
      status: 'todo',
      priority: 'medium',
      storyPoints: 2,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue intentionally for dashboard display!
      labels: [labelMap['Backend'], labelMap['Bug']],
    });

    const t9 = await Task.create({
      project: projectPulse._id,
      sprint: sprint3._id,
      milestone: m3._id,
      title: 'Production Dockerization & CI/CD Pipeline',
      description: 'Setup automated deployment scripts and health-check monitoring.',
      assignedTo: alex._id,
      createdBy: alex._id,
      status: 'todo',
      priority: 'medium',
      storyPoints: 8,
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      labels: [labelMap['DevOps']],
    });

    const t10 = await Task.create({
      project: projectPulse._id,
      sprint: sprint3._id,
      milestone: m3._id,
      title: 'Stakeholder Executive PDF Reports',
      description: 'Allow stakeholders to download weekly velocity and milestone progress snapshots.',
      assignedTo: null,
      createdBy: alex._id,
      status: 'todo',
      priority: 'low',
      storyPoints: 5,
      dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      labels: [labelMap['Frontend']],
    });

    console.log('10 Sample Tasks created across statuses.');

    // 9. Issues
    const i1 = await Issue.create({
      project: projectPulse._id,
      title: 'Safari Session Cookie Expiration on iOS',
      description: 'Users on iOS WebKit browsers get intermittently logged out when backgrounding the tab.',
      reproductionSteps: '1. Open on iOS Safari. 2. Login. 3. Switch apps for 5 minutes. 4. Return to tab.',
      severity: 'critical',
      status: 'in-progress',
      assignedTo: marcus._id,
      reportedBy: sarah._id,
      resolution: '',
    });

    const i2 = await Issue.create({
      project: projectPulse._id,
      title: 'Sprint burndown calculation lag on large backlogs',
      description: 'Queries with 500+ tasks can take over 800ms to calculate story points.',
      reproductionSteps: 'Navigate to Sprints tab on demo enterprise project.',
      severity: 'high',
      status: 'open',
      assignedTo: marcus._id,
      reportedBy: alex._id,
      resolution: '',
    });

    const i3 = await Issue.create({
      project: projectPulse._id,
      title: 'Task Title Overflow on Mobile Kanban',
      description: 'Very long task titles were pushing the status column width beyond viewport bounds.',
      reproductionSteps: 'Resize screen to 375px and create a task with a 100-character title.',
      severity: 'medium',
      status: 'resolved',
      assignedTo: sarah._id,
      reportedBy: elena._id,
      resolution: 'Applied line-clamp-2 and break-words Tailwind utility classes.',
    });

    console.log('Issues created (critical, high, medium).');

    // 10. Comments
    await Comment.create([
      {
        user: sarah._id,
        task: t4._id,
        text: 'Marcus, ensure the drag animation feels smooth and column counts update optimistically!',
      },
      {
        user: marcus._id,
        task: t4._id,
        text: 'Updated with optimistic state! Testing with keyboard navigation now.',
      },
      {
        user: alex._id,
        issue: i1._id,
        text: 'Check SameSite cookie attribute and Secure flags in production headers.',
      },
      {
        user: marcus._id,
        issue: i1._id,
        text: 'Reproduced on Safari 17. Working on the header patch now.',
      },
    ]);

    // 11. Notifications
    await Notification.create([
      {
        user: marcus._id,
        message: 'Alex Morgan assigned you to task: "Build Interactive Kanban Board"',
        type: 'assignment',
        isRead: false,
      },
      {
        user: marcus._id,
        message: 'Sarah Chen commented on your task: "Build Interactive Kanban Board"',
        type: 'comment',
        isRead: false,
      },
      {
        user: sarah._id,
        message: 'Alex Morgan assigned you to task: "Dynamic Project Dashboard Calculations"',
        type: 'assignment',
        isRead: true,
      },
      {
        user: alex._id,
        message: 'Sarah Chen reported Critical Issue: "Safari Session Cookie Expiration on iOS"',
        type: 'issue',
        isRead: false,
      },
      {
        user: elena._id,
        message: 'You have been invited to ProjectPulse SaaS Suite as Stakeholder',
        type: 'invitation',
        isRead: true,
      },
    ]);

    // 12. Activities
    await Activity.create([
      {
        project: projectPulse._id,
        user: alex._id,
        action: 'Alex Morgan created Project: ProjectPulse SaaS Suite',
        entityType: 'Project',
        entityId: projectPulse._id,
      },
      {
        project: projectPulse._id,
        user: alex._id,
        action: 'Alex Morgan completed Milestone: Architectural Foundation',
        entityType: 'Milestone',
        entityId: m1._id,
      },
      {
        project: projectPulse._id,
        user: sarah._id,
        action: 'Sarah Chen started Sprint: Sprint 2 - Kanban Board & Real-Time Sync',
        entityType: 'Sprint',
        entityId: sprint2._id,
      },
      {
        project: projectPulse._id,
        user: marcus._id,
        action: 'Marcus Brody moved "Implement JWT Auth & RBAC Middleware" from IN-PROGRESS to DONE',
        entityType: 'Task',
        entityId: t2._id,
      },
      {
        project: projectPulse._id,
        user: sarah._id,
        action: 'Sarah Chen created Critical Issue: "Safari Session Cookie Expiration on iOS"',
        entityType: 'Issue',
        entityId: i1._id,
      },
      {
        project: projectPulse._id,
        user: sarah._id,
        action: 'Sarah Chen resolved Issue: "Task Title Overflow on Mobile Kanban"',
        entityType: 'Issue',
        entityId: i3._id,
      },
      {
        project: projectPulse._id,
        user: marcus._id,
        action: 'Marcus Brody moved "Task Detail Modal with Comments & Uploads" from IN-PROGRESS to REVIEW',
        entityType: 'Task',
        entityId: t6._id,
      },
    ]);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
