import React from 'react';
import { Link } from 'react-router-dom';

const MainPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Logo and Title Section */}
          <div className="text-center mb-12">
            <img 
              src="/logo.svg" 
              alt="CodeGym Logo" 
              className="w-32 h-32 mx-auto mb-6 animate-float"
            />
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Welcome to <span className="text-indigo-600">CodeGym</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your journey to coding excellence starts here
            </p>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-indigo-600 text-4xl mb-4">💻</div>
              <h3 className="text-xl font-semibold mb-2">Learn to Code</h3>
              <p className="text-gray-600">Master programming with interactive lessons</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-indigo-600 text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">Monitor your learning journey</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-indigo-600 text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">Earn Badges</h3>
              <p className="text-gray-600">Get recognized for your achievements</p>
            </div>
          </div>

          {/* Login Buttons */}
          <div className="text-center space-x-6">
            <Link 
              to="/admin/login"
              className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Admin Login
            </Link>
            <Link 
              to="/student/login"
              className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl border-2 border-indigo-600"
            >
              Student Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage; 