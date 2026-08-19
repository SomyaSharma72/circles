import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FavorRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { UserAvatar } from '../components/UserAvatar';
import {
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  PlusCircle,
  MapPin,
  ArrowRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { location } = useLocationContext();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'my_requests' | 'my_helping' | 'ai_recommendations'>('my_requests');
  const [myRequests, setMyRequests] = useState<FavorRequest[]>([]);
  const [helpingRequests, setHelpingRequests] = useState<FavorRequest[]>([]);
  const [recommendations, setRecommendations] = useState<FavorRequest[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [allReqRes, recRes] = await Promise.all([
        api.get('/requests'),
        api.get('/requests/recommendations'),
      ]);

      const allData: FavorRequest[] = allReqRes.data || [];
      setMyRequests(allData.filter((r) => r.requester?._id === user.id || r.requester?.id === user.id));
      setHelpingRequests(allData.filter((r) => r.helper?._id === user.id || r.helper?.id === user.id));
      setRecommendations(recRes.data || []);
    } catch (err: any) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Failed to load user dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user?.id]);

  if (authLoading) {
    return <LoadingSpinner label="Verifying dashboard session..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <UserAvatar
            userId={user.id || (user as any)._id}
            name={user.name}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{user.name}</h1>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500" /> {user.neighborhood || location.neighborhood || 'Local Circle'} • {user.profession}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-orange-50 text-orange-800 border border-orange-200 rounded-full text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                <span>{user.trustScore} Trust Score</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{user.completedFavors} Favors Completed</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/create-request"
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> Ask for Help
          </Link>
          <Link
            to="/profile"
            className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs rounded-xl border border-orange-200 transition"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-orange-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('my_requests')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'my_requests'
              ? 'border-orange-500 text-orange-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>My Requests ({myRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my_helping')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'my_helping'
              ? 'border-orange-500 text-orange-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Favors I'm Helping With ({helpingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_recommendations')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'ai_recommendations'
              ? 'border-orange-500 text-orange-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>Neighbor Matches ({recommendations.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <LoadingSpinner label="Loading user activity..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchDashboardData} />
      ) : (
        <div>
          {activeTab === 'my_requests' && (
            myRequests.length === 0 ? (
              <EmptyState
                title="You haven't requested any help yet"
                description="Need tools, groceries, or a jumpstart? Ask your neighbors!"
                actionText="Ask for Help"
                actionLink="/create-request"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myRequests.map((req) => (
                  <DashboardCard key={req._id} req={req} />
                ))}
              </div>
            )
          )}

          {activeTab === 'my_helping' && (
            helpingRequests.length === 0 ? (
              <EmptyState
                title="You haven't helped any neighbors yet"
                description="Check out nearby requests on the map and lend a hand!"
                actionText="Explore Nearby Map"
                actionLink="/area-scan"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {helpingRequests.map((req) => (
                  <DashboardCard key={req._id} req={req} />
                ))}
              </div>
            )
          )}

          {activeTab === 'ai_recommendations' && (
            recommendations.length === 0 ? (
              <EmptyState
                title="No neighbor matches available right now"
                description="Update your profile skills to get matched with local requests!"
                actionText="Update Profile Skills"
                actionLink="/profile"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((req) => (
                  <DashboardCard key={req._id} req={req} showAiScore />
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

const DashboardCard: React.FC<{ req: FavorRequest; showAiScore?: boolean }> = ({ req, showAiScore }) => {
  return (
    <div className="bg-white border border-orange-200/80 rounded-2xl p-5 shadow-xs hover:border-orange-300 transition flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-orange-800 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
            {req.category}
          </span>
          <span className="font-semibold text-slate-500">{req.status}</span>
        </div>

        <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1">{req.title}</h3>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">{req.summary || req.description}</p>

        {showAiScore && req.aiMatchReason && (
          <div className="bg-orange-50 text-orange-900 text-[11px] p-2 rounded-lg border border-orange-200 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>{req.aiMatchReason}</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-orange-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 font-semibold">By {req.requester?.name || 'Neighbor'}</span>
        <Link
          to={`/request/${req._id}`}
          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg transition flex items-center gap-1"
        >
          <span>View</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
