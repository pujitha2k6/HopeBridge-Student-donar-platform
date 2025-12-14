import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, Link, useParams } from 'react-router-dom';
import { Student, Donor, DonorPreferences, VerificationResult } from './types';
import { verifyMarksMemo } from './services/ai';
import { 
  ShieldCheck, 
  Upload, 
  User, 
  Heart, 
  GraduationCap, 
  MapPin, 
  CheckCircle, 
  ChevronRight, 
  AlertCircle,
  Menu,
  Bell,
  LogOut,
  Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- Global Context & Mock Data ---

const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    fullName: 'Harika R.',
    email: 'harika@example.com',
    phone: '9876543210',
    course: 'B.Tech 2nd Year',
    income: 40000,
    location: 'Hyderabad, TS',
    percentage: 86,
    category: 'Single Parent',
    age: 19,
    description: 'Aiming to become a software engineer to support my mother. Need funds for semester fees.',
    isVerified: true,
    documents: [{ type: 'Marks Memo', url: '#', verified: true }],
    photoUrl: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: 's2',
    fullName: 'Rahul K.',
    email: 'rahul@example.com',
    phone: '9876543211',
    course: 'Diploma (Civil)',
    income: 35000,
    location: 'Warangal, TS',
    percentage: 78,
    category: 'Very Poor',
    age: 18,
    description: 'My father is a daily wage worker. I need support for buying books and bus pass.',
    isVerified: true,
    documents: [{ type: 'Marks Memo', url: '#', verified: true }],
    photoUrl: 'https://picsum.photos/200/200?random=2'
  }
];

const AppContext = React.createContext<{
  userRole: 'student' | 'donor' | null;
  setUserRole: (r: 'student' | 'donor' | null) => void;
  students: Student[];
  addStudent: (s: Student) => void;
  currentStudent: Student | null;
  updateCurrentStudent: (s: Partial<Student>) => void;
  donorPrefs: DonorPreferences | null;
  setDonorPrefs: (p: DonorPreferences) => void;
}>({
  userRole: null,
  setUserRole: () => {},
  students: [],
  addStudent: () => {},
  currentStudent: null,
  updateCurrentStudent: () => {},
  donorPrefs: null,
  setDonorPrefs: () => {},
});

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const base = "w-full py-3.5 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 shadow-lg";
  const variants = {
    primary: "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-primary/30",
    secondary: "bg-white text-primary border border-gray-100 hover:bg-gray-50",
    outline: "border-2 border-primary text-primary bg-transparent",
    accent: "bg-accent text-gray-900 hover:bg-accent/90"
  };
  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${variants[variant as keyof typeof variants]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-1">{label}</label>
    <input 
      className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-gray-800 placeholder-gray-400"
      {...props} 
    />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-1">{label}</label>
    <div className="relative">
      <select 
        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-gray-800 appearance-none"
        {...props}
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronRight className="rotate-90 w-5 h-5" />
      </div>
    </div>
  </div>
);

// --- Screens ---

const WelcomeScreen = () => {
  const { setUserRole } = React.useContext(AppContext);
  const navigate = useNavigate();

  const handleSelect = (role: 'student' | 'donor') => {
    setUserRole(role);
    navigate(role === 'student' ? '/student-register' : '/donor-register');
  };

  return (
    <div className="min-h-screen bg-bgLight flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="text-center mb-12 relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-card mb-6">
          <Heart className="w-8 h-8 text-primary fill-primary" />
        </div>
        <h1 className="text-4xl font-bold text-textDark mb-3">HopeBridge</h1>
        <p className="text-gray-500 text-lg max-w-xs mx-auto leading-relaxed">
          No student should stop studying because of money.
        </p>
      </div>

      <div className="w-full max-w-md space-y-4 relative z-10">
        <button 
          onClick={() => handleSelect('student')}
          className="w-full p-6 bg-white rounded-3xl shadow-card hover:shadow-xl transition-all flex items-center justify-between group border border-transparent hover:border-primary/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-800">I am a Student</h3>
              <p className="text-sm text-gray-500">I need financial support</p>
            </div>
          </div>
          <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
        </button>

        <button 
          onClick={() => handleSelect('donor')}
          className="w-full p-6 bg-white rounded-3xl shadow-card hover:shadow-xl transition-all flex items-center justify-between group border border-transparent hover:border-accent/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-orange-600 group-hover:bg-accent group-hover:text-gray-900 transition-colors">
              <Heart className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-800">I am a Donor</h3>
              <p className="text-sm text-gray-500">I want to help students</p>
            </div>
          </div>
          <ChevronRight className="text-gray-300 group-hover:text-orange-500 transition-colors" />
        </button>
      </div>

      <p className="mt-12 text-xs text-gray-400 font-medium tracking-wide uppercase">Connecting Students & Donors with Trust</p>
    </div>
  );
};

const StudentRegistration = () => {
  const navigate = useNavigate();
  const { addStudent, setUserRole } = React.useContext(AppContext);
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', course: '', income: '', location: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      income: Number(formData.income),
      percentage: 0,
      category: 'General',
      age: 20,
      description: '',
      isVerified: false,
      documents: [],
      photoUrl: 'https://picsum.photos/200/200'
    };
    addStudent(newStudent);
    setUserRole('student');
    navigate('/student-dashboard');
  };

  return (
    <div className="min-h-screen bg-white p-6 pb-10">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate('/')} className="mb-6 text-gray-400 hover:text-primary transition-colors">
          <ChevronRight className="rotate-180 w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-textDark mb-2">Create Student Account</h2>
        <p className="text-gray-500 mb-8">Join HopeBridge to find support.</p>

        <form onSubmit={handleSubmit}>
          <Input label="Full Name" placeholder="e.g. Rahul Kumar" required value={formData.fullName} onChange={(e: any) => setFormData({...formData, fullName: e.target.value})} />
          <Input label="Email" type="email" placeholder="rahul@example.com" required value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" placeholder="98765..." required value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} />
            <Input label="Family Income (Yearly)" type="number" placeholder="₹" required value={formData.income} onChange={(e: any) => setFormData({...formData, income: e.target.value})} />
          </div>
          <Input label="Class / Course" placeholder="e.g. B.Tech 2nd Year" required value={formData.course} onChange={(e: any) => setFormData({...formData, course: e.target.value})} />
          <Input label="State / District" placeholder="e.g. Hyderabad, TS" required value={formData.location} onChange={(e: any) => setFormData({...formData, location: e.target.value})} />
          
          <div className="mt-8">
            <Button type="submit">Create Account</Button>
          </div>
          
          <p className="text-center mt-6 text-sm text-gray-500">
            Already registered? <span className="text-primary font-semibold cursor-pointer">Login</span>
          </p>
        </form>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const { currentStudent, setUserRole } = React.useContext(AppContext);
  const navigate = useNavigate();

  if (!currentStudent) return <div>Loading...</div>;

  const handleLogout = () => {
    setUserRole(null);
    navigate('/');
  };

  const progress = currentStudent.isVerified ? 100 : 50;

  return (
    <div className="min-h-screen bg-bgLight pb-24">
      <header className="bg-primary pt-12 pb-24 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex justify-between items-center text-white mb-6 relative z-10">
          <div>
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            <p className="text-white/80 text-sm">Welcome back, {currentStudent.fullName.split(' ')[0]}</p>
          </div>
          <div className="flex gap-3">
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
               <Bell className="w-5 h-5" />
             </div>
             <button onClick={handleLogout} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors" title="Logout">
               <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      <div className="px-6 -mt-16 relative z-20 max-w-md mx-auto space-y-6">
        {/* Profile Completion Card */}
        <div className="bg-white p-6 rounded-3xl shadow-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Profile Completion</h3>
            <span className="text-primary font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-6">
            <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
          
          {!currentStudent.isVerified ? (
             <Button variant="primary" onClick={() => navigate('/upload-memo')}>
               <Upload className="w-5 h-5" /> Upload Marks Memo
             </Button>
          ) : (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100">
              <ShieldCheck className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-bold text-sm">Verified Profile</p>
                <p className="text-xs opacity-80">You are visible to donors.</p>
              </div>
            </div>
          )}
        </div>

        {/* Verification Status */}
        <div className="bg-white p-6 rounded-3xl shadow-card">
          <h3 className="font-bold text-gray-800 mb-4">Document Verification</h3>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${currentStudent.isVerified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
              {currentStudent.isVerified ? <CheckCircle className="w-6 h-6" /> : <Loader2 className="w-6 h-6 animate-spin" />}
            </div>
            <div>
              <p className="font-bold text-gray-800">{currentStudent.isVerified ? 'Verified' : 'Pending Action'}</p>
              <p className="text-sm text-gray-500">{currentStudent.isVerified ? 'Documents approved by AI' : 'Please upload your memo'}</p>
            </div>
          </div>
        </div>

        {/* Support Status */}
        <div className="bg-white p-6 rounded-3xl shadow-card relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-accent/10 rounded-bl-full"></div>
          <h3 className="font-bold text-gray-800 mb-2">Scholarship Status</h3>
          <p className="text-gray-500 text-sm mb-4">We are matching you with potential donors.</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            Searching for Donors
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadMarksMemo = () => {
  const navigate = useNavigate();
  const { updateCurrentStudent } = React.useContext(AppContext);
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleVerify = async () => {
    if (!file) return;
    setIsVerifying(true);
    const data = await verifyMarksMemo(file);
    setResult(data);
    setIsVerifying(false);

    if (data.isValid) {
        // Automatically verify student for demo flow
        setTimeout(() => {
             updateCurrentStudent({ isVerified: true, percentage: data.percentage });
             navigate('/student-dashboard');
        }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200">
                <ChevronRight className="rotate-180 w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">Upload Documents</h2>
        </div>

        <div className="border-2 border-dashed border-primary/30 bg-primary/5 rounded-3xl p-8 text-center mb-8 relative">
           <input 
             type="file" 
             accept="image/*,.pdf"
             onChange={handleFileChange}
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
           />
           <div className="flex flex-col items-center pointer-events-none">
             <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-primary mb-4">
               {file ? <CheckCircle className="w-8 h-8 text-green-500" /> : <Upload className="w-8 h-8" />}
             </div>
             <p className="font-semibold text-gray-800 mb-1">{file ? file.name : "Tap to Upload Marks Memo"}</p>
             <p className="text-xs text-gray-500">{file ? "Click 'Verify' below" : "Supports: JPG, PNG, PDF (Max 5MB)"}</p>
           </div>
        </div>

        {file && !result && (
          <Button onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Verifying with AI...
                </>
            ) : "Verify using AI"}
          </Button>
        )}

        {result && (
            <div className={`mt-6 p-5 rounded-2xl border ${result.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-3">
                    {result.isValid ? <ShieldCheck className="w-6 h-6 text-green-600 mt-1" /> : <AlertCircle className="w-6 h-6 text-red-600 mt-1" />}
                    <div>
                        <h4 className={`font-bold ${result.isValid ? 'text-green-800' : 'text-red-800'}`}>
                            {result.isValid ? "Verification Successful" : "Verification Failed"}
                        </h4>
                        <p className="text-sm opacity-80 mt-1">{result.reason}</p>
                        {result.isValid && (
                            <div className="mt-3 inline-block px-3 py-1 bg-white rounded-lg text-xs font-bold text-green-700 shadow-sm">
                                Detected Percentage: {result.percentage}%
                            </div>
                        )}
                    </div>
                </div>
                {result.isValid && <p className="text-xs text-center text-green-600 mt-4 animate-pulse">Redirecting to Dashboard...</p>}
            </div>
        )}

        <div className="mt-8 flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
             <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
             <p className="text-xs text-gray-500 leading-relaxed">
                 <span className="font-bold text-gray-700">AI Security:</span> Our AI automatically detects fake or modified certificates. Only original documents issued by the board/university will be accepted.
             </p>
        </div>
      </div>
    </div>
  );
};

const DonorRegistration = () => {
  const navigate = useNavigate();
  const { setDonorPrefs } = React.useContext(AppContext);
  const [prefs, setPrefs] = useState<DonorPreferences>({
      budget: 5000,
      genderPref: 'Any',
      familyBgPref: 'Any',
      studyLevelPref: 'Any',
      locationPref: ''
  });

  const handleSave = () => {
    setDonorPrefs(prefs);
    navigate('/donor-dashboard');
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate('/')} className="mb-6 text-gray-400 hover:text-primary transition-colors">
          <ChevronRight className="rotate-180 w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-textDark mb-2">Donor Preferences</h2>
        <p className="text-gray-500 mb-8">Help us match you with the right students.</p>

        <Input 
            label="Monthly Budget (₹)" 
            type="number" 
            value={prefs.budget} 
            onChange={(e: any) => setPrefs({...prefs, budget: Number(e.target.value)})} 
        />
        
        <Select 
            label="Gender Preference"
            options={['Any', 'Female', 'Male']}
            value={prefs.genderPref}
            onChange={(e: any) => setPrefs({...prefs, genderPref: e.target.value})}
        />

        <Select 
            label="Family Background"
            options={['Any', 'Very Poor', 'Single Parent', 'Orphan']}
            value={prefs.familyBgPref}
            onChange={(e: any) => setPrefs({...prefs, familyBgPref: e.target.value})}
        />

        <Select 
            label="Study Level"
            options={['Any', 'School', 'Intermediate', 'Degree', 'Engineering']}
            value={prefs.studyLevelPref}
            onChange={(e: any) => setPrefs({...prefs, studyLevelPref: e.target.value})}
        />

        <Input 
            label="Preferred Location (Optional)" 
            placeholder="e.g. Hyderabad" 
            value={prefs.locationPref} 
            onChange={(e: any) => setPrefs({...prefs, locationPref: e.target.value})} 
        />

        <div className="mt-8">
            <Button onClick={handleSave}>Save & Find Students</Button>
        </div>
      </div>
    </div>
  );
};

const DonorDashboard = () => {
  const { students, donorPrefs, setUserRole } = React.useContext(AppContext);
  const navigate = useNavigate();

  // Simple filter logic
  const matches = students.filter(s => {
      // Allow general matches for demo if preferences are 'Any' or match
      const genderMatch = donorPrefs?.genderPref === 'Any' || true; 
      return s.isVerified && genderMatch;
  });

  const handleLogout = () => {
    setUserRole(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bgLight pb-24">
      <header className="bg-white pt-12 pb-8 px-6 rounded-b-[2.5rem] shadow-soft mb-8">
         <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-gray-900">Welcome, Donor!</h1>
             <div className="flex gap-3">
                 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                     <User className="w-5 h-5" />
                 </div>
                 <button onClick={handleLogout} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors" title="Logout">
                    <LogOut className="w-5 h-5" />
                 </button>
             </div>
         </div>
         
         <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
             <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                 <Heart className="w-40 h-40 fill-current" />
             </div>
             <h2 className="text-xl font-bold mb-2">Impact Summary</h2>
             <div className="flex gap-8 mt-4">
                 <div>
                     <p className="text-xs opacity-80 mb-1">Students Matched</p>
                     <p className="text-2xl font-bold">{matches.length}</p>
                 </div>
                 <div>
                     <p className="text-xs opacity-80 mb-1">Lives Changed</p>
                     <p className="text-2xl font-bold">0</p>
                 </div>
             </div>
         </div>
      </header>

      <div className="px-6 max-w-md mx-auto">
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-bold text-lg text-gray-800">New Matches</h3>
            <Link to="/matched-students" className="text-sm text-primary font-semibold">View All</Link>
          </div>

          <div className="space-y-4">
              {matches.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">No verified students found yet.</div>
              ) : matches.slice(0, 2).map(student => (
                  <div key={student.id} className="bg-white p-5 rounded-3xl shadow-card flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => navigate(`/student/${student.id}`)}>
                      <img src={student.photoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover bg-gray-200" />
                      <div className="flex-1">
                          <div className="flex justify-between items-start">
                              <h4 className="font-bold text-gray-900">{student.fullName}</h4>
                              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">86%</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{student.course}</p>
                          <div className="flex gap-2">
                              <span className="text-[10px] bg-accent/20 text-orange-800 px-2 py-1 rounded-lg font-medium">{student.category}</span>
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">₹{student.income}/yr</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          <div className="mt-8 bg-white p-6 rounded-3xl shadow-soft">
              <h3 className="font-bold text-gray-800 mb-4">Your Preferences</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-gray-400 text-xs mb-1">Budget</p>
                      <p className="font-semibold text-gray-800">₹{donorPrefs?.budget}/mo</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-gray-400 text-xs mb-1">Gender</p>
                      <p className="font-semibold text-gray-800">{donorPrefs?.genderPref}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-gray-400 text-xs mb-1">Education</p>
                      <p className="font-semibold text-gray-800">{donorPrefs?.studyLevelPref}</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

const MatchedList = () => {
    const { students } = React.useContext(AppContext);
    const navigate = useNavigate();
    
    return (
        <div className="min-h-screen bg-bgLight p-6">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white shadow-sm rounded-xl">
                        <ChevronRight className="rotate-180 w-5 h-5 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">Recommended Students</h2>
                </div>

                <div className="space-y-5">
                    {students.filter(s => s.isVerified).map(student => (
                         <div key={student.id} className="bg-white p-5 rounded-3xl shadow-card cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate(`/student/${student.id}`)}>
                             <div className="flex gap-4 mb-4">
                                <img src={student.photoUrl} className="w-20 h-20 rounded-2xl object-cover bg-gray-200" alt={student.fullName}/>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-gray-900">{student.fullName}</h3>
                                        <ShieldCheck className="w-4 h-4 text-green-500" />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1">{student.course}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <MapPin className="w-3 h-3" /> {student.location}
                                    </div>
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-3 gap-2 mb-5">
                                 <div className="text-center p-2 bg-gray-50 rounded-xl">
                                     <p className="text-[10px] text-gray-400">Score</p>
                                     <p className="font-bold text-primary">{student.percentage}%</p>
                                 </div>
                                 <div className="text-center p-2 bg-gray-50 rounded-xl">
                                     <p className="text-[10px] text-gray-400">Income</p>
                                     <p className="font-bold text-gray-700">₹{student.income/1000}k</p>
                                 </div>
                                 <div className="text-center p-2 bg-gray-50 rounded-xl">
                                     <p className="text-[10px] text-gray-400">Category</p>
                                     <p className="font-bold text-gray-700 text-[10px] truncate">{student.category}</p>
                                 </div>
                             </div>

                             <div className="flex gap-3">
                                 <Button variant="secondary" className="flex-1 py-2 text-sm" onClick={(e: any) => {
                                     e.stopPropagation();
                                     navigate(`/student/${student.id}`)
                                 }}>View Profile</Button>
                                 <Button variant="primary" className="flex-1 py-2 text-sm shadow-none" onClick={(e: any) => e.stopPropagation()}>Support Now</Button>
                             </div>
                         </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StudentDetail = () => {
    const { students } = React.useContext(AppContext);
    const { id } = useParams();
    const navigate = useNavigate();
    const student = students.find(s => s.id === id);

    if (!student) return <div>Student not found</div>;

    const chartData = [
        { name: '10th', score: student.percentage - 10 },
        { name: '12th', score: student.percentage - 5 },
        { name: 'Curr', score: student.percentage },
    ];

    return (
        <div className="min-h-screen bg-white">
            <div className="h-48 bg-primary relative">
                 <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur-md text-white rounded-xl z-10 hover:bg-white/30 transition-colors">
                    <ChevronRight className="rotate-180 w-5 h-5" />
                 </button>
            </div>
            
            <div className="max-w-md mx-auto px-6 -mt-16 relative z-10 pb-24">
                <div className="bg-white rounded-3xl shadow-xl p-6 text-center mb-6">
                    <div className="w-24 h-24 mx-auto rounded-full p-1 bg-white shadow-sm -mt-16 mb-3">
                         <img src={student.photoUrl} className="w-full h-full rounded-full object-cover" alt="" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                        {student.fullName}
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                    </h1>
                    <p className="text-gray-500 mb-4">{student.course} • {student.age} Years</p>
                    
                    <div className="flex justify-center gap-2">
                        <span className="bg-accent/10 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">{student.category}</span>
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{student.location}</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">My Story</h3>
                        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-2xl">
                            "{student.description || "I am a dedicated student coming from a humble background. My family struggles to make ends meet, but I dream of completing my education to support them. Your help would change my life."}"
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Academic Performance</h3>
                        <div className="h-48 w-full bg-gray-50 rounded-2xl p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#553CFF" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#553CFF" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                    <Area type="monotone" dataKey="score" stroke="#553CFF" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Documents</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {student.documents.map((doc, i) => (
                                <div key={i} className="min-w-[120px] h-32 bg-gray-100 rounded-xl flex flex-col items-center justify-center border border-gray-200">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-red-500">
                                        <span className="font-bold text-[10px]">PDF</span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-700">{doc.type}</p>
                                    {doc.verified && <span className="text-[10px] text-green-600 flex items-center mt-1"><CheckCircle className="w-3 h-3 mr-1"/> Verified</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-6 left-6 right-6 max-w-md mx-auto">
                    <Button variant="primary" className="shadow-2xl shadow-primary/40">
                        Support This Student <Heart className="w-5 h-5 fill-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- Main App & Routing ---

const AppContent = () => {
    return (
        <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/student-register" element={<StudentRegistration />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/upload-memo" element={<UploadMarksMemo />} />
            
            <Route path="/donor-register" element={<DonorRegistration />} />
            <Route path="/donor-dashboard" element={<DonorDashboard />} />
            <Route path="/matched-students" element={<MatchedList />} />
            <Route path="/student/:id" element={<StudentDetail />} />
        </Routes>
    );
};

export default function App() {
  const [userRole, setUserRole] = useState<'student' | 'donor' | null>(null);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [donorPrefs, setDonorPrefs] = useState<DonorPreferences | null>(null);

  const addStudent = (s: Student) => {
      setStudents([...students, s]);
      setCurrentStudent(s);
  };

  const updateCurrentStudent = (update: Partial<Student>) => {
      if (currentStudent) {
          const updated = { ...currentStudent, ...update };
          setCurrentStudent(updated);
          setStudents(students.map(s => s.id === updated.id ? updated : s));
      }
  };

  return (
    <AppContext.Provider value={{ 
        userRole, setUserRole, 
        students, addStudent, 
        currentStudent, updateCurrentStudent,
        donorPrefs, setDonorPrefs
    }}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppContext.Provider>
  );
}