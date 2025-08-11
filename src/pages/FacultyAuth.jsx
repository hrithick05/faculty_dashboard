import { useLocation, useNavigate } from 'react-router-dom';

const FacultyAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const faculty = location.state?.faculty;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Faculty Authorization</h2>
        {faculty ? (
          <>
            <p className="mb-2">Welcome, <strong>{faculty.name}</strong> ({faculty.id})</p>
            <p className="mb-4">You are now authorized. Proceed to your dashboard or go back.</p>
            <button onClick={() => navigate('/')} className="bg-primary text-white px-4 py-2 rounded mr-2">Go to Dashboard</button>
            <button onClick={() => navigate('/home')} className="bg-secondary text-white px-4 py-2 rounded">Back</button>
          </>
        ) : (
          <>
            <p className="mb-4 text-red-600">No faculty data found. Please login again.</p>
            <button onClick={() => navigate('/faculty-login')} className="bg-primary text-white px-4 py-2 rounded">Back to Login</button>
          </>
        )}
      </div>
    </div>
  );
};

export default FacultyAuth;
