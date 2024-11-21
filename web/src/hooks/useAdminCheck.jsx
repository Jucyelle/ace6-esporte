import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../enums/UserRole';

const useAdminCheck = () => {
  const navigate = useNavigate();
  const userRole = parseInt(localStorage.getItem('userRole'), 10);

  useEffect(() => {
    if (userRole !== UserRole.ADMIN) {
      navigate('/acesso-negado');
    }
  }, [userRole, navigate]);
};

export default useAdminCheck;