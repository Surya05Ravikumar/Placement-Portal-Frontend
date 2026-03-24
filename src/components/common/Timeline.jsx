import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

const Timeline = ({ 
    applicationStart, 
    applicationDeadline, 
    driveDate, 
    className = "" 
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return "TBD";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "TBD";
        
        return date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const timelineItems = [
        {
            label: 'Application Start',
            date: applicationStart,
            icon: <Calendar className="w-5 h-5" />,
            borderColor: 'border-slate-800',
            iconColor: 'text-gray-400',
            bgColor: 'bg-[#020617]'
        },
        {
            label: 'Application Deadline',
            date: applicationDeadline,
            icon: <Clock className="w-5 h-5" />,
            borderColor: 'border-yellow-900/50',
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-500/5'
        },
        {
            label: 'Drive Date',
            date: driveDate,
            icon: <Calendar className="w-5 h-5" />,
            borderColor: 'border-blue-900/50',
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-500/5'
        }
    ];

    return (
        <div className={`space-y-4 ${className}`}>
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6">Timeline</h3>
            <div className="space-y-3">
                {timelineItems.map((item, index) => {
                    const dateText = formatDate(item.date);
                    const isTBD = dateText === "TBD";
                    
                    return (
                        <div 
                            key={index}
                            className={`flex items-center gap-4 p-5 rounded-xl border transition-all duration-300 ${item.bgColor} ${item.borderColor}`}
                        >
                            <div className={`${item.iconColor} p-2 rounded-lg bg-white/5`}>
                                {item.icon}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                                    {item.label}
                                </span>
                                <span className={`text-lg font-black uppercase tracking-tight ${isTBD ? 'text-gray-400 dark:text-slate-500' : 'text-gray-900 dark:text-white'}`}>
                                    {dateText}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Timeline;
