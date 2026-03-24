export const SkillsPreview = ({ skills }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200  mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Skills Snapshot
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((skill, index) => (
          <SkillTag
            key={index}
            skill={skill.name}
            level={skill.level}
            highlighted={skill.highlighted}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-gray-600 text-sm">3 Certifications</span>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};