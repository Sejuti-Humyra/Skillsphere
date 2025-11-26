import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Edit3, 
  Shield,
  BookOpen,
  Heart,
  Award,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Profile() {
  const [me, setMe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await api.get('/auth/me', { 
          headers: { Authorization: 'Bearer ' + token } 
        });
        setMe(response.data.user || response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleAccountSettings = () => {
    // Navigate to account settings page
    console.log('Navigate to account settings');
  };

  const handleMyCourses = () => {
    // Navigate to my courses page
    navigate('/skills');
  };

  const handleAchievements = () => {
    // Navigate to achievements page
    console.log('Navigate to achievements');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Not Logged In</h2>
          <p className="text-gray-400 mb-6">Please log in to view your profile</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white">Profile</h1>
            <p className="text-gray-400 mt-2">Manage your account and preferences</p>
          </div>
          <button 
            onClick={handleEditProfile}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl border border-white/20 transition-all duration-200"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  {me.avatarUrl ? (
                    <img
                      src={me.avatarUrl}
                      alt={me.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {me.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900"></div>
                </div>

                {/* Name and Role */}
                <h2 className="text-2xl font-bold text-white mb-1">{me.name}</h2>
                <div className="inline-flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm mb-4">
                  <Shield className="w-3 h-3" />
                  <span className="capitalize">{me.role}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">{me.skills?.length || 0}</div>
                    <div className="text-gray-400 text-sm">Skills</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">{me.interests?.length || 0}</div>
                    <div className="text-gray-400 text-sm">Interests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">
                      {me.createdAt ? Math.floor((new Date() - new Date(me.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
                    </div>
                    <div className="text-gray-400 text-sm">Days</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleAccountSettings}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200"
                >
                  <Settings className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">Account Settings</span>
                </button>
                <button 
                  onClick={handleMyCourses}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200"
                >
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">My Skills</span>
                </button>
                <button 
                  onClick={handleAchievements}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200"
                >
                  <Award className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">Achievements</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-gray-400 mb-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email Address</span>
                  </div>
                  <p className="text-white text-lg">{me.email}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-gray-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Member Since</span>
                  </div>
                  <p className="text-white text-lg">
                    {me.createdAt ? formatDate(me.createdAt) : 'N/A'}
                  </p>
                </div>

                {me.location && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-gray-400 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <p className="text-white text-lg">{me.location}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-gray-400 mb-1">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Account Type</span>
                  </div>
                  <p className="text-white text-lg capitalize">{me.role}</p>
                </div>
              </div>
            </motion.div>

            {/* Bio Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                About Me
              </h3>
              <p className="text-gray-300">
                {me.bio || "No bio provided yet. Tell us something about yourself!"}
              </p>
            </motion.div>

            {/* Skills Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {me.skills && me.skills.length > 0 ? (
                  me.skills.map((skill, index) => (
                    <span
                      key={skill._id || index}
                      className="bg-blue-500/20 text-blue-400 px-3 py-2 rounded-full text-sm font-medium border border-blue-500/30"
                    >
                      {typeof skill === 'object' ? skill.title : skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400">No skills added yet. Start learning!</p>
                )}
              </div>
            </motion.div>

            {/* Interests Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {me.interests && me.interests.length > 0 ? (
                  me.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-purple-500/20 text-purple-400 px-3 py-2 rounded-full text-sm font-medium border border-purple-500/30"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400">No interests added yet. Explore your passions!</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}