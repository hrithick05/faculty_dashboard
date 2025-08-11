-- Migration: Create faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT NOT NULL,
  rdProposalsSangsation INTEGER,
  rdProposalsSubmition INTEGER,
  rdProposals INTEGER,
  rdFunding INTEGER,
  journalPublications INTEGER,
  journalsCoAuthor INTEGER,
  studentPublications INTEGER,
  bookPublications INTEGER,
  patents INTEGER,
  onlineCertifications INTEGER,
  studentProjects INTEGER,
  fdpWorks INTEGER,
  fdpWorps INTEGER,
  industryCollabs INTEGER,
  otherActivities INTEGER,
  academicPassPercentage TEXT,
  effectiveMentoring TEXT
);
