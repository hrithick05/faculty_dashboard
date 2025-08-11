import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { achievementTypes, fetchFacultyById, fetchFacultyData } from '../data/mockFaculty';

const getTotalAchievements = (faculty) => {
  return achievementTypes.reduce((sum, type) => {
    const val = faculty[type.key];
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

// Vibrant color palette for dopamine-inducing design
const vibrantColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
];

const RankBadge = ({ rank }) => {
  const colors = [
    'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 text-yellow-900 shadow-lg', // 1st
    'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-100 text-gray-900 shadow-lg',      // 2nd
    'bg-gradient-to-r from-orange-400 via-orange-300 to-orange-200 text-orange-900 shadow-lg' // 3rd
  ];
  let content = '';
  if (rank === 1) content = '🥇';
  else if (rank === 2) content = '🥈';
  else if (rank === 3) content = '🥉';
  else content = `#${rank}`;
  return (
    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold shadow-lg transform hover:scale-110 transition-all duration-200 ${colors[rank - 1] || 'bg-gradient-to-r from-blue-400 to-purple-500 text-white'}`}>{content}</span>
  );
};

const Trophy = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 animate-bounce">
    <path d="M8 21h8M12 17v4M17 5V3H7v2M17 5a5 5 0 0 1 5 5c0 2.5-2 5-5 5M7 5a5 5 0 0 0-5 5c0 2.5 2 5 5 5" />
  </svg>
);

const FacultyStats = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);
  const [allFaculty, setAllFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [facultyData, allFacultyData] = await Promise.all([
          fetchFacultyById(id),
          fetchFacultyData()
        ]);
        
        setFaculty(facultyData);
        
        if (allFacultyData) {
          // Exclude the 'Target' row and calculate rankings
          const facultyList = allFacultyData.filter(f => f.id !== 'TARGET');
          const facultyWithRankings = facultyList
            .map(f => ({
              ...f,
              totalAchievements: getTotalAchievements(f)
            }))
            .sort((a, b) => b.totalAchievements - a.totalAchievements)
            .map((f, index) => ({
              ...f,
              rank: index + 1
            }));
          setAllFaculty(facultyWithRankings);
        }
      } catch (error) {
        console.error('Error loading faculty data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-purple-700 dark:text-purple-300 font-semibold">Loading faculty stats...</p>
        </div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Faculty Not Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Find faculty rank
  const facultyRank = allFaculty.find(f => f.id === id)?.rank || 0;

  // Prepare chart data with colors
  const chartData = achievementTypes.map((type, index) => ({
    name: type.shortLabel,
    value: faculty[type.key] || 0,
    color: vibrantColors[index % vibrantColors.length]
  }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 py-10 px-2">
      <div className="w-full max-w-4xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-purple-200 dark:border-purple-700">
        {/* Header with enhanced styling */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-800 dark:via-pink-800 dark:to-blue-800 p-8 flex items-center gap-6 relative">
          {(facultyRank === 1 || facultyRank === 2 || facultyRank === 3) && (
            <div className="absolute top-4 right-4">
              <Trophy />
            </div>
          )}
          <div className="flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-5xl font-extrabold text-white shadow-2xl border-4 border-white/50 dark:border-purple-300/50 transform hover:scale-110 transition-transform duration-200">
            {getInitials(faculty.name)}
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center">
              {faculty.name}
              <RankBadge rank={facultyRank} />
            </h2>
            <div className="text-purple-100 text-lg font-medium">{faculty.designation} - {faculty.department}</div>
            <div className="mt-2 text-white/90 font-semibold">
              Total Achievements: <span className="text-yellow-300 text-2xl font-bold">{getTotalAchievements(faculty)}</span>
            </div>
          </div>
        </div>

        {/* Chart Section with enhanced styling */}
        <div className="p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-800 dark:via-purple-800/20 dark:to-blue-800/20">
          <h4 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
            <span className="text-2xl">📈</span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Achievement Breakdown</span>
          </h4>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 14, fill: '#8B5CF6', fontWeight: 'bold' }} 
                  axisLine={{ stroke: '#8B5CF6', strokeWidth: 2 }}
                />
                <YAxis 
                  tick={{ fontSize: 14, fill: '#8B5CF6' }} 
                  axisLine={{ stroke: '#8B5CF6', strokeWidth: 2 }}
                />
                <Tooltip 
                  wrapperStyle={{ 
                    fontSize: 14,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid #8B5CF6',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
                  }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]} 
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={entry.color}
                      strokeWidth={2}
                    />
                  ))}
                  <LabelList 
                  dataKey="value" 
                  position="top" 
                  style={{ 
                  fill: '#000000', 
                  
                  fontSize: '12px',
                  textShadow: '0 0 4px rgba(255,255,255,0.8)'
                  }} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Back Button with enhanced styling */}
          <div className="mt-8 text-center">
            <button
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg transform hover:scale-105 flex items-center gap-2 mx-auto"
              onClick={() => navigate(-1)}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Back to Rankings
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeInUp 0.7s cubic-bezier(.39,.575,.565,1) both;
        }
      `}</style>
    </div>
  );
};

export default FacultyStats;
