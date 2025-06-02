import { Link } from "wouter";
import logo from "../faangtech .jpg";

export default function MainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          
          {/* Logo and Title */}
          <div className="text-center mb-16">
            <img 
              src={logo} 
              alt="CodeGym Logo" 
              className="w-28 h-28 mx-auto mb-6 rounded-full transform transition-transform duration-300 hover:scale-110"
            />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-3">
              Welcome to <span className="text-indigo-600">CodeGym</span>
              <span className="block text-sm md:text-base text-indigo-500 font-medium mt-1 transform transition-transform duration-300 hover:scale-105">
                By FAANG Tech Lab – The Coding School
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600">
              Your journey to coding excellence starts here
            </p>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: "💻",
                title: "Learn to Code",
                desc: "Master programming with interactive lessons",
              },
              {
                icon: "🎯",
                title: "Track Progress",
                desc: "Monitor your learning journey",
              },
              {
                icon: "🏆",
                title: "Earn Badges",
                desc: "Get recognized for your achievements",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 transform transition-transform duration-300 hover:scale-110"
              >
                <div className="text-4xl text-indigo-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Login Buttons */}
          <div className="flex justify-center gap-6">
            <Link
              to="/admin/login"
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-xl transform transition-transform duration-300 hover:scale-110"
            >
              Admin Login
            </Link>
            <Link
              to="/student/login"
              className="px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition shadow-md hover:shadow-xl transform transition-transform duration-300 hover:scale-110"
            >
              Student Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 