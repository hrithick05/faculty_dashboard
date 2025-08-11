import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { achievementTypes, fetchFacultyData, supabase } from '../data/mockFaculty';

// Helper to calculate total achievements for a faculty member
const getTotalAchievements = (faculty) => {
  return achievementTypes.reduce((sum, type) => {
    const val = faculty[type.key];
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);
};

// Helper to get initials for avatar
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

// Badge for top 3 with enhanced styling
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

const TopPerformer = () => {
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFacultyData() {
      try {
        setLoading(true);
        const data = await fetchFacultyData();
        if (data && data.length > 0) {
          // Exclude the 'Target' row
          const facultyList = data.filter(f => f.id !== 'TARGET');
          setFacultyData(facultyList);
        }
      } catch (error) {
        console.error('Error loading faculty data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadFacultyData();

    const channel = supabase
      .channel('faculty_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'faculty' },
        (payload) => {
          loadFacultyData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate rankings
  const facultyWithRankings = facultyData
    .map(faculty => ({
      ...faculty,
      totalAchievements: getTotalAchievements(faculty)
    }))
    .sort((a, b) => b.totalAchievements - a.totalAchievements)
    .map((faculty, index) => ({
      ...faculty,
      rank: index + 1
    }));

  // Use all faculty for the chart
  const chartData = facultyWithRankings.map((faculty, index) => ({
    name: faculty.name,
    total: faculty.totalAchievements,
    color: vibrantColors[index % vibrantColors.length]
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-purple-700 dark:text-purple-300 font-semibold">Loading top performers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with enhanced styling */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🏆 Top Performers
          </h1>
          <p className="text-purple-700 dark:text-purple-300 text-lg">Faculty members with the highest total achievements</p>
        </div>

        {/* Top 10 Chart with enhanced styling */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl mb-8 border border-purple-200 dark:border-purple-700">
          <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
             Achievement Rankings
          </h2>
          <div className="w-full" style={{ height: `${Math.max(400, chartData.length * 50)}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 100, left: 40, bottom: 5 }}>
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 14, fill: '#8B5CF6' }} 
                  axisLine={{ stroke: '#8B5CF6', strokeWidth: 2 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 14, fill: '#8B5CF6', fontWeight: 'bold' }} 
                  width={220} 
                  interval={0} 
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
                <Legend wrapperStyle={{ fontSize: 16, fontWeight: 'bold' }} />
                <Bar 
                  dataKey="total" 
                  radius={[0, 16, 16, 0]}
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
                    dataKey="total" 
                    position="right" 
                    offset={25}
                    style={{ 
                      fill: '#000000',
                      fontSize: '18px',
                      textShadow: '1px 1px 2px rgba(255,255,255,1)'
                    }} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking List with enhanced styling */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <span className="text-3xl">🎯</span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Detailed Rankings</span>
          </h3>
          <div className="grid gap-4">
            {facultyWithRankings.map((faculty, idx) => (
              <div
                key={faculty.id}
                className={`flex items-center gap-4 p-6 rounded-2xl transition-all duration-300 shadow-lg cursor-pointer group transform hover:scale-105 hover:shadow-2xl
                  ${idx === 0 ? 'bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-50 dark:from-yellow-900/40 dark:via-yellow-800/40 dark:to-yellow-700/40 font-bold text-yellow-900 dark:text-yellow-100 border-2 border-yellow-300 dark:border-yellow-700 shadow-yellow-200/50' :
                    idx === 1 ? 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-50 dark:from-gray-700/40 dark:via-gray-800/40 dark:to-gray-700/40 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-700 shadow-gray-200/50' :
                    idx === 2 ? 'bg-gradient-to-r from-orange-200 via-orange-100 to-orange-50 dark:from-orange-900/40 dark:via-orange-800/40 dark:to-orange-700/40 text-orange-900 dark:text-orange-100 border-2 border-orange-300 dark:border-orange-700 shadow-orange-200/50' :
                    'bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-purple-800/40 dark:via-pink-800/40 dark:to-blue-800/40 text-purple-800 dark:text-purple-200 border-2 border-purple-200 dark:border-purple-700 shadow-purple-200/50'}`}
                onClick={() => navigate(`/faculty-stats/${faculty.id}`)}
              >
                <div className="w-16 text-center text-lg font-bold">
                  <RankBadge rank={idx + 1} />
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center font-bold text-white text-xl shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                  {getInitials(faculty.name)}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200">
                    {faculty.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {faculty.designation} - {faculty.department}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {faculty.totalAchievements}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPerformer;