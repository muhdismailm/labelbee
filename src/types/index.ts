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
  subject: string; // Added for Notebook subject line (e.g. Math, English)
  photoUrl: string | null;
  photoZoom: number; // Zoom level (100% to 300%)
  photoTilt: number; // Rotate angle (-180 to 180)
  photoX: number; // Horizontal pan offset (-100 to 100 px)
  photoY: number; // Vertical pan offset (-100 to 100 px)
  photoFrameSize: number; // Size of the photo frame container (45 to 95)
  template: 'classic' | 'modern' | 'playful' | 'unicorn';
  colorTheme: string;
  pattern: 'none' | 'dots' | 'waves' | 'grid' | 'confetti'; // Added for background materials
  aiBackgroundUrl: string | null; // Added for Gemini AI background image
  slipSize: 'large' | 'medium' | 'small'; // The size determines how many fit on A4
}

export const defaultSlipData: SlipData = {
  schoolName: "Sunrise International School",
  schoolMotto: "Knowledge is Power",
  academicYear: "2026 - 2027",
  studentName: "Ahmad Zaid bin Abdullah",
  grade: "Grade 5",
  section: "A",
  rollNo: "12",
  busNo: "",
  bloodGroup: "",
  contactNo: "",
  subject: "Mathematics",
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
  slipSize: 'medium',
};
