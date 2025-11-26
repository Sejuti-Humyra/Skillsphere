import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Tag,
  Star,
  User,
  Grid,
  List,
  DollarSign,
  X,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import api from '../api/axios';

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [priceFilter, setPriceFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [showAddSkill, setShowAddSkill] = useState(false);

  const [newSkill, setNewSkill] = useState({
    title: '',
    description: '',
    price: 0,
    location: '',
    tags: [],
    images: [],
    exchangeOffer: ''
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================
  // Fetch Skills
  // ============================
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/skills/skills');
        setSkills(res.data);
        setFilteredSkills(res.data);
      } catch (err) {
        console.error("Error loading skills", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  // ============================
  // Filters
  // ============================
  useEffect(() => {
    let filtered = skills.filter(s => s.active !== false);

    if (searchTerm) {
      filtered = filtered.filter(skill =>
        skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.exchangeOffer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (priceFilter === 'free') {
      filtered = filtered.filter(skill => skill.price === 0);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter(skill => skill.price > 0);
    }

    if (tagFilter !== 'all') {
      filtered = filtered.filter(skill =>
        skill.tags?.includes(tagFilter)
      );
    }

    setFilteredSkills(filtered);
  }, [skills, searchTerm, priceFilter, tagFilter]);

  const allTags = [...new Set(skills.flatMap(skill => skill.tags || []))];

  // ============================
  // Submit New Skill
  // ============================
  const handleAddSkill = async () => {
    if (!newSkill.title.trim()) return alert("Skill title required");

    try {
      setIsSubmitting(true);

      const payload = {
        title: newSkill.title,
        description: newSkill.description,
        price: newSkill.price,
        location: newSkill.location,
        tags: newSkill.tags
      };

      const res = await api.post("/skills/cskills", payload);
      setSkills(prev => [res.data, ...prev]);

      setShowAddSkill(false);
      setNewSkill({
        title: '',
        description: '',
        price: 0,
        location: '',
        tags: [],
        images: [],
        exchangeOffer: ''
      });
      setNewTag('');
    } catch (err) {
      console.error(err);
      alert("Error submitting skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tag add
  const addTag = () => {
    if (newTag.trim() && !newSkill.tags.includes(newTag)) {
      setNewSkill(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewSkill(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const SkillCard = ({ skill }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-sm border overflow-hidden group cursor-pointer"
      onClick={() => setSelectedSkill(skill)}
    >
      <div className="relative h-48">
        <img
          src={skill.images?.[0] || "https://via.placeholder.com/400"}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />

        {skill.exchangeOffer && (
          <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
            Exchange Available
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-500" />
          {skill.title}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2">{skill.description}</p>

        <div className="flex flex-wrap gap-2">
          {skill.tags?.map((t, i) => (
            <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-full">#{t}</span>
          ))}
        </div>

        <div className="flex justify-between text-gray-700">
          <span className="font-semibold flex items-center gap-1 text-indigo-600">
            <DollarSign className="w-4 h-4" />
            {skill.price === 0 ? "Free" : skill.price}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {skill.location || "N/A"}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{skill.owner?.name || "Unknown"}</span>
        </div>
      </div>
    </motion.div>
  );

  const SkillModal = () => (
    <AnimatePresence>
      {selectedSkill && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setSelectedSkill(null)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl overflow-y-auto max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedSkill.title}</h2>
              <X className="cursor-pointer" onClick={() => setSelectedSkill(null)} />
            </div>

            <img
              src={selectedSkill.images?.[0] || "https://via.placeholder.com/400"}
              className="w-full h-56 object-cover rounded-xl mb-4"
            />

            <p className="text-gray-700 mb-3">{selectedSkill.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSkill.tags?.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">#{tag}</span>
              ))}
            </div>

            <div className="p-3 bg-gray-50 rounded-xl mb-4">
              <div className="flex justify-between mb-2">
                <span>Price:</span>
                <span className="font-semibold">{selectedSkill.price === 0 ? "Free" : selectedSkill.price}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Location:</span>
                <span>{selectedSkill.location}</span>
              </div>

              {selectedSkill.exchangeOffer && (
                <div className="flex justify-between">
                  <span>Exchange Offer:</span>
                  <span>{selectedSkill.exchangeOffer}</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6 space-y-6">

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border">
        <Search className="text-gray-500" />
        <input
          className="w-full outline-none"
          placeholder="Search skills..."
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid / List + Add */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Grid
            className={`cursor-pointer ${viewMode === 'grid' ? 'text-indigo-600' : 'text-gray-400'}`}
            onClick={() => setViewMode('grid')}
          />
          <List
            className={`cursor-pointer ${viewMode === 'list' ? 'text-indigo-600' : 'text-gray-400'}`}
            onClick={() => setViewMode('list')}
          />
        </div>

        <button
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl"
          onClick={() => setShowAddSkill(true)}
        >
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {/* Skills List */}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredSkills.map(skill => (
            <SkillCard key={skill._id} skill={skill} />
          ))}
        </div>
      )}

      <SkillModal />

      {/* Add Skill Modal */}
      <AnimatePresence>
        {showAddSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            onClick={() => setShowAddSkill(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Add New Skill</h2>

              <input
                placeholder="Title"
                className="w-full p-3 border rounded-xl mb-3"
                value={newSkill.title}
                onChange={e => setNewSkill({ ...newSkill, title: e.target.value })}
              />

              <textarea
                placeholder="Description"
                className="w-full p-3 border rounded-xl mb-3"
                rows={3}
                value={newSkill.description}
                onChange={e => setNewSkill({ ...newSkill, description: e.target.value })}
              />

              <input
                placeholder="Price"
                type="number"
                className="w-full p-3 border rounded-xl mb-3"
                value={newSkill.price}
                onChange={e => setNewSkill({ ...newSkill, price: e.target.value })}
              />

              <input
                placeholder="Location"
                className="w-full p-3 border rounded-xl mb-3"
                value={newSkill.location}
                onChange={e => setNewSkill({ ...newSkill, location: e.target.value })}
              />

              {/* Tags */}
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    placeholder="Add tag..."
                    className="flex-1 p-3 border rounded-xl"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTag()}
                  />
                  <button
                    className="bg-indigo-600 text-white px-4 rounded-xl"
                    onClick={addTag}
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {newSkill.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      #{tag}
                      <X
                        className="w-4 h-4 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              <button
                disabled={isSubmitting}
                onClick={handleAddSkill}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl mt-3"
              >
                {isSubmitting ? "Submitting..." : "Submit Skill"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
