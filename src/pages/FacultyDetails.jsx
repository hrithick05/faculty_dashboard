import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FacultyDetailView from '../components/FacultyDetailView';
import { fetchFacultyById } from '../data/mockFaculty';

const FacultyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFaculty() {
      try {
        setLoading(true);
        const facultyData = await fetchFacultyById(id);
        setFaculty(facultyData);
      } catch (error) {
        console.error('Error loading faculty:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadFaculty();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading faculty details...</p>
        </div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Faculty Not Found</h2>
          <button onClick={() => navigate('/faculty-login')} className="bg-primary text-white px-4 py-2 rounded">Back to Login</button>
        </div>
      </div>
    );
  }

  return <FacultyDetailView faculty={faculty} onLogout={() => navigate('/')} onUpdateAchievement={() => {}} />;
};

export default FacultyDetails;
