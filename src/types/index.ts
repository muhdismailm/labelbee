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
  pattern?: 'none' | 'dots' | 'waves' | 'grid' | 'confetti';
  aiBackgroundUrl: string | null; // Added for Gemini AI or custom background image
  bgZoom?: number; // Background zoom level (100% to 300%)
  bgTilt?: number; // Background rotation angle (-180 to 180)
  bgX?: number; // Background horizontal pan offset (-100 to 100 %)
  bgY?: number; // Background vertical pan offset (-100 to 100 %)
  slipSize: '8' | '10' | 'large' | 'medium' | 'small'; // 8 or 10 slips per A4 sheet
  // Premium Plan AI Composer
  composedSlipUrl: string | null; // Final Gemini-composed name slip image (replaces HTML overlay)
  stylePrompt: string; // User's style/composition instructions for Gemini
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
  aiBackgroundUrl: null,
  bgZoom: 100,
  bgTilt: 0,
  bgX: 0,
  bgY: 0,
  slipSize: '10',
  composedSlipUrl: null,
  stylePrompt: '',
};
