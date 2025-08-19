import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { achievementTypes, fetchFacultyData, supabase } from '../data/mockFaculty';
import './TopPerformer.css';

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
    'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 text-yellow-900 shadow-lg border-2 border-yellow-500/30', // 1st
    'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-100 text-gray-900 shadow-lg border-2 border-gray-500/30',      // 2nd
    'bg-gradient-to-r from-orange-400 via-orange-300 to-orange-200 text-orange-900 shadow-lg border-2 border-orange-500/30' // 3rd
  ];
  
  let content = '';
  let icon = '';
  
  if (rank === 1) {
    content = '🥇';
    icon = '👑';
  } else if (rank === 2) {
    content = '🥈';
    icon = '⭐';
  } else if (rank === 3) {
    content = '🥉';
    icon = '🌟';
  } else {
    content = `#${rank}`;
    icon = '🏆';
  }
  
  return (
    <div className={`relative group rank-badge`}>
      <span className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-bold shadow-lg transform hover:scale-110 transition-all duration-300 ${colors[rank - 1] || 'bg-gradient-to-r from-blue-400 to-purple-500 text-white border-2 border-blue-500/30'}`}>
        <span className="mr-2 text-lg">{content}</span>
        <span className="text-xs opacity-80">{icon}</span>
      </span>
      
      {/* Enhanced hover effect with glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10"></div>
    </div>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with enhanced styling - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2 animate-fade-in">
            🏆 Top Performers
          </h1>
          <p className="text-purple-700 dark:text-purple-300 text-base sm:text-lg px-2">Faculty members with the highest total achievements</p>
          
                     {/* Mobile Stats Summary */}
           <div className="mt-4 sm:hidden">
             <div className="mobile-stats-grid max-w-xs mx-auto">
               <div className="mobile-achievement-card">
                 <div className="text-lg font-bold text-purple-600">{facultyWithRankings.length}</div>
                 <div className="text-xs text-gray-600">Faculty</div>
               </div>
               <div className="mobile-achievement-card">
                 <div className="text-lg font-bold text-pink-600">{facultyWithRankings[0]?.totalAchievements || 0}</div>
                 <div className="text-xs text-gray-600">Top Score</div>
               </div>
               <div className="mobile-achievement-card">
                 <div className="text-lg font-bold text-blue-600">{Math.round(facultyWithRankings.reduce((sum, f) => sum + f.totalAchievements, 0) / facultyWithRankings.length)}</div>
                 <div className="text-xs text-gray-600">Average</div>
               </div>
             </div>
           </div>
        </div>

        {/* Top 10 Chart with enhanced styling - Mobile Optimized */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-8 shadow-2xl mb-6 sm:mb-8 border border-purple-200 dark:border-purple-700">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
             Achievement Rankings
          </h2>
          
          {/* Mobile Chart Toggle */}
          <div className="sm:hidden mb-4">
            <div className="flex justify-center space-x-2">
              <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium text-sm">
                Chart View
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium text-sm">
                List View
              </button>
            </div>
          </div>
          
          <div className="w-full" style={{ height: `${Math.max(300, chartData.length * 40)}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 60, left: 30, bottom: 5 }}>
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 14, fill: '#8B5CF6' }} 
                  axisLine={{ stroke: '#8B5CF6', strokeWidth: 2 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12, fill: '#8B5CF6', fontWeight: 'bold' }} 
                  width={window.innerWidth < 640 ? 120 : 220} 
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

        {/* Ranking List with enhanced styling - Mobile Optimized */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-8 shadow-2xl">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl">🎯</span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Detailed Rankings</span>
            <span className="text-3xl sm:text-4xl">🏆</span>
          </h3>
          
          {/* Mobile Quick Stats */}
          <div className="sm:hidden mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 text-center border border-purple-200/50">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">🏆 Top 3 This Month</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Click any faculty to view detailed stats</div>
            </div>
          </div>
          
          {/* Enhanced Ranking Grid */}
          <div className="grid gap-4 sm:gap-6 ranking-grid">
            {facultyWithRankings.map((faculty, idx) => (
              <div
                key={faculty.id}
                className={`mobile-card mobile-touchable ranking-card relative overflow-hidden rounded-2xl transition-all duration-500 shadow-lg cursor-pointer group transform hover:scale-[1.02] hover:shadow-2xl
                  ${idx === 0 ? 'bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:via-yellow-800/30 dark:to-yellow-700/30 font-bold text-yellow-900 dark:text-yellow-100 border-2 border-yellow-300 dark:border-yellow-600 shadow-yellow-200/50' :
                    idx === 1 ? 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-50 dark:from-gray-700/30 dark:via-gray-800/30 dark:to-gray-700/30 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 shadow-gray-200/50' :
                    idx === 2 ? 'bg-gradient-to-r from-orange-200 via-orange-100 to-orange-50 dark:from-orange-900/30 dark:via-orange-800/30 dark:to-orange-700/30 text-orange-900 dark:text-orange-100 border-2 border-orange-300 dark:border-orange-600 shadow-orange-200/50' :
                    'bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-purple-800/30 dark:via-pink-800/30 dark:to-blue-800/30 text-purple-800 dark:text-purple-200 border-2 border-purple-200 dark:border-purple-600 shadow-purple-200/50'}`}
                onClick={() => navigate(`/faculty-stats/${faculty.id}`)}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Enhanced Mobile Layout - Better Stacked Design */}
                <div className="sm:hidden p-5">
                  <div className="flex items-center justify-between mb-4">
                    {/* Enhanced Mobile Avatar with Better Sizing */}
                    <div className="ranking-avatar w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center font-bold text-white text-2xl shadow-lg border-3 border-white/30 transform group-hover:scale-110 transition-all duration-300">
                      {getInitials(faculty.name)}
                    </div>
                    
                    {/* Mobile Rank Badge - Enhanced Positioning */}
                    <div className="mobile-rank-badge">
                      <RankBadge rank={idx + 1} />
                    </div>
                  </div>
                  
                  {/* Faculty Info - Better Typography */}
                  <div className="text-center mb-4">
                    <div className="text-xl font-bold group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200 mb-1">
                      {faculty.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {faculty.designation} • {faculty.department}
                    </div>
                  </div>
                  
                  {/* Score Display - Enhanced Layout */}
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                      {faculty.totalAchievements}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Achievements</div>
                  </div>
                  
                  {/* Mobile Achievement Breakdown - Enhanced Layout */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="mobile-achievement-card">
                      <div className="font-bold text-purple-600 text-lg">{faculty.rdproposalssangsation || 0}</div>
                      <div className="text-gray-500 text-xs font-medium">R&D Projects</div>
                    </div>
                    <div className="mobile-achievement-card">
                      <div className="font-bold text-pink-600 text-lg">{faculty.journalpublications || 0}</div>
                      <div className="text-gray-500 text-xs font-medium">Publications</div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Desktop Layout - Better Horizontal Alignment */}
                <div className="hidden sm:flex items-center p-6 gap-6">
                  {/* Enhanced Rank Badge with Better Positioning */}
                  <div className="flex-shrink-0 w-24 flex justify-center">
                    <RankBadge rank={idx + 1} />
                  </div>
                  
                  {/* Enhanced Avatar with Better Sizing and Effects */}
                  <div className="ranking-avatar flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center font-bold text-white text-3xl shadow-xl border-3 border-white/30 transform group-hover:scale-110 group-hover:rotate-2 transition-all duration-300 hover:shadow-2xl">
                    {getInitials(faculty.name)}
                  </div>
                  
                  {/* Enhanced Faculty Info with Better Typography */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xl font-bold group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200 mb-2 truncate">
                      {faculty.name}
                    </div>
                    <div className="text-base text-gray-600 dark:text-gray-400 font-medium truncate">
                      {faculty.designation} • {faculty.department}
                    </div>
                    {/* Additional Info Row */}
                    <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Faculty ID: {faculty.id}
                    </div>
                  </div>
                  
                  {/* Score Display - Enhanced with Better Alignment */}
                  <div className="flex-shrink-0 text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      {faculty.totalAchievements}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Achievements</div>
                    
                    {/* Desktop Achievement Preview */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                        <div className="font-bold text-purple-600">{faculty.rdproposalssangsation || 0}</div>
                        <div className="text-gray-500">R&D</div>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                        <div className="font-bold text-pink-600">{faculty.journalpublications || 0}</div>
                        <div className="text-gray-500">Papers</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Hover Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPerformer;