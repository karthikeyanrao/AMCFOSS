import React from 'react';
import { AuthProvider } from './context/AuthContext';
import FossApp from './foss';
import 'aos/dist/aos.css';
import 'font-awesome/css/font-awesome.min.css';

const App = () => {
  return (
    <AuthProvider>
      <FossApp/>
    </AuthProvider>
  );
};

export default App;
