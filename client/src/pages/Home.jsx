import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  PhoneCall,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Activity,
  Award,
  Users,
  Building,
  CheckCircle2,
  Video,
  ArrowRight,
  Search,
  Ambulance,
  BedDouble,
  Microscope,
  Mail,
  UserCheck,
  FileText,
  AlertCircle
} from 'lucide-react';

// Institutional Hospital Marker Icon for Leaflet
const hospitalIcon = new L.DivIcon({
  className: 'custom-hospital-marker',
  html: `<div style="background-color: #123B5D; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; border: 3px solid #16A6A1; box-shadow: 0 4px 12px rgba(18,59,93,0.3);">M+</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

export default function Home() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Booking Form State
  const [booking, setBooking] = useState({
    dept_id: '',
    doctor_id: '',
    date: '',
    time_slot: '09:30 AM',
    patient_name: '',
    phone: '',
    email: '',
    consultation_type: 'In-Person',
    notes: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const hospitalCoords = [26.9124, 75.7873]; // MI Road, Jaipur

  useEffect(() => {
    Promise.all([
      api.get('/doctors/public').catch(() => []),
      api.get('/doctors/departments/public').catch(() => [])
    ]).then(([docs, depts]) => {
      setDoctors(Array.isArray(docs) ? docs : []);
      setDepartments(Array.isArray(depts) ? depts : []);
    }).finally(() => {
      setLoadingDocs(false);
    });
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const matchesDept = selectedDept === 'All' || doc.dept_name?.toLowerCase() === selectedDept.toLowerCase();
    const matchesSearch = doctorSearch === '' ||
      `${doc.first_name} ${doc.last_name}`.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.dept_name?.toLowerCase().includes(doctorSearch.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!booking.patient_name || !booking.phone) {
      alert('Please enter your full name and contact number.');
      return;
    }
    const refCode = 'MC-' + Math.floor(100000 + Math.random() * 900000);
    setBookingSuccess({
      ...booking,
      reference: refCode
    });
  };

  const selectDoctorForBooking = (doc) => {
    setBooking(prev => ({
      ...prev,
      doctor_id: doc.doctor_id,
      dept_id: doc.dept_id
    }));
    const bookEl = document.getElementById('appointment-booking');
    if (bookEl) {
      bookEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAFC] text-[#263746] font-sans antialiased">

      {/* Top Clinical Notification Bar */}
      <div className="bg-[#123B5D] text-white text-xs py-2 px-4 sm:px-8 border-b border-[#0C273E]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 font-medium">
              <Ambulance className="w-4 h-4 text-[#16A6A1]" />
              Emergency & Trauma Hotline: <strong className="text-[#35C2BD] tracking-wide ml-1">1800-200-9999</strong>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#16A6A1]" /> 12 MI Road, Ashok Nagar, Jaipur
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <span className="hidden lg:inline">NABH & NABL Accredited Medical Institution</span>
            <span className="text-[#DDF3EE] font-medium">Outpatient Consultations: Mon–Sat 8:00 AM – 8:00 PM</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-50 glass-nav border-b border-[#E1EDF5] bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#123B5D] text-white flex items-center justify-center font-bold text-xl shadow-sm">
              M+
            </div>
            <div>
              <span className="text-xl font-bold text-[#123B5D] font-heading tracking-tight block leading-tight">
                MediCore Hospital
              </span>
              <span className="text-xs font-semibold text-[#16A6A1] uppercase tracking-wider block">
                Tertiary Medical Centre
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#263746]">
            <a href="#about" className="hover:text-[#16A6A1] transition-colors">About</a>
            <a href="#departments" className="hover:text-[#16A6A1] transition-colors">Specialities</a>
            <a href="#doctors" className="hover:text-[#16A6A1] transition-colors">Medical Staff</a>
            <a href="#facilities" className="hover:text-[#16A6A1] transition-colors">Clinical Facilities</a>
            <a href="#services" className="hover:text-[#16A6A1] transition-colors">Patient Services</a>
            <a href="#cases" className="hover:text-[#16A6A1] transition-colors">Clinical Outcomes</a>
            <a href="#contact" className="hover:text-[#16A6A1] transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#DDF3EE] text-[#0C685B] hover:bg-[#BFE7DE] border border-[#BFE7DE] transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#16A6A1]" />
                <span>Portal ({user.username})</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#123B5D] hover:bg-[#E1EDF5] border border-[#C2DBEB] transition-all"
              >
                Staff Portal Sign In
              </Link>
            )}

            <a
              href="#appointment-booking"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#16A6A1] text-white hover:bg-[#118480] shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Consultation</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-[#F5FAFC] via-[#E1EDF5]/40 to-[#F5FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#DDF3EE] text-[#0C685B] text-xs font-semibold border border-[#BFE7DE]">
                <ShieldCheck className="w-4 h-4 text-[#16A6A1]" />
                Accredited Tertiary Hospital & Medical Research Centre
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#123B5D] font-heading tracking-tight leading-tight">
                Specialized Inpatient Care and Clinical Medical Services
              </h1>

              <p className="text-base text-[#475A6C] max-w-2xl leading-relaxed">
                MediCore Hospital provides integrated secondary and tertiary clinical healthcare in Jaipur, featuring specialized medical departments, fully equipped intensive care units, accredited diagnostics, and 24-hour emergency medical response.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#appointment-booking"
                  className="px-6 py-3 rounded-xl font-semibold text-sm bg-[#16A6A1] text-white hover:bg-[#118480] shadow-sm transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Consultation</span>
                </a>
                <a
                  href="#departments"
                  className="px-6 py-3 rounded-xl font-semibold text-sm bg-white text-[#123B5D] border border-[#C2DBEB] hover:bg-[#E1EDF5] shadow-xs transition-all flex items-center gap-2"
                >
                  <Stethoscope className="w-4 h-4 text-[#16A6A1]" />
                  <span>Clinical Departments</span>
                </a>
              </div>

              <div className="pt-6 border-t border-[#E1EDF5] grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold text-[#123B5D] font-heading">50+</div>
                  <div className="text-xs text-[#657B8F] mt-0.5">Medical Specialists</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#16A6A1] font-heading">350</div>
                  <div className="text-xs text-[#657B8F] mt-0.5">Inpatient Beds</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#123B5D] font-heading">24/7</div>
                  <div className="text-xs text-[#657B8F] mt-0.5">Emergency Department</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#16A6A1] font-heading">NABL</div>
                  <div className="text-xs text-[#657B8F] mt-0.5">Accredited Laboratory</div>
                </div>
              </div>
            </div>

            {/* Right Column: Authentic Clinical Visual */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-[#C2DBEB] bg-white">
                <img
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1000&q=80"
                  alt="Attending Physician during Clinical Consultation"
                  className="w-full h-[420px] object-cover object-top"
                />
                <div className="p-4 bg-white border-t border-[#E1EDF5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-[#123B5D] font-heading">Dr. Rajesh Sharma, MD, DM</div>
                    <div className="text-xs text-[#657B8F]">Senior Consultant & Head, Department of Cardiology</div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#DDF3EE] text-[#0C685B] text-xs font-semibold self-start sm:self-auto border border-[#C2DBEB]/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#16A6A1]" />
                    <span>NABH & NABL Certified</span>
                  </div>
                </div>
              </div>

              {/* Institutional Quality Floating Badge at Top Right (No text overlap) */}
              <div className="hidden sm:flex absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-md border border-[#C2DBEB] items-center gap-2.5 z-10">
                <div className="w-8 h-8 rounded-lg bg-[#DDF3EE] text-[#0C685B] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#16A6A1]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#123B5D]">NABH & NABL</div>
                  <div className="text-[11px] text-[#657B8F]">Accredited Institution</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white border-y border-[#E1EDF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
                alt="Hospital Inpatient Facility"
                className="rounded-2xl shadow-xs object-cover h-64 w-full border border-[#E1EDF5]"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F5FAFC] p-5 rounded-xl border border-[#E1EDF5]">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#16A6A1]">Inpatient Care</div>
                  <div className="text-lg font-bold text-[#123B5D] font-heading mt-1">350 Bed Capacity</div>
                  <p className="text-xs text-[#657B8F] mt-1">Dedicated intensive care, critical units, and monitored private rooms.</p>
                </div>
                <div className="bg-[#DDF3EE] p-5 rounded-xl border border-[#BFE7DE]">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0C685B]">Clinical Theatres</div>
                  <div className="text-lg font-bold text-[#123B5D] font-heading mt-1">15 Operating Suites</div>
                  <p className="text-xs text-[#475A6C] mt-1">Class-100 laminar airflow and advanced surgical infrastructure.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="px-3 py-1 rounded-md bg-[#E1EDF5] text-[#123B5D] text-xs font-bold uppercase tracking-wider">
                Institutional Profile
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5D] font-heading tracking-tight">
                Comprehensive Healthcare Infrastructure & Clinical Governance
              </h2>
              <p className="text-sm text-[#475A6C] leading-relaxed">
                MediCore Hospital operates as a multi-speciality tertiary medical center in Jaipur, integrating acute care medicine, routine outpatient consultations, and specialized surgical disciplines. The hospital follows national accreditation protocols for patient safety, infection control, and clinical outcome documentation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#123B5D] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A6A1]" />
                    Consultant-Led Medical Care
                  </h4>
                  <p className="text-xs text-[#657B8F] leading-relaxed pl-6">
                    Direct management by credentialed senior physicians across medical and surgical disciplines.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#123B5D] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A6A1]" />
                    Integrated Diagnostic Systems
                  </h4>
                  <p className="text-xs text-[#657B8F] leading-relaxed pl-6">
                    In-house 3T MRI, 128-slice CT imaging, automated biochemistry, and microbiology laboratories.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#123B5D] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A6A1]" />
                    Insurance & Cashless Coverage
                  </h4>
                  <p className="text-xs text-[#657B8F] leading-relaxed pl-6">
                    Streamlined cashless pre-authorization for public healthcare schemes and private insurers.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#123B5D] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A6A1]" />
                    Standardized Clinical Pathways
                  </h4>
                  <p className="text-xs text-[#657B8F] leading-relaxed pl-6">
                    Evidence-based treatment protocols ensuring patient safety and reduced infection risk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Departments & Specialities */}
      <section id="departments" className="py-20 bg-[#F5FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="px-3 py-1 rounded-md bg-[#DDF3EE] text-[#0C685B] text-xs font-bold uppercase tracking-wider">
              Clinical Specialities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5D] font-heading tracking-tight mt-3">
              Specialized Medical Departments
            </h2>
            <p className="text-sm text-[#657B8F] mt-2">
              Structured clinical departments delivering non-invasive, surgical, and diagnostic medical services.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Cardiovascular Sciences', icon: HeartPulse, desc: 'Coronary interventions, diagnostic angiography, echocardiography, and cardiac critical care.', floor: 'Floor 2' },
              { name: 'Neurosciences', icon: Activity, desc: 'Stroke management, neurological monitoring, micro-neurosurgical procedures, and rehabilitation.', floor: 'Floor 2' },
              { name: 'Orthopedics & Spine', icon: Users, desc: 'Arthroplasty, trauma fixation, fracture repair, and comprehensive musculoskeletal care.', floor: 'Floor 1' },
              { name: 'Pediatrics & Neonatology', icon: ShieldCheck, desc: 'Preventive pediatric healthcare, Level-III neonatal intensive care, and childhood immunizations.', floor: 'Floor 1' },
              { name: 'Dermatology & Venereology', icon: Stethoscope, desc: 'Clinical evaluation of cutaneous diseases, diagnostic skin biopsies, and phototherapy.', floor: 'Floor 3' },
              { name: 'Otorhinolaryngology (ENT)', icon: Activity, desc: 'Endoscopic sinus evaluation, microscopic otological surgery, and voice clinic diagnostics.', floor: 'Floor 3' },
              { name: 'Internal Medicine', icon: Building, desc: 'Management of complex chronic conditions, metabolic disorders, and acute infectious illnesses.', floor: 'Ground Floor' },
              { name: 'Medical Oncology', icon: Microscope, desc: 'Evidence-based chemotherapy protocols, systemic oncology, and multidisciplinary tumor boards.', floor: 'Floor 4' },
            ].map((dept) => {
              const Icon = dept.icon;
              return (
                <div
                  key={dept.name}
                  className="bg-white rounded-2xl p-6 border border-[#E1EDF5] shadow-xs hover:border-[#16A6A1] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F5FAFC] text-[#16A6A1] border border-[#E1EDF5] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-[#657B8F] bg-[#F5FAFC] px-2 py-0.5 rounded border border-[#E1EDF5]">
                        {dept.floor}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-base text-[#123B5D]">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-[#475A6C] mt-2 leading-relaxed">
                      {dept.desc}
                    </p>
                  </div>
                  <a
                    href="#appointment-booking"
                    className="mt-5 pt-3 border-t border-[#F5FAFC] text-xs font-semibold text-[#16A6A1] flex items-center gap-1.5 hover:text-[#118480] transition-colors"
                  >
                    <span>Schedule Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Find a Doctor Section */}
      <section id="doctors" className="py-20 bg-white border-y border-[#E1EDF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="px-3 py-1 rounded-md bg-[#E1EDF5] text-[#123B5D] text-xs font-bold uppercase tracking-wider">
                Medical Staff Directory
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5D] font-heading tracking-tight mt-2">
                Consulting Physicians & Surgeons
              </h2>
              <p className="text-xs sm:text-sm text-[#657B8F] mt-1">
                Filter by physician name, qualification, or medical speciality.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#657B8F] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Filter by physician or department..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F5FAFC] border border-[#C2DBEB] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#16A6A1]"
              />
            </div>
          </div>

          {/* Department Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs font-medium">
            {['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT', 'General Medicine', 'Oncology'].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDept(d)}
                className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  selectedDept === d
                    ? 'bg-[#123B5D] text-white font-semibold'
                    : 'bg-[#F5FAFC] text-[#475A6C] hover:bg-[#E1EDF5] border border-[#E1EDF5]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {loadingDocs ? (
            <div className="text-center py-12 text-xs text-[#657B8F]">Loading physician registry...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-10 bg-[#F5FAFC] rounded-xl border border-[#E1EDF5]">
              <p className="text-xs text-[#657B8F]">No physician records match your search query.</p>
              <button
                onClick={() => { setSelectedDept('All'); setDoctorSearch(''); }}
                className="mt-2 text-xs font-semibold text-[#16A6A1] hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map(doc => (
                <div
                  key={doc.doctor_id}
                  className="bg-white rounded-2xl border border-[#E1EDF5] p-5 shadow-xs hover:border-[#16A6A1] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#123B5D] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {doc.first_name?.[0]}{doc.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-bold text-base text-[#123B5D] truncate">
                          Dr. {doc.first_name} {doc.last_name}
                        </h4>
                        <p className="text-xs font-semibold text-[#16A6A1]">{doc.specialization}</p>
                        <p className="text-xs text-[#657B8F] truncate">{doc.qualification}</p>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-[#F5FAFC] border border-[#E1EDF5] text-[#475A6C]">
                            {doc.experience_years ? `${doc.experience_years} Years Practice` : 'Senior Consultant'}
                          </span>
                          {doc.offers_video ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[#DDF3EE] text-[#0C685B] font-medium border border-[#BFE7DE]">
                              <Video className="w-3 h-3 text-[#16A6A1]" /> Telemedicine
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F5FAFC] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[#657B8F]">Department: </span>
                        <span className="font-semibold text-[#123B5D]">{doc.dept_name}</span>
                      </div>
                      <div>
                        <span className="text-[#657B8F]">OPD Fee: </span>
                        <span className="font-bold text-[#123B5D]">₹{doc.consultation_fee}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => selectDoctorForBooking(doc)}
                    className="mt-4 w-full py-2 px-3 rounded-xl bg-[#123B5D] hover:bg-[#16A6A1] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Select for Consultation</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Advanced Clinical Facilities */}
      <section id="facilities" className="py-20 bg-[#F5FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="px-3 py-1 rounded-md bg-[#DDF3EE] text-[#0C685B] text-xs font-bold uppercase tracking-wider">
              Diagnostic & Surgical Infrastructure
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5D] font-heading tracking-tight mt-3">
              Advanced Clinical Facilities
            </h2>
            <p className="text-sm text-[#657B8F] mt-2">
              Modern medical equipment maintained in accordance with national biomedical engineering standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl overflow-hidden border border-[#E1EDF5] shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=700&q=80"
                alt="Diagnostic Radiology Suite"
                className="w-full h-44 object-cover"
              />
              <div className="p-5">
                <div className="text-xs font-bold text-[#16A6A1] uppercase tracking-wider">Diagnostic Radiology</div>
                <h3 className="font-heading font-bold text-base text-[#123B5D] mt-1">3T High-Field MRI & 128-Slice CT</h3>
                <p className="text-xs text-[#475A6C] mt-2 leading-relaxed">
                  High-resolution cross-sectional anatomical scanning for neurological, cardiovascular, and musculoskeletal evaluations.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-[#E1EDF5] shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=700&q=80"
                alt="Operating Theatre Suite"
                className="w-full h-44 object-cover"
              />
              <div className="p-5">
                <div className="text-xs font-bold text-[#16A6A1] uppercase tracking-wider">Surgical Suites</div>
                <h3 className="font-heading font-bold text-base text-[#123B5D] mt-1">Modular Operating Theatres</h3>
                <p className="text-xs text-[#475A6C] mt-2 leading-relaxed">
                  Laminar air-flow HEPA filtration systems and integrated surgical workstations for minimally invasive procedures.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-[#E1EDF5] shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=700&q=80"
                alt="Intensive Care Unit"
                className="w-full h-44 object-cover"
              />
              <div className="p-5">
                <div className="text-xs font-bold text-[#16A6A1] uppercase tracking-wider">Critical Care Units</div>
                <h3 className="font-heading font-bold text-base text-[#123B5D] mt-1">Level-III Adult & Neonatal ICUs</h3>
                <p className="text-xs text-[#475A6C] mt-2 leading-relaxed">
                  Dedicated multi-parameter monitoring, mechanical ventilation, and continuous intensivist oversight for acute patients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Services */}
      <section id="services" className="py-20 bg-white border-y border-[#E1EDF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="px-3 py-1 rounded-md bg-[#E1EDF5] text-[#123B5D] text-xs font-bold uppercase tracking-wider">
              Care Continuum
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5D] font-heading tracking-tight mt-3">
              Hospital Services & Support
            </h2>
            <p className="text-sm text-[#657B8F] mt-2">
              Administrative, diagnostic, and clinical support services for outpatients and admitted individuals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Outpatient Consultations (OPD)', desc: 'Scheduled medical consultations across all clinical disciplines Monday through Saturday.', icon: Users },
              { title: 'Inpatient Accommodations', desc: 'Standard, semi-private, and private rooms maintained under strict hospital hygiene protocols.', icon: BedDouble },
              { title: 'Telemedicine Consultations', desc: 'Remote clinical follow-ups and verified electronic prescription reviews for chronic patients.', icon: Video },
              { title: 'Preventive Health Screenings', desc: 'Standardized comprehensive screening panels for cardiovascular, metabolic, and renal health.', icon: ShieldCheck },
              { title: 'In-Hospital Pharmacy', desc: '24-hour pharmaceutical dispensary with electronic inventory and cold-chain quality controls.', icon: Activity },
              { title: 'TPA & Insurance Claims Desk', desc: 'Pre-authorization facilitation and administrative documentation for cashless admissions.', icon: FileText },
            ].map(svc => {
              const Icon = svc.icon;
              return (
                <div key={svc.title} className="p-6 rounded-2xl bg-[#F5FAFC] border border-[#E1EDF5]">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#16A6A1] border border-[#E1EDF5] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-[#123B5D]">{svc.title}</h4>
                  <p className="text-xs text-[#475A6C] mt-2 leading-relaxed">{svc.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Appointment Booking Form */}
      <section id="appointment-booking" className="py-20 bg-[#F5FAFC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-2xl border border-[#C2DBEB] shadow-sm p-6 sm:p-10">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="px-3 py-1 rounded-md bg-[#DDF3EE] text-[#0C685B] text-xs font-bold uppercase tracking-wider">
                Registration & Scheduling
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5D] font-heading tracking-tight mt-2">
                Outpatient Appointment Request
              </h2>
              <p className="text-xs sm:text-sm text-[#657B8F] mt-1">
                Submit your clinical consultation request. Our patient administration team will verify physician availability and confirm your appointment.
              </p>
            </div>

            {bookingSuccess ? (
              <div className="p-8 bg-[#DDF3EE] rounded-xl border border-[#BFE7DE] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#16A6A1] text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-[#123B5D]">Appointment Request Registered</h3>
                <p className="text-xs sm:text-sm text-[#263746]">
                  Request recorded for <strong>{bookingSuccess.patient_name}</strong>.
                </p>
                <div className="inline-block px-4 py-1.5 bg-white rounded-lg text-xs font-mono font-bold text-[#123B5D] border border-[#BFE7DE]">
                  Reference ID: {bookingSuccess.reference}
                </div>
                <p className="text-xs text-[#475A6C]">
                  The patient administration desk will transmit an SMS confirmation to <strong>{bookingSuccess.phone}</strong> upon schedule validation.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setBookingSuccess(null)}
                    className="px-4 py-2 bg-[#123B5D] text-white rounded-xl text-xs font-semibold hover:bg-[#16A6A1] transition-colors"
                  >
                    Submit New Request
                  </button>
                  <Link
                    to="/appointments"
                    className="px-4 py-2 bg-white text-[#123B5D] border border-[#C2DBEB] rounded-xl text-xs font-semibold hover:bg-[#F5FAFC] transition-colors"
                  >
                    Hospital Portal Schedule
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#123B5D] uppercase tracking-wider mb-1.5">
                      Clinical Department
                    </label>
                    <select
                      value={booking.dept_id}
                      onChange={(e) => setBooking({ ...booking, dept_id: e.target.value, doctor_id: '' })}
                      className="w-full px-3.5 py-2.5 bg-[#F5FAFC] border border-[#C2DBEB] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#16A6A1]"
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map(d => (
                        <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#123B5D] uppercase tracking-wider mb-1.5">
                      Consulting Physician
                    </label>
                    <select
                      value={booking.doctor_id}
                      onChange={(e) => setBooking({ ...booking, doctor_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F5FAFC] border border-[#C2DBEB] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#16A6A1]"
                    >
                      <option value="">-- Select Physician --</option>
                      {doctors
                        .filter(doc => !booking.dept_id || String(doc.dept_id) === String(booking.dept_id))
                        .map(doc => (
                          <option key={doc.doctor_id} value={doc.doctor_id}>
                            Dr. {doc.first_name} {doc.last_name} ({doc.specialization}) - ₹{doc.consultation_fee}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#123B5D] uppercase tracking-wider mb-1.5">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={booking.date}
                      onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F5FAFC] border border-[#C2DBEB] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#16A6A1]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#123B5D] uppercase tracking-wider mb-1.5">
                      Preferred Time Block
                    </label>
                    <select
                      value={booking.time_slot}
                      onChange={(e) => setBooking({ ...booking, time_slot: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F5FAFC] border border-[#C2DBEB] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#16A6A1]"
                    >
                      <option>09:00 AM - 10:30 AM</option>
                      <option>10:30 AM - 12:00 PM</option>
                      <option>12:00 PM - 01:30 PM</option>
                      <option>02:30 PM - 04:00 PM</option>
                      <option>04:00 PM - 05:30 PM</option>
                      <option>05:30 PM - 07:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#123B5D] uppercase tracking-wider mb-1.5">
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter legal patient name"
                      value={booking.patient_name}
                      onChange={(e) => setBooking({ ...booking, patient_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F5FAFC] border border-[#C2DBEB] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#16A6A1]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#123B5D] uppercase tracking-wider mb-1.5">
                      Contact Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98000 00000"
                      value={booking.phone}
                      onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F5FAFC] border border-[#C2DBEB] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#16A6A1]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123B5D] uppercase tracking-wider mb-1.5">
                    Consultation Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBooking({ ...booking, consultation_type: 'In-Person' })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        booking.consultation_type === 'In-Person'
                          ? 'border-[#16A6A1] bg-[#DDF3EE] text-[#0C685B]'
                          : 'border-[#E1EDF5] bg-[#F5FAFC] text-[#475A6C]'
                      }`}
                    >
                      <Building className="w-4 h-4 text-[#16A6A1]" />
                      <span>In-Hospital Outpatient Consultation</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBooking({ ...booking, consultation_type: 'Video' })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        booking.consultation_type === 'Video'
                          ? 'border-[#16A6A1] bg-[#DDF3EE] text-[#0C685B]'
                          : 'border-[#E1EDF5] bg-[#F5FAFC] text-[#475A6C]'
                      }`}
                    >
                      <Video className="w-4 h-4 text-[#16A6A1]" />
                      <span>Remote Video Telemedicine</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl bg-[#16A6A1] hover:bg-[#118480] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Submit Consultation Request</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Clinical Outcomes & Patient Cases */}
      <section id="cases" className="py-20 bg-white border-y border-[#E1EDF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="px-3 py-1 rounded-md bg-[#E1EDF5] text-[#123B5D] text-xs font-bold uppercase tracking-wider">
              Clinical Case Documentation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5D] font-heading tracking-tight mt-3">
              Patient Care Outcomes
            </h2>
            <p className="text-sm text-[#657B8F] mt-2">
              Documented treatment outcomes across medical and surgical departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Acute Coronary Intervention",
                desc: "Emergency primary angioplasty performed within 45 minutes of emergency department presentation, resulting in successful arterial revascularization.",
                speciality: "Department of Cardiology",
                patientRef: "Patient Record #1084",
                location: "Jaipur"
              },
              {
                title: "Total Knee Arthroplasty",
                desc: "Bilateral joint reconstruction utilizing preoperative 3D imaging alignment, enabling supervised weight-bearing mobilization within 48 hours post-op.",
                speciality: "Department of Orthopedics",
                patientRef: "Patient Record #1129",
                location: "Kota"
              },
              {
                title: "Neonatal Intensive Support",
                desc: "Level-III respiratory and thermal stabilization for 31-week premature twin neonates with successful discharge at normal developmental milestones.",
                speciality: "Neonatal Intensive Care",
                patientRef: "Patient Record #1204",
                location: "Ajmer"
              }
            ].map(item => (
              <div
                key={item.title}
                className="bg-[#F5FAFC] rounded-2xl p-6 border border-[#E1EDF5] flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#E1EDF5] text-[#123B5D]">
                    {item.speciality}
                  </span>
                  <h4 className="font-heading font-bold text-base text-[#123B5D] mt-3">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#475A6C] mt-2 leading-relaxed">
                    "{item.desc}"
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#E1EDF5] flex items-center justify-between text-xs text-[#657B8F]">
                  <span>{item.patientRef}</span>
                  <span>{item.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Department Notice */}
      <section className="py-12 bg-[#123B5D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-200 text-xs font-semibold border border-red-500/30">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" /> 24-Hour Emergency & Trauma Unit
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                Emergency Medical Services Active
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Advanced life support ambulances, emergency physicians on duty, and immediate admission protocols.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:18002009999"
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Emergency: 1800-200-9999</span>
              </a>
              <a
                href="tel:01412378900"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 flex items-center gap-2 transition-colors"
              >
                <Ambulance className="w-4 h-4 text-[#35C2BD]" />
                <span>Ambulance: +91 141 237 8900</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Coordinates & Interactive Map */}
      <section id="contact" className="py-20 bg-[#F5FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="px-3 py-1 rounded-md bg-[#DDF3EE] text-[#0C685B] text-xs font-bold uppercase tracking-wider">
              Location & Access
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5D] font-heading tracking-tight mt-3">
              Hospital Location & Access
            </h2>
            <p className="text-sm text-[#657B8F] mt-2">
              Centrally located on MI Road, Jaipur. Accessible via road and major transit hubs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-[#E1EDF5] shadow-xs space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#DDF3EE] text-[#16A6A1] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-sm text-[#123B5D]">Address</h5>
                    <p className="text-xs text-[#475A6C] mt-0.5">
                      12 MI Road, Ashok Nagar, Jaipur, Rajasthan 302001
                    </p>
                    <span className="text-xs text-[#657B8F] mt-0.5 block">Geographical Coordinates: 26.9124° N, 75.7873° E</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-[#F5FAFC]">
                  <div className="w-9 h-9 rounded-lg bg-[#DDF3EE] text-[#16A6A1] flex items-center justify-center flex-shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-sm text-[#123B5D]">Telephone Enquiries</h5>
                    <p className="text-xs text-[#475A6C] mt-0.5">Emergency Helpline: 1800-200-9999 (Toll Free)</p>
                    <p className="text-xs text-[#475A6C]">General Information & OPD: +91 141 237 8900</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-[#F5FAFC]">
                  <div className="w-9 h-9 rounded-lg bg-[#DDF3EE] text-[#16A6A1] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-sm text-[#123B5D]">Electronic Mail</h5>
                    <p className="text-xs text-[#475A6C] mt-0.5">Administration: care@medicorehospital.in</p>
                    <p className="text-xs text-[#475A6C]">Clinical Scheduling: appointments@medicorehospital.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-[#F5FAFC]">
                  <div className="w-9 h-9 rounded-lg bg-[#DDF3EE] text-[#16A6A1] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-sm text-[#123B5D]">Inpatient Visiting Hours</h5>
                    <p className="text-xs text-[#475A6C] mt-0.5">Morning Session: 10:00 AM – 12:00 PM</p>
                    <p className="text-xs text-[#475A6C]">Evening Session: 05:00 PM – 07:00 PM</p>
                    <p className="text-xs text-[#16A6A1] font-semibold mt-0.5">Emergency Department: Open 24 Hours</p>
                  </div>
                </div>
              </div>

              {/* Portal Access Container */}
              <div className="bg-[#123B5D] text-white p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-heading font-bold text-sm text-white">Healthcare Information System (HIS)</h5>
                    <p className="text-xs text-slate-300 mt-0.5">Authorized medical staff and patient administration portal.</p>
                  </div>
                  <Link
                    to={user ? "/dashboard" : "/login"}
                    className="px-3 py-1.5 rounded-xl bg-[#16A6A1] text-white text-xs font-semibold hover:bg-[#118480] transition-colors"
                  >
                    {user ? "Dashboard" : "Sign In"}
                  </Link>
                </div>
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-3 border border-[#E1EDF5] shadow-xs h-[420px]">
              <div className="w-full h-full rounded-xl overflow-hidden relative">
                <MapContainer
                  center={hospitalCoords}
                  zoom={14}
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={hospitalCoords} icon={hospitalIcon}>
                    <Popup>
                      <div className="p-1 font-sans">
                        <strong className="text-[#123B5D] font-bold text-sm block">MediCore Hospital</strong>
                        <span className="text-xs text-slate-600 block">12 MI Road, Jaipur</span>
                        <span className="text-xs text-[#16A6A1] font-semibold block mt-1">Tertiary Inpatient Care & Emergency</span>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="bg-[#123B5D] text-white pt-16 pb-8 border-t border-[#0C273E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-700">
            
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#16A6A1] text-white flex items-center justify-center font-bold text-base">
                  M+
                </div>
                <div>
                  <span className="text-lg font-bold text-white font-heading tracking-tight block">
                    MediCore Hospital
                  </span>
                  <span className="text-xs font-semibold text-[#DDF3EE] tracking-wider uppercase block">
                    Medical & Clinical Research Centre
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                Accredited tertiary hospital providing inpatient medical treatment, routine specialized outpatient consultations, diagnostic laboratories, and emergency care in Jaipur, Rajasthan.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[#35C2BD] font-semibold border border-slate-700">
                  NABH Accredited
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[#35C2BD] font-semibold border border-slate-700">
                  NABL Certified Lab
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[#35C2BD] font-semibold border border-slate-700">
                  ISO 9001:2015
                </span>
              </div>
            </div>

            <div>
              <h5 className="font-heading font-bold text-xs text-white uppercase tracking-wider mb-3">
                Navigation
              </h5>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><a href="#about" className="hover:text-[#35C2BD] transition-colors">Institutional Profile</a></li>
                <li><a href="#departments" className="hover:text-[#35C2BD] transition-colors">Clinical Specialities</a></li>
                <li><a href="#doctors" className="hover:text-[#35C2BD] transition-colors">Medical Staff Directory</a></li>
                <li><a href="#facilities" className="hover:text-[#35C2BD] transition-colors">Diagnostic Radiology</a></li>
                <li><a href="#appointment-booking" className="hover:text-[#35C2BD] transition-colors">Consultation Scheduling</a></li>
                <li><Link to="/map" className="hover:text-[#35C2BD] transition-colors">Patient Catchment Map</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-heading font-bold text-xs text-white uppercase tracking-wider mb-3">
                Specialities
              </h5>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><a href="#doctors" className="hover:text-[#35C2BD] transition-colors">Cardiovascular Sciences</a></li>
                <li><a href="#doctors" className="hover:text-[#35C2BD] transition-colors">Neurology & Stroke Unit</a></li>
                <li><a href="#doctors" className="hover:text-[#35C2BD] transition-colors">Orthopedics & Arthroplasty</a></li>
                <li><a href="#doctors" className="hover:text-[#35C2BD] transition-colors">Neonatal Intensive Care (NICU)</a></li>
                <li><a href="#doctors" className="hover:text-[#35C2BD] transition-colors">Medical Oncology</a></li>
                <li><a href="#doctors" className="hover:text-[#35C2BD] transition-colors">Emergency & Acute Medicine</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-heading font-bold text-xs text-white uppercase tracking-wider mb-3">
                Information System
              </h5>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link to="/login" className="hover:text-[#35C2BD] transition-colors">Clinical Portal Sign In</Link></li>
                <li><Link to="/login" className="hover:text-[#35C2BD] transition-colors">Patient EHR Records</Link></li>
                <li><Link to="/lab-tools/query-explorer" className="hover:text-[#35C2BD] transition-colors">Database Query Explorer</Link></li>
                <li><Link to="/lab-tools/rule-tests" className="hover:text-[#35C2BD] transition-colors">Integrity Rule Audit</Link></li>
                <li className="pt-2 text-xs text-slate-400">Database Engine: MySQL 8</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <div>
              © 2026 MediCore Hospital & Medical Research Centre. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Patient Charter</span>
              <span>Infection Control Policies</span>
              <span>Bio-Medical Waste Returns</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
