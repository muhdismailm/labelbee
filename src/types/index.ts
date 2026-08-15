export interface SlipData {
  schoolName: string;
  schoolMotto: string;
  academicYear: string;
  studentName: string;
  grade: string;
  section: string;
  rollNo: string;
  busNo: string;
  bloodGroup: string;
  contactNo: string;
  subject: string; // Default or fallback subject
  subjects: string[]; // Per-slip individual subjects (e.g. Slip 1: Math, Slip 2: Science)
  subjectMode: 'blank' | 'custom'; // 'blank' for handwriting, 'custom' for per-slip typed subjects
  photoUrl: string | null;
  photoZoom: number; // Zoom level (100% to 300%)
  photoTilt: number; // Rotate angle (-180 to 180)
  photoX: number; // Horizontal pan offset (-100 to 100 px)
  photoY: number; // Vertical pan offset (-100 to 100 px)
  photoFrameSize: number; // Size of the photo frame container (45 to 95)
  template: 'classic' | 'modern' | 'playful' | 'unicorn' | 'bookcard' | 'space' | 'sunshine' | 'science' | 'garden' | 'doodle';
  colorTheme: string;
  pattern: 'none' | 'dots' | 'waves' | 'grid' | 'confetti'; // Added for background materials
  aiBackgroundUrl: string | null; // Added for Gemini AI background image
  slipSize: '8' | '10' | 'large' | 'medium' | 'small'; // 8 or 10 slips per A4 sheet
}

export const defaultSlipData: SlipData = {
  schoolName: "",
  schoolMotto: "",
  academicYear: "",
  studentName: "",
  grade: "",
  section: "",
  rollNo: "",
  busNo: "",
  bloodGroup: "",
  contactNo: "",
  subject: "",
  subjects: [],
  subjectMode: 'blank',
  photoUrl: null,
  photoZoom: 100,
  photoTilt: 0,
  photoX: 0,
  photoY: 0,
  photoFrameSize: 65,
  template: 'unicorn',
  colorTheme: '#6366f1',
  pattern: 'confetti',
  aiBackgroundUrl: null,
  slipSize: '10',
};
