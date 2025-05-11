export interface Faculty {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export interface Enrollment {
  id: string;
  status: string;
  grade: string | null;
  studentId: string;
  courseId: string;
  sectionId: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface Section {
  id: string;
  sectionCode: string;
  schedule: string;
  room: string;
  maxStudents: number;
  courseId: string;
  enrollments: Enrollment[];
}

export interface Prerequisite {
  id: string;
  code: string;
  name: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  capacity: number;
  year: number;
  semester: string;
  status: string;
  facultyId: string | null;
  faculty?: Faculty;
  sections: Section[];
  enrollments: Enrollment[];
  prerequisites: Prerequisite[];
  createdAt: string;
  updatedAt: string;
}
