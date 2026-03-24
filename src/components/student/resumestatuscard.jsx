export const ResumeStatusCard = ({ resumeUploaded, lastUpdated }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200  mt-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        Resume Status
      </h3>

      <div className="mb-4">
        {resumeUploaded ? (
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Resume Uploaded</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">No Resume</span>
          </div>
        )}
        {resumeUploaded && (
          <p className="text-gray-500 text-sm">Last updated: {lastUpdated}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium text-sm transition-colors duration-300 flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" /> Preview
        </button>
        <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors duration-300 flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" /> Upload
        </button>
      </div>
    </div>
  );
};