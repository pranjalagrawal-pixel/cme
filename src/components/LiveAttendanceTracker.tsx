import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Download, 
  Search, 
  Filter, 
  Sparkles,
  UserCheck,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  rollNumber: string;
  studentClass: string;
  joinTime: string; // e.g. "10:02 AM"
  joinTimestamp: number;
  status: 'present_ontime' | 'present_late' | 'absent' | 'excused';
  minutesLate: number;
  durationMinutes: number;
}

interface LiveAttendanceTrackerProps {
  meetingId?: string;
  subject?: string;
  studentClass?: string;
  startedAtTime?: string;
  activeParticipants?: string[];
}

export default function LiveAttendanceTracker({
  meetingId = 'class_live_default',
  subject = 'Science',
  studentClass = '10',
  startedAtTime = '10:00 AM',
  activeParticipants = []
}: LiveAttendanceTrackerProps) {
  const { addToast } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const storageKey = `cme_attendance_${meetingId}`;

  // Attendance is built only from participants supplied by the live classroom.
  // Automated attendance initialization & live participant sync
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    let initialRecords: AttendanceRecord[] = [];

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) initialRecords = parsed;
      } catch (e) {
        console.error('Error parsing attendance records:', e);
      }
    }

    // Never invent an enrolled roster or attendance. Only track actual participants.
    const participantNames = Array.from(new Set((activeParticipants || []).filter(Boolean)));
    const now = Date.now();
    const participantRecords: AttendanceRecord[] = participantNames.map((name, index) => {
      const existing = initialRecords.find(r => r.studentName.toLowerCase() === name.toLowerCase());
      return existing || {
        studentId: `participant_${index}_${now}`,
        studentName: name,
        rollNumber: '',
        studentClass,
        joinTime: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        joinTimestamp: now,
        status: 'present_ontime',
        minutesLate: 0,
        durationMinutes: 0
      };
    });

    const nextRecords = participantRecords.length > 0 ? participantRecords : initialRecords.filter(r => participantNames.includes(r.studentName));
    setRecords(nextRecords);
    localStorage.setItem(storageKey, JSON.stringify(nextRecords));
  }, [storageKey, activeParticipants, studentClass]);

  // Save changes
  const saveRecords = (newRecords: AttendanceRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem(storageKey, JSON.stringify(newRecords));
  };

  // Toggle or override status manually
  const updateStatus = (studentId: string, newStatus: AttendanceRecord['status']) => {
    const updated = records.map((r) => {
      if (r.studentId === studentId) {
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...r,
          status: newStatus,
          joinTime: newStatus === 'absent' ? '--:--' : r.joinTime === '--:--' ? nowStr : r.joinTime
        };
      }
      return r;
    });
    saveRecords(updated);
    addToast({
      title: 'Attendance Updated 📝',
      description: `Marked student status as ${newStatus.replace('_', ' ').toUpperCase()}.`,
      type: 'info'
    });
  };

  // Metrics
  const totalCount = (records || []).length;
  const onTimeCount = (records || []).filter((r) => r && r.status === 'present_ontime').length;
  const lateCount = (records || []).filter((r) => r && r.status === 'present_late').length;
  const absentCount = (records || []).filter((r) => r && r.status === 'absent').length;
  const excusedCount = (records || []).filter((r) => r && r.status === 'excused').length;
  const presentTotal = onTimeCount + lateCount + excusedCount;
  const attendanceRate = totalCount > 0 ? Math.round((presentTotal / totalCount) * 100) : 0;

  // Filtered List
  const filteredRecords = (records || []).filter((rec) => {
    if (!rec) return false;
    const matchesSearch =
      (rec.studentName || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (rec.rollNumber || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && rec.status === filterStatus;
  });

  // Export Attendance CSV
  const exportCSV = () => {
    const headers = ['Student ID,Student Name,Roll Number,Class,Subject,Join Time,Status,Minutes Late,Duration (Mins)'];
    const rows = (records || []).map(
      (r) =>
        `"${r.studentId}","${r.studentName}","${r.rollNumber}","${r.studentClass}","${subject}","${r.joinTime}","${r.status}","${r.minutesLate}","${r.durationMinutes}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CME_Live_Attendance_${subject}_Class${studentClass}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      title: 'Attendance Report Exported 📊',
      description: 'Downloaded live session CSV attendance ledger.',
      type: 'success'
    });
  };

  const getStatusBadge = (status: AttendanceRecord['status'], minsLate: number) => {
    switch (status) {
      case 'present_ontime':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> Present (On Time)
          </span>
        );
      case 'present_late':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-800 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-0.5 rounded-md border border-amber-300">
            <Clock className="h-3 w-3" /> Late (+{minsLate}m)
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-red-800 bg-red-100 dark:bg-red-950/60 dark:text-red-300 px-2.5 py-0.5 rounded-md border border-red-300">
            <XCircle className="h-3 w-3" /> Absent
          </span>
        );
      case 'excused':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-blue-800 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 px-2.5 py-0.5 rounded-md border border-blue-300">
            <AlertCircle className="h-3 w-3" /> Excused Leave
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-[#061F48]/15 dark:border-gray-800 p-6 md:p-8 shadow-md space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#061F48]/10 dark:border-gray-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#F8F5ED] dark:bg-gray-800 text-[#061F48] dark:text-gray-300 px-3 py-1 rounded-full border border-[#061F48]/10 dark:border-gray-700">
            <UserCheck className="h-3.5 w-3.5 text-[#D09515]" />
            <span className="text-[10px] font-black uppercase tracking-wider">Automated Real-Time Join-Time Log</span>
          </div>
          <h3 className="text-xl font-black text-[#061F48] dark:text-white mt-1.5 flex items-center gap-2">
            <span>Live Session Attendance Tracker</span>
          </h3>
          <p className="text-xs text-[#061F48]/70 dark:text-gray-400 font-semibold">
            Class {studentClass}th • {subject} | Meeting Started: <span className="text-[#D09515] font-black">{startedAtTime}</span>
          </p>
        </div>

        {/* METRIC BADGES & EXPORT */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-[#F8F5ED] dark:bg-gray-800 border border-[#061F48]/10 dark:border-gray-700 px-4 py-2 rounded-2xl flex items-center gap-3">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#061F48]/50 dark:text-gray-400 block">Attendance</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{attendanceRate}%</span>
            </div>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#061F48]/50 dark:text-gray-400 block">Present</span>
              <span className="text-sm font-black text-[#061F48] dark:text-white">{presentTotal} / {totalCount}</span>
            </div>
          </div>

          <button
            onClick={exportCSV}
            className="bg-[#061F48] hover:bg-[#D09515] text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* QUICK SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-3.5 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-black text-emerald-800 dark:text-emerald-300">{onTimeCount}</span>
            <p className="text-[9.5px] font-bold text-emerald-700/80 dark:text-emerald-400/80 uppercase">On Time (&le;5m)</p>
          </div>
        </div>

        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-3.5 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-black text-amber-800 dark:text-amber-300">{lateCount}</span>
            <p className="text-[9.5px] font-bold text-amber-700/80 dark:text-amber-400/80 uppercase">Late (&gt;5m)</p>
          </div>
        </div>

        <div className="bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 p-3.5 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-black text-red-800 dark:text-red-300">{absentCount}</span>
            <p className="text-[9.5px] font-bold text-red-700/80 dark:text-red-400/80 uppercase">Absent</p>
          </div>
        </div>

        <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 p-3.5 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-black text-blue-800 dark:text-blue-300">{totalCount}</span>
            <p className="text-[9.5px] font-bold text-blue-700/80 dark:text-blue-400/80 uppercase">Total Enrolled</p>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pupil name or roll no..."
            className="w-full bg-[#F8F5ED] dark:bg-gray-800 border border-[#061F48]/10 dark:border-gray-700 pl-8 pr-3 py-2 rounded-xl text-xs font-bold text-[#061F48] dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0 mr-1" />
          {[
            { id: 'all', label: 'All Students' },
            { id: 'present_ontime', label: 'On Time' },
            { id: 'present_late', label: 'Late' },
            { id: 'absent', label: 'Absent' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                filterStatus === f.id
                  ? 'bg-[#061F48] text-white dark:bg-[#D09515] dark:text-[#061F48]'
                  : 'bg-[#F8F5ED] text-[#061F48]/70 dark:bg-gray-800 dark:text-gray-300 hover:bg-[#061F48]/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ATTENDANCE TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-[#061F48]/10 dark:border-gray-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F5ED] dark:bg-gray-800/80 border-b border-[#061F48]/10 dark:border-gray-700 text-[9.5px] font-black uppercase tracking-wider text-[#061F48] dark:text-gray-300">
              <th className="p-3">Student Name</th>
              <th className="p-3">Roll Number</th>
              <th className="p-3">Join Time</th>
              <th className="p-3">Automated Status</th>
              <th className="p-3 text-right">Manual Override</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs font-bold text-[#061F48] dark:text-gray-200">
            {(filteredRecords || []).length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400 dark:text-gray-500 font-semibold">
                  No matching student attendance records found.
                </td>
              </tr>
            ) : (
              (filteredRecords || []).map((record) => (
                <tr key={record.studentId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-3 font-extrabold flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#061F48] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                      {record.studentName.charAt(0)}
                    </div>
                    <span>{record.studentName}</span>
                  </td>

                  <td className="p-3 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                    {record.rollNumber}
                  </td>

                  <td className="p-3 font-bold text-gray-700 dark:text-gray-300">
                    {record.joinTime}
                  </td>

                  <td className="p-3">
                    {getStatusBadge(record.status, record.minutesLate)}
                  </td>

                  <td className="p-3 text-right">
                    <select
                      value={record.status}
                      onChange={(e) => updateStatus(record.studentId, e.target.value as any)}
                      className="bg-gray-100 dark:bg-gray-800 text-[#061F48] dark:text-gray-200 text-[10px] font-bold rounded-lg px-2 py-1 border border-gray-300 dark:border-gray-700 focus:outline-none cursor-pointer"
                    >
                      <option value="present_ontime">Present (On Time)</option>
                      <option value="present_late">Present (Late)</option>
                      <option value="absent">Absent</option>
                      <option value="excused">Excused Leave</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
