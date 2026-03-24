import { Award, ChevronRight, Eye, FileText, Upload, Trash2, Zap, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import profileImage from '../../assets/rajkumarprofile.avif';

const levelStyles = {
  beginner: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30",
  intermediate: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30",
  advanced: "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30"
};

import HighlightText from '../common/HighlightText';

// StudentProfileCard Component - Combined with Skills and Resume
const StudentProfileCard = ({ student, skills, lastUpdated, searchQuery, onResumeDelete }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const studentData = student || {
    name: "Surya RaviKumar",
    registerNumber: "21CS045",
    department: "Computer Science",
    resumes: []
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Content = reader.result;
          const resumePayload = {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            fileData: base64Content
          };

          await axios.post(`${import.meta.env.VITE_API_URL}/api/users/${studentData.registerNumber}/resumes`, resumePayload);
          // Refresh data if possible, or reload
          window.location.reload();
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-[#020617] rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors duration-300 shadow-sm dark:shadow-black/20 sticky top-31">
      {/* Profile Section */}
      <div
        className="flex flex-col items-center text-center mb-6 pb-6 border-b border-gray-200 dark:border-slate-800 cursor-pointer group"
        onClick={() => navigate('/profile')}
      >
        <div className="w-24 h-24 rounded-full mb-4 group-hover:scale-105 transition-all outline outline-offset-2 outline-blue-500 overflow-hidden shadow-md">
          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <HighlightText text={studentData.name} highlight={searchQuery} />
        </h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
          <HighlightText text={studentData.registerNumber} highlight={searchQuery} />
        </p>
        <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
          <HighlightText text={studentData.department} highlight={searchQuery} />
        </p>
      </div>

      {/* Skills Section */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            Skills
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {skills?.map((skill, index) => (
            <div
              key={index}
              className={`px-3 py-1 rounded-full border ${levelStyles[skill.level?.toLowerCase()] || "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700"} text-xs font-bold flex items-center gap-1.5 transition-colors`}
            >
              {skill.image ? (
                <img src={skill.image} alt={skill.name} className="w-3 h-3 object-contain" />
              ) : (
                <Zap className="w-3 h-3" />
              )}
              <HighlightText text={skill.name} highlight={searchQuery} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-800">
          <span className="text-gray-600 dark:text-slate-400 text-sm font-medium">
            {studentData.certificationCount || 0} Certifications
          </span>
          <button
            onClick={() => navigate('/profile')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-bold flex items-center gap-1 transition-colors"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Resume Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            Resume Manager
          </h3>
          <button
            onClick={handleUploadClick}
            className="p-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
            title="Upload New Resume"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-800">
          {studentData.resumes && studentData.resumes.length > 0 ? (
            studentData.resumes.map((resume) => {
              const resumeId = resume._id || resume.id;
              return (
                <div key={resumeId} className="p-3 border border-gray-100 dark:border-slate-800 rounded-lg bg-gray-50/50 dark:bg-slate-900/50 group hover:border-blue-200 dark:hover:border-blue-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                      <p className="text-xs font-bold text-gray-900 dark:text-slate-200 truncate" title={resume.name}>{resume.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-tight">{resume.size}</span>
                    <div className="flex gap-2">
                      <button className="p-1 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onResumeDelete && onResumeDelete(resumeId)}
                        className="p-1 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-lg">
              <FileText className="w-8 h-8 text-gray-200 dark:text-slate-800 mx-auto mb-2" />
              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">No resumes uploaded</p>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx"
        />
      </div>
    </div>
  );
};

export default StudentProfileCard;
