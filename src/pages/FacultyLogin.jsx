import LoginForm from '../components/LoginForm';
import { useNavigate } from 'react-router-dom';

const FacultyLogin = () => {
  const navigate = useNavigate();
  const handleLogin = (faculty) => {
    // After login, navigate to faculty details page
    navigate(`/faculty-details/${faculty.id}`);
  };
  return (
    <LoginForm onLogin={handleLogin} />
  );
};

export default FacultyLogin;
