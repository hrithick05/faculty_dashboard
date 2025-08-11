export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  rdproposalssangsation: number | null;
  rdproposalssubmition: number | null;
  rdproposals: number | null;
  rdfunding: number | null;
  journalpublications: number | null;
  journalscoauthor: number | null;
  studentpublications: number | null;
  bookpublications: number | null;
  patents: number | null;
  onlinecertifications: number | null;
  studentprojects: number | null;
  fdpworks: number | null;
  fdpworps: number | null;
  industrycollabs: number | null;
  otheractivities: number | null;
  academicpasspercentage: string | null;
  effectivementoring: string | null;
}

export interface AchievementType {
  key: string;
  label: string;
  shortLabel: string;
}
