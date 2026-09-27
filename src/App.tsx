import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { JobCard } from './components/JobCard';
import { JobDetailModal } from './components/JobDetailModal';
import { ApplicationModal } from './components/ApplicationModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { PrivacyView } from './components/PrivacyView';
import { Footer } from './components/Footer';
import { Job } from './types/job';
import { dataService } from './services/dataService';
import {
  Briefcase,
  Search,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<
    'home' | 'jobs' | 'about' | 'contact' | 'privacy'
  >('home');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Semua Lokasi');
  const [selectedEducation, setSelectedEducation] = useState('Semua Pendidikan');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('Semua Tipe');
  const [sortBy, setSortBy] = useState<'newest' | 'relevant'>('newest');

  // Modals state
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<Job | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(
    typeof window !== 'undefined' && window.location.hash === '#admin'
  );

  // Hash-based admin routing
  useEffect(() => {
    const checkHash = () => {
      setIsAdminMode(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Check first-visit onboarding status
  useEffect(() => {
    try {
      const completed = localStorage.getItem('job_portal_onboarding_completed');
      if (!completed) {
        setShowOnboarding(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Load published jobs from dataService
  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const data = await dataService.getPublishedJobs({
        search: searchQuery,
        location: selectedLocation,
        education: selectedEducation,
        employmentType: selectedEmploymentType,
        sortBy,
      });
      setJobs(data);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [selectedLocation, selectedEducation, selectedEmploymentType, sortBy]);

  const handleSearchSubmit = () => {
    loadJobs();
    if (activeView !== 'jobs') {
      setActiveView('jobs');
    }
  };

  const handleSelectTag = (tag: string) => {
    setSearchQuery(tag);
    loadJobs();
    setActiveView('jobs');
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('Semua Lokasi');
    setSelectedEducation('Semua Pendidikan');
    setSelectedEmploymentType('Semua Tipe');
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedLocation !== 'Semua Lokasi' ||
    selectedEducation !== 'Semua Pendidikan' ||
    selectedEmploymentType !== 'Semua Tipe';

  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800">
        <AdminDashboard
          onViewJob={(job) => {
            setSelectedJobForDetail(job);
          }}
          onNavigateHome={() => {
            window.location.hash = '';
            setIsAdminMode(false);
          }}
        />
        <JobDetailModal
          job={selectedJobForDetail}
          isOpen={Boolean(selectedJobForDetail)}
          onClose={() => setSelectedJobForDetail(null)}
          onApply={(job) => {
            setSelectedJobForApply(job);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <Header
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Views */}
      <main className="flex-1">
        {activeView === 'home' && (
          <div>
            {/* Hero Section */}
            <Hero
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              onSearchSubmit={handleSearchSubmit}
              onSelectTag={handleSelectTag}
              totalJobsCount={jobs.length}
            />

            {/* Lowongan Terbaru Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Peluang Karir Terkini</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Lowongan Terbaru
                  </h2>
                </div>

                <button
                  onClick={() => {
                    setActiveView('jobs');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                >
                  <span>Lihat Semua Lowongan ({jobs.length})</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Jobs Grid */}
              {loadingJobs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-64 rounded-2xl bg-slate-200/60 animate-pulse border border-slate-200"
                    />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-800">
                    Belum ada lowongan yang sesuai
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                    Coba ganti kata kunci pencarian Anda atau gunakan tombol bot untuk menambahkan loker baru.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {jobs.slice(0, 6).map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSelect={(j) => setSelectedJobForDetail(j)}
                      onQuickApply={(j) => setSelectedJobForApply(j)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DAFTAR LOWONGAN (/jobs) VIEW */}
        {activeView === 'jobs' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Daftar Lowongan Pekerjaan
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Temukan peluang kerja terbaik yang sesuai dengan keahlian dan kualifikasi Anda.
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search Input */}
                <div className="flex-1 flex items-center px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadJobs()}
                    placeholder="Cari berdasarkan posisi, perusahaan, atau keahlian..."
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setTimeout(loadJobs, 50);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={loadJobs}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0"
                >
                  Terapkan Pencarian
                </button>
              </div>

              {/* Filters row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                {/* Lokasi */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Lokasi</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="Semua Lokasi">Semua Lokasi</option>
                    <option value="Jakarta Selatan">Jakarta Selatan</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Semarang">Semarang</option>
                    <option value="Yogyakarta">Yogyakarta</option>
                    <option value="Medan">Medan</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                {/* Pendidikan */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Pendidikan
                  </label>
                  <select
                    value={selectedEducation}
                    onChange={(e) => setSelectedEducation(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="Semua Pendidikan">Semua Pendidikan</option>
                    <option value="SMA/SMK">Minimal SMA/SMK</option>
                    <option value="D3">Minimal D3</option>
                    <option value="S1">Minimal S1</option>
                  </select>
                </div>

                {/* Tipe Pekerjaan */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Tipe Pekerjaan
                  </label>
                  <select
                    value={selectedEmploymentType}
                    onChange={(e) => setSelectedEmploymentType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="Semua Tipe">Semua Tipe</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Magang">Magang</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                {/* Urutkan */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Urutkan Berdasarkan
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'relevant')}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="relevant">Paling Relevan</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Menampilkan filter aktif</span>
                  <button
                    onClick={handleResetFilters}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Reset Semua Filter
                  </button>
                </div>
              )}
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Menemukan <strong>{jobs.length}</strong> lowongan kerja aktif
              </span>
            </div>

            {/* Jobs List Grid */}
            {loadingJobs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-64 rounded-2xl bg-slate-200/60 animate-pulse border border-slate-200"
                  />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">
                  Belum ada lowongan yang sesuai
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  Coba ubah kata kunci atau hapus beberapa filter untuk menemukan loker yang tersedia.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSelect={(j) => setSelectedJobForDetail(j)}
                    onQuickApply={(j) => setSelectedJobForApply(j)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* STATIC VIEWS */}
        {activeView === 'about' && (
          <AboutView
            onExploreJobs={() => {
              setActiveView('jobs');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeView === 'contact' && <ContactView />}
        {activeView === 'privacy' && <PrivacyView />}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenOnboarding={() => setShowOnboarding(true)}
      />

      {/* INTERACTIVE ONBOARDING MODAL */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onFinishAndExploreJobs={() => {
          setShowOnboarding(false);
          setActiveView('jobs');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        jobs={jobs}
        onOpenActualJobDetail={(job) => {
          setShowOnboarding(false);
          setSelectedJobForDetail(job);
        }}
        onApplyActualJob={(job) => {
          setShowOnboarding(false);
          setSelectedJobForApply(job);
        }}
      />

      {/* JOB DETAIL MODAL */}
      <JobDetailModal
        job={selectedJobForDetail}
        isOpen={Boolean(selectedJobForDetail)}
        onClose={() => setSelectedJobForDetail(null)}
        onApply={(job) => {
          setSelectedJobForApply(job);
        }}
      />

      {/* CANDIDATE APPLICATION MODAL */}
      <ApplicationModal
        job={selectedJobForApply}
        isOpen={Boolean(selectedJobForApply)}
        onClose={() => setSelectedJobForApply(null)}
        onSuccessSubmitted={() => {
          loadJobs();
        }}
      />
    </div>
  );
}
