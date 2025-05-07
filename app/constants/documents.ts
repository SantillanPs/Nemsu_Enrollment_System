// Document types
export enum DocumentType {
  TOR = "TOR",
  BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE",
  GRADES = "GRADES",
  CLEARANCE = "CLEARANCE",
}

// Verification statuses
export enum VerificationStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

// Document type labels
export const documentLabels: Record<DocumentType, string> = {
  [DocumentType.TOR]: "Transcript of Records",
  [DocumentType.BIRTH_CERTIFICATE]: "Birth Certificate",
  [DocumentType.GRADES]: "Previous School Grades",
  [DocumentType.CLEARANCE]: "School Clearance",
};

// Required documents for enrollment
export const requiredDocuments: DocumentType[] = [
  DocumentType.TOR,
  DocumentType.BIRTH_CERTIFICATE,
  DocumentType.GRADES,
  DocumentType.CLEARANCE,
];

// Status configuration for UI
export const statusConfig = {
  [VerificationStatus.PENDING]: {
    color: "bg-yellow-500",
    text: "Pending Review",
  },
  [VerificationStatus.VERIFIED]: {
    color: "bg-green-500",
    text: "Verified",
  },
  [VerificationStatus.REJECTED]: {
    color: "bg-red-500",
    text: "Rejected",
  },
};
