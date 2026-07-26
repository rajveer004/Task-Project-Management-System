import React, { useState } from 'react';
import { useBoard } from '../../context/BoardContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Users,
  Sparkles,
  Plus,
  Search,
  Filter,
  Briefcase,
  ExternalLink,
  Github,
  Send,
  Check,
  X,
  UserPlus,
  ChevronRight,
  Code
} from 'lucide-react';

export const MatchmakingHubView = () => {
  const {
    postings,
    projectPostings,
    applications,
    createPosting,
    createProjectPosting,
    applyToProject,
    respondToApplication,
    updateUserProfile,
    setActiveBoardId,
    setViewMode,
    addToast
  } = useBoard();

  const { currentUser, allUsers, refreshUsers } = useAuth();

  const safePostings = postings || projectPostings || [];
  const safeApplications = applications || [];
  const safeUsers = allUsers || [];

  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedPosting, setSelectedPosting] = useState(null);

  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postRoles, setPostRoles] = useState('Frontend Lead, AI Engineer, UI Designer');
  const [postSkills, setPostSkills] = useState('React, JavaScript, Tailwind, Node.js');
  const [postTeamSize, setPostTeamSize] = useState(4);
  const [createWorkspaceBoard, setCreateWorkspaceBoard] = useState(true);
  const [isSubmittingPosting, setIsSubmittingPosting] = useState(false);

  const [applyRole, setApplyRole] = useState('');
  const [applyPitch, setApplyPitch] = useState('');
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);
  const [processingAppId, setProcessingAppId] = useState(null);

  const [bio, setBio] = useState(currentUser?.bio || '');
  const [skills, setSkills] = useState((currentUser?.skills || []).join(', '));
  const [portfolioUrl, setPortfolioUrl] = useState(currentUser?.portfolioUrl || '');
  const [githubUrl, setGithubUrl] = useState(currentUser?.githubUrl || '');
  const [availability, setAvailability] = useState(currentUser?.availability || 'Looking for Projects');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const filteredPostings = safePostings.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.requiredSkills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || post.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const userPostingIds = safePostings.filter(p => p.ownerId === currentUser?.id).map(p => p.id);
  const incomingApplications = safeApplications.filter(a => userPostingIds.includes(a.projectId));
  const pendingCount = incomingApplications.filter(a => a.status === 'Pending').length;

  const handleCreatePosting = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDescription.trim()) return;

    setIsSubmittingPosting(true);
    try {
      const rolesNeeded = postRoles.split(',').map(r => r.trim()).filter(Boolean);
      const requiredSkills = postSkills.split(',').map(s => s.trim()).filter(Boolean);

      const publishFn = createPosting || createProjectPosting;
      if (!publishFn) {
        throw new Error('Publish function is not available.');
      }

      await publishFn({
        title: postTitle.trim(),
        description: postDescription.trim(),
        rolesNeeded,
        requiredSkills,
        targetTeamSize: Number(postTeamSize),
        createWorkspace: createWorkspaceBoard
      });

      setPostTitle('');
      setPostDescription('');
      setIsPostModalOpen(false);
    } catch (err) {
      console.error('Failed to create posting:', err);
      if (addToast) {
        addToast('Publish Error', err.message || 'Could not publish project idea. Please try again.', 'error');
      }
    } finally {
      setIsSubmittingPosting(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedPosting || !applyPitch.trim()) return;

    setIsSubmittingApply(true);
    try {
      await applyToProject(selectedPosting.id, applyPitch.trim(), applyRole || selectedPosting.rolesNeeded[0]);
      setIsApplyModalOpen(false);
      setApplyPitch('');
      setSelectedPosting(null);
    } catch (err) {
      console.error('Application failed:', err);
    } finally {
      setIsSubmittingApply(false);
    }
  };

  const handleRespondToApplication = async (appId, status) => {
    const actionFn = respondToApplication || updateApplicationStatus;
    if (!actionFn) {
      if (addToast) addToast('Error', 'Application status handler not available.', 'error');
      return;
    }
    setProcessingAppId(appId);
    try {
      await actionFn(appId, status);
    } catch (err) {
      console.error('Failed to update application status:', err);
    } finally {
      setProcessingAppId(null);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
      await updateUserProfile({
        bio: bio.trim(),
        skills: parsedSkills,
        portfolioUrl: portfolioUrl.trim(),
        githubUrl: githubUrl.trim(),
        availability
      });
      await refreshUsers();
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-widest font-bold mb-1">
              <Users className="w-4 h-4" /> Team Discovery & Collaboration Hub
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Collaborative Project Showcase & Talent Matchmaker
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Publish project ideas, find co-creators, apply with custom pitches, and build high-performing engineering teams with auto-provisioned workspaces.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
            >
              <Code className="w-4 h-4 text-indigo-400" /> My Talent Profile
            </button>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" /> Post Project Idea
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 text-xs font-medium">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'feed'
                ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Project Showcase Feed ({safePostings.length})
          </button>
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'collaborators'
                ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Collaborator Directory ({safeUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 relative ${
              activeTab === 'applications'
                ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Join Request Approval Queue
            {pendingCount > 0 && (
              <span className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'feed' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search project ideas by title, description, or skill..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="recruiting">Recruiting Only</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPostings.map(post => {
              const isOwner = post.ownerId === currentUser?.id;
              const hasApplied = safeApplications.some(a => a.projectId === post.id && a.applicantId === currentUser?.id);
              const myApp = safeApplications.find(a => a.projectId === post.id && a.applicantId === currentUser?.id);

              return (
                <div
                  key={post.id}
                  className="bg-slate-900 border border-slate-800/90 hover:border-slate-700/90 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={post.ownerAvatar}
                          alt={post.ownerName}
                          className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                        />
                        <div>
                          <div className="text-xs font-semibold text-slate-300">{post.ownerName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Posted {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-full border ${
                          post.status === 'Recruiting'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : post.status === 'In Progress'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors mb-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                      {post.description}
                    </p>

                    <div className="mb-3">
                      <div className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1.5">
                        Roles Needed:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(post.rolesNeeded || []).map((role, idx) => (
                          <span
                            key={idx}
                            className="bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 text-[11px] px-2 py-0.5 rounded-md font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1.5">
                        Required Tech Stack:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(post.requiredSkills || []).map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-950 text-slate-400 border border-slate-800 text-[10px] px-2 py-0.5 rounded font-mono"
                          >
                            #{skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        {post.currentMemberCount}/{post.targetTeamSize} Members
                      </span>
                    </div>

                    <div>
                      {isOwner ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded border border-indigo-800/40">
                            Your Project Idea
                          </span>
                          {post.boardId && (
                            <button
                              onClick={() => {
                                setActiveBoardId(post.boardId);
                                setViewMode('kanban');
                              }}
                              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded font-semibold flex items-center gap-1"
                            >
                              Workspace <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : hasApplied ? (
                        <span
                          className={`text-xs px-3 py-1 rounded font-mono font-bold border ${
                            myApp?.status === 'Accepted'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : myApp?.status === 'Rejected'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          Application: {myApp?.status}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedPosting(post);
                            setApplyRole((post.rolesNeeded && post.rolesNeeded[0]) || 'Collaborator');
                            setIsApplyModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" /> Request to Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPostings.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-900/50 border border-slate-800 rounded-xl">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-semibold">No project postings found matching criteria.</p>
                <p className="text-xs text-slate-500 mt-1">Be the first to post a project idea and recruit co-builders!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'collaborators' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Active Talent & Collaborator Profiles
              </h2>
              <p className="text-xs text-slate-400">Discover team members, review core skillsets, and check project availability.</p>
            </div>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-md"
            >
              Update My Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeUsers.map(user => (
              <div
                key={user.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-11 h-11 rounded-full border-2 border-indigo-500/30 object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{user.name}</h4>
                        <p className="text-[11px] text-slate-400">{user.department || 'Engineering'}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                        user.availability === 'Looking for Projects'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : user.availability === 'Open to Invites'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {user.availability || 'Available'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    "{user.bio || 'Passionate software craftsman building full-stack collaborative platforms.'}"
                  </p>

                  <div className="space-y-1.5 mb-3">
                    <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Core Skills:</div>
                    <div className="flex flex-wrap gap-1">
                      {(user.skills && user.skills.length > 0
                        ? user.skills
                        : ['JavaScript', 'React', 'Node.js']
                      ).map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-indigo-950/80 text-indigo-300 border border-indigo-800/40 text-[10px] px-2 py-0.5 rounded font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    {user.githubUrl && (
                      <a
                        href={user.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {user.portfolioUrl && (
                      <a
                        href={user.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">RBAC Role: {user.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Incoming Join Applications & Approval Queue
              </h2>
              <p className="text-xs text-slate-400">Review collaborator pitches. Accepting a candidate automatically grants workspace member permissions.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-lg">
              {incomingApplications.length} Total Applications
            </span>
          </div>

          <div className="space-y-3">
            {incomingApplications.map(app => (
              <div
                key={app.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={app.applicantAvatar}
                      alt={app.applicantName}
                      className="w-9 h-9 rounded-full border border-slate-700 object-cover"
                    />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        {app.applicantName}
                        <span className="text-xs font-normal text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                          Role: {app.roleRequested}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Applied for: <span className="text-slate-300 font-semibold">{app.projectTitle}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 leading-relaxed italic">
                    "{app.pitchMessage}"
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Applicant Skills:</span>
                    {(app.applicantSkills || []).map((sk, idx) => (
                      <span key={idx} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 md:flex-col md:items-end justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <span
                    className={`text-[11px] font-mono uppercase font-bold px-3 py-1 rounded-full border mb-2 ${
                      app.status === 'Accepted'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : app.status === 'Rejected'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {app.status}
                  </span>

                  {app.status === 'Pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={processingAppId === app.id}
                        onClick={() => handleRespondToApplication(app.id, 'Accepted')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                      >
                        {processingAppId === app.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Accept & Auto-Add Member
                      </button>
                      <button
                        disabled={processingAppId === app.id}
                        onClick={() => handleRespondToApplication(app.id, 'Rejected')}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 hover:border-rose-800 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {incomingApplications.length === 0 && (
              <div className="py-12 text-center bg-slate-900/50 border border-slate-800 rounded-xl">
                <UserPlus className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-semibold">No pending candidate applications.</p>
                <p className="text-xs text-slate-500 mt-1">Applications sent to your project postings will appear here for review.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isPostModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white font-mono">Publish Project Idea</h3>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePosting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Real-Time Collaborative Canvas"
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
                  Project Pitch & Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your vision, goals, and why collaborators should join..."
                  value={postDescription}
                  onChange={e => setPostDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
                    Roles Needed (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Lead, UI Designer"
                    value={postRoles}
                    onChange={e => setPostRoles(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
                    Target Team Size
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={postTeamSize}
                    onChange={e => setPostTeamSize(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
                  Required Tech Stack / Skills (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, JavaScript, Node.js"
                  value={postSkills}
                  onChange={e => setPostSkills(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="createBoardCheck"
                  checked={createWorkspaceBoard}
                  onChange={e => setCreateWorkspaceBoard(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="createBoardCheck" className="text-xs text-slate-300 font-medium">
                  Auto-create dedicated Workspace Board
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPosting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingPosting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Publish Idea
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isApplyModalOpen && selectedPosting && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Apply for Project</h3>
                <p className="text-xs text-slate-400">{selectedPosting.title}</p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
                  Select Requested Role
                </label>
                <select
                  value={applyRole}
                  onChange={e => setApplyRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {(selectedPosting.rolesNeeded || []).map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
                  Your Pitch & Experience Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain why you are excited to build this project..."
                  value={applyPitch}
                  onChange={e => setApplyPitch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApply}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-2"
                >
                  Send Application Pitch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-mono">Edit Collaborator Profile</h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
                  Short Bio / Specialty
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="e.g. Full stack developer building web platforms"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
                  Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="e.g. React, JavaScript, Node.js, Tailwind"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
                    Portfolio Link
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={e => setPortfolioUrl(e.target.value)}
                    placeholder="https://myportfolio.dev"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
                  Project Availability
                </label>
                <select
                  value={availability}
                  onChange={e => setAvailability(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Looking for Projects">Looking for Projects</option>
                  <option value="Open to Invites">Open to Invites</option>
                  <option value="Busy">Busy</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-2"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
