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
  ChevronRight,
  Star,
  Ambulance,
  Sparkles,
  BedDouble,
  Microscope,
  Cpu,
  Mail,
  UserCheck,
  FileText,
  AlertTriangle
} from 'lucide-react';

// Hospital Marker Icon for Leaflet
const hospitalIcon = new L.DivIcon({
  className: 'custom-hospital-marker',
  html: `<div style="background-color: #16A6A1; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; border: 3px solid white; box-shadow: 0 4px 12px rgba(18,59,93,0.35);">M+</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19]
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
    // Fetch live doctors & departments from MySQL via public endpoints
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

  // Filtered doctors
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
      alert('Please provide your name and phone number');
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
    <div className="min-h-screen bg-[#F5FAFC] text-[#263746] font-sans">

      {/* ──────────────────────────────────────────────────────────
          1. NAVIGATION BAR
      ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-nav border-b border-[#E1EDF5] transition-all">
        {/* Top Emergency & Info Banner */}
        <div className="bg-[#123B5D] text-white text-xs py-1.5 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 font-medium">
                <Ambulance className="w-3.5 h-3.5 text-[#16A6A1]" />
                24/7 Emergency & Trauma Hotline: <strong className="text-[#35C2BD] tracking-wide ml-1">1800-200-9999</strong>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-slate-300">
                <MapPin className="w-3 h-3 text-[#16A6A1]" /> 12 MI Road, Jaipur
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-300">
              <span className="hidden lg:inline">NABH & NABL Accredited Tertiary Hospital</span>
              <span className="text-[#DDF3EE]">OPD: Mon–Sat 8:00 AM – 8:00 PM</span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#123B5D] to-[#16A6A1] text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:shadow-lg transition-transform group-hover:scale-105">
              M+
            </div>
            <div>
              <span className="text-2xl font-extrabold text-[#123B5D] font-heading tracking-tight block leading-tight">
                MediCore
              </span>
              <span className="text-[11px] font-medium text-[#16A6A1] tracking-widest uppercase block -mt-0.5">
                Hospital & Research
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#263746]">
            <a href="#about" className="hover:text-[#16A6A1] transition-colors">About</a>
            <a href="#departments" className="hover:text-[#16A6A1] transition-colors">Specialities</a>
            <a href="#doctors" className="hover:text-[#16A6A1] transition-colors">Find a Doctor</a>
            <a href="#facilities" className="hover:text-[#16A6A1] transition-colors">Facilities</a>
            <a href="#services" className="hover:text-[#16A6A1] transition-colors">Services</a>
            <a href="#testimonials" className="hover:text-[#16A6A1] transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-[#16A6A1] transition-colors">Contact</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#DDF3EE] text-[#0C685B] hover:bg-[#BFE7DE] border border-[#BFE7DE] transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Portal ({user.username})</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#123B5D] hover:bg-[#E1EDF5] border border-[#C2DBEB] transition-all"
              >
                Staff & Patient Login
              </Link>
            )}

            <a
              href="#appointment-booking"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#16A6A1] text-white hover:bg-[#118480] shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </a>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────
          2. ATTRACTIVE HERO SECTION
      ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-[#F5FAFC] via-[#E1EDF5]/40 to-[#F5FAFC]">
        {/* Subtle decorative background blur shapes */}
        <div className="absolute top-12 left-1/4 w-96 h-96 bg-[#DDF3EE] rounded-full filter blur-3xl opacity-50 -z-10" />
        <div className="absolute bottom-8 right-10 w-96 h-96 bg-[#16A6A1]/10 rounded-full filter blur-3xl opacity-50 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DDF3EE] text-[#0C685B] text-xs font-semibold border border-[#BFE7DE]">
                <Sparkles className="w-3.5 h-3.5 text-[#16A6A1]" />
                NABH Accredited Multi-Speciality Tertiary Care
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#123B5D] font-heading tracking-tight leading-[1.12]">
                World-Class Healthcare,{' '}
                <span className="text-[#16A6A1] underline decoration-[#DDF3EE] decoration-4 underline-offset-8">
                  Centered Around You.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#475A6C] max-w-xl leading-relaxed">
                Experience exceptional medical expertise, pioneering robotic surgical care, and 24/7 emergency response. Delivering trusted, compassionate clinical outcomes in Jaipur for over two decades.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#appointment-booking"
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-[#16A6A1] text-white hover:bg-[#118480] shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Consultation</span>
                </a>
                <a
                  href="#doctors"
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white text-[#123B5D] border border-[#C2DBEB] hover:bg-[#E1EDF5] shadow-card transition-all flex items-center gap-2"
                >
                  <Stethoscope className="w-4 h-4 text-[#16A6A1]" />
                  <span>Meet Our Specialists</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#E1EDF5] grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-extrabold text-[#123B5D] font-heading">50+</div>
                  <div className="text-xs text-[#657B8F]">Super-Specialists</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#16A6A1] font-heading">24/7</div>
                  <div className="text-xs text-[#657B8F]">Trauma & Emergency</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#123B5D] font-heading">99.2%</div>
                  <div className="text-xs text-[#657B8F]">Patient Satisfaction</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#16A6A1] font-heading">350+</div>
                  <div className="text-xs text-[#657B8F]">Modern Hospital Beds</div>
                </div>
              </div>
            </div>

            {/* Right Visual Image with Floating Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80"
                  alt="Senior Physician at MediCore Hospital"
                  className="w-full h-[460px] object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#123B5D]/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="font-heading font-bold text-lg">Dr. Rajesh Sharma</div>
                  <div className="text-xs text-[#DDF3EE]">Chief of Cardiology & Interventional Cardiologist</div>
                </div>
              </div>

              {/* Floating Pill: 24/7 Instant Care */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white rounded-2xl p-3.5 shadow-hover border border-[#E1EDF5] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#DDF3EE] text-[#0C685B] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#16A6A1]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#123B5D]">NABH & NABL</div>
                  <div className="text-[11px] text-[#657B8F]">Certified Hospital</div>
                </div>
              </div>

              {/* Floating Pill: Patient Rating */}
              <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-white rounded-2xl p-3.5 shadow-hover border border-[#E1EDF5] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#123B5D]">4.9 / 5 Rating</div>
                  <div className="text-[11px] text-[#657B8F]">12,000+ Patient Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          3. ABOUT THE HOSPITAL
      ────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-white border-y border-[#E1EDF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Collage */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=700&q=80"
                  alt="Modern Hospital Architecture"
                  className="rounded-2xl shadow-card object-cover h-56 w-full"
                />
                <div className="bg-[#123B5D] text-white p-6 rounded-2xl">
                  <h4 className="font-heading font-bold text-2xl text-[#35C2BD]">25+ Years</h4>
                  <p className="text-xs text-slate-300 mt-1">Dedicated clinical service in Rajasthan with patient-first values.</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-[#DDF3EE] p-6 rounded-2xl text-[#123B5D]">
                  <Award className="w-8 h-8 text-[#16A6A1] mb-2" />
                  <h4 className="font-heading font-bold text-base">Accredited Quality</h4>
                  <p className="text-xs text-[#475A6C] mt-1">International standards for infection control & patient safety.</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=700&q=80"
                  alt="Clinical Care Team"
                  className="rounded-2xl shadow-card object-cover h-56 w-full"
                />
              </div>
            </div>

            {/* Content Details */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-block px-3 py-1 rounded-md bg-[#E1EDF5] text-[#123B5D] text-xs font-semibold tracking-wider uppercase">
                About MediCore
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-heading tracking-tight">
                Pioneering Healthcare Excellence With Compassion
              </h2>
              <p className="text-sm sm:text-base text-[#475A6C] leading-relaxed">
                Founded with a mission to bring world-class healthcare to Jaipur, MediCore Hospital brings together top medical minds, state-of-the-art robotic surgical infrastructure, and an empathetic care philosophy.
              </p>
              <p className="text-sm text-[#475A6C] leading-relaxed">
                From emergency trauma care to complex cardiac surgeries and neonatal intensive care, we provide seamless multidisciplinary medical attention under one roof with transparent billing and zero hidden costs.
              </p>

              {/* 4 Feature Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#16A6A1] flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-[#123B5D]">Board-Certified Specialists</h5>
                    <p className="text-xs text-[#657B8F]">Trained at premier national and international medical institutes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#16A6A1] flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-[#123B5D]">Next-Gen Medical Tech</h5>
                    <p className="text-xs text-[#657B8F]">3T MRI, 128-Slice CT, and robotic surgery suites.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#16A6A1] flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-[#123B5D]">Transparent & Cashless</h5>
                    <p className="text-xs text-[#657B8F]">Empanelled with 50+ insurance providers & TPA desks.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#16A6A1] flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-[#123B5D]">Zero Wait Emergency</h5>
                    <p className="text-xs text-[#657B8F]">Dedicated Golden-Hour triage and rapid response.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          4. MEDICAL DEPARTMENTS & SPECIALITIES
      ────────────────────────────────────────────────────────── */}
      <section id="departments" className="py-20 bg-[#F5FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="px-3 py-1 rounded-md bg-[#DDF3EE] text-[#0C685B] text-xs font-semibold uppercase tracking-wider">
              Centres of Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-heading tracking-tight mt-3">
              Comprehensive Medical Specialities
            </h2>
            <p className="text-sm text-[#475A6C] mt-2">
              Integrated departments equipped with modern diagnostic facilities, dedicated operation theatres, and specialist care teams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Cardiology', icon: HeartPulse, desc: 'Advanced cath lab, angioplasty, pacemaker implantations & cardiac ICU care.', floor: 'Floor 2' },
              { name: 'Neurology & Brain', icon: Activity, desc: 'Stroke emergency unit, epilepsy management, neuro-rehab & micro-neurosurgery.', floor: 'Floor 2' },
              { name: 'Orthopedics & Spine', icon: Users, desc: 'Robotic knee and hip replacements, complex fracture trauma & sports injury clinic.', floor: 'Floor 1' },
              { name: 'Pediatrics & NICU', icon: Sparkles, desc: 'Level-3 neonatal ICU, pediatric surgeries, vaccination and child developmental clinic.', floor: 'Floor 1' },
              { name: 'Dermatology & Cosmetology', icon: Award, desc: 'Clinical dermatology, laser therapies, skin allergy testing and aesthetic procedures.', floor: 'Floor 3' },
              { name: 'ENT & Head-Neck', icon: Stethoscope, desc: 'Microscopic ear surgeries, endoscopic sinus procedures and voice clinic.', floor: 'Floor 3' },
              { name: 'General Medicine', icon: Building, desc: 'Preventive health, chronic diabetes & hypertension, infectious disease care.', floor: 'Ground Floor' },
              { name: 'Oncology Care', icon: Microscope, desc: 'Medical and surgical oncology, targeted chemotherapy suites & tumor board.', floor: 'Floor 4' },
            ].map((dept, i) => {
              const Icon = dept.icon;
              return (
                <div
                  key={dept.name}
                  className="bg-white rounded-2xl p-6 border border-[#E1EDF5] shadow-card hover:shadow-hover hover:-translate-y-1 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#DDF3EE] text-[#16A6A1] flex items-center justify-center group-hover:bg-[#16A6A1] group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-medium text-[#657B8F] bg-[#F5FAFC] px-2 py-0.5 rounded border border-[#E1EDF5]">
                        {dept.floor}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-[#123B5D] group-hover:text-[#16A6A1] transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-[#475A6C] mt-2 leading-relaxed">
                      {dept.desc}
                    </p>
                  </div>
                  <a
                    href="#appointment-booking"
                    className="mt-5 pt-4 border-t border-[#F5FAFC] text-xs font-semibold text-[#16A6A1] flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    <span>Consult Department</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          5. FIND A DOCTOR SECTION
      ────────────────────────────────────────────────────────── */}
      <section id="doctors" className="py-20 bg-white border-y border-[#E1EDF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="px-3 py-1 rounded-md bg-[#E1EDF5] text-[#123B5D] text-xs font-semibold uppercase tracking-wider">
                Our Clinicians
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-heading tracking-tight mt-2">
                Find a Specialist Doctor
              </h2>
              <p className="text-sm text-[#475A6C] mt-1">
                Browse our roster of board-certified consultants across departments.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#657B8F] absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search doctor or speciality..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5FAFC] border border-[#C2DBEB] rounded-xl text-sm focus:outline-none focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/20"
              />
            </div>
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs font-medium scrollbar-none">
            {['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT', 'General Medicine', 'Oncology'].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDept(d)}
                className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  selectedDept === d
                    ? 'bg-[#123B5D] text-white shadow-sm'
                    : 'bg-[#F5FAFC] text-[#475A6C] hover:bg-[#E1EDF5] border border-[#E1EDF5]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Doctors Grid */}
          {loadingDocs ? (
            <div className="text-center py-16 text-slate-400">Loading specialist directory...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12 bg-[#F5FAFC] rounded-2xl border border-dashed border-[#C2DBEB]">
              <p className="text-sm text-[#657B8F]">No doctors found matching "{doctorSearch}".</p>
              <button
                onClick={() => { setSelectedDept('All'); setDoctorSearch(''); }}
                className="mt-2 text-xs font-bold text-[#16A6A1] hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map(doc => (
                <div
                  key={doc.doctor_id}
                  className="bg-white rounded-2xl border border-[#E1EDF5] p-5 shadow-card hover:shadow-hover hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#123B5D] to-[#16A6A1] text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-sm">
                        {doc.first_name?.[0]}{doc.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-heading font-bold text-base text-[#123B5D] truncate">
                            Dr. {doc.first_name} {doc.last_name}
                          </h4>
                        </div>
                        <p className="text-xs font-medium text-[#16A6A1]">{doc.specialization}</p>
                        <p className="text-[11px] text-[#657B8F] truncate">{doc.qualification}</p>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-[#F5FAFC] border border-[#E1EDF5] text-[#475A6C]">
                            {doc.experience_years ? `${doc.experience_years} yrs exp` : 'Senior Consultant'}
                          </span>
                          {doc.offers_video ? (
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[#DDF3EE] text-[#0C685B] font-semibold border border-[#BFE7DE]">
                              <Video className="w-3 h-3 text-[#16A6A1]" /> Video Consultation
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#F5FAFC] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[#657B8F]">Department: </span>
                        <span className="font-semibold text-[#123B5D]">{doc.dept_name}</span>
                      </div>
                      <div>
                        <span className="text-[#657B8F]">Fee: </span>
                        <span className="font-bold text-[#16A6A1]">₹{doc.consultation_fee}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => selectDoctorForBooking(doc)}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#123B5D] hover:bg-[#16A6A1] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book with Dr. {doc.last_name}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          6. ADVANCED MEDICAL FACILITIES
      ────────────────────────────────────────────────────────── */}
      <section id="facilities" className="py-20 bg-[#F5FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="px-3 py-1 rounded-md bg-[#DDF3EE] text-[#0C685B] text-xs font-semibold uppercase tracking-wider">
              Clinical Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-heading tracking-tight mt-3">
              Advanced Medical Facilities
            </h2>
            <p className="text-sm text-[#475A6C] mt-2">
              Engineered with world-class medical equipment to maximize patient safety and precision diagnostics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl overflow-hidden border border-[#E1EDF5] shadow-card hover:shadow-hover transition-all">
              <img
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
                alt="3T MRI and 128-Slice CT Imaging"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-xs font-semibold text-[#16A6A1] uppercase tracking-wider">Precision Imaging</div>
                <h3 className="font-heading font-bold text-lg text-[#123B5D] mt-1">3T Silent MRI & 128-Slice CT</h3>
                <p className="text-xs text-[#475A6C] mt-2 leading-relaxed">
                  Ultra-high-definition non-invasive scanning with 50% reduced acoustic noise for seamless pediatric and adult neuro and cardiac imaging.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-[#E1EDF5] shadow-card hover:shadow-hover transition-all">
              <img
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80"
                alt="Robotic Surgery Suite"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-xs font-semibold text-[#16A6A1] uppercase tracking-wider">Surgical Innovation</div>
                <h3 className="font-heading font-bold text-lg text-[#123B5D] mt-1">Robotic Surgery Theatres</h3>
                <p className="text-xs text-[#475A6C] mt-2 leading-relaxed">
                  Equipped with minimally invasive surgical robots, laminar air-flow infection filters, and 4K fluorescence laparoscopic imaging.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-[#E1EDF5] shadow-card hover:shadow-hover transition-all">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80"
                alt="Intensive Care Unit"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-xs font-semibold text-[#16A6A1] uppercase tracking-wider">Critical Life Support</div>
                <h3 className="font-heading font-bold text-lg text-[#123B5D] mt-1">Level III Critical Care & NICU</h3>
                <p className="text-xs text-[#475A6C] mt-2 leading-relaxed">
                  24/7 dedicated intensivists, continuous hemodynamic monitoring, advanced ventilators, and specialized isolation negative-pressure rooms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          7. PATIENT SERVICES
      ────────────────────────────────────────────────────────── */}
      <section id="services" className="py-20 bg-white border-y border-[#E1EDF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="px-3 py-1 rounded-md bg-[#E1EDF5] text-[#123B5D] text-xs font-semibold uppercase tracking-wider">
              Care Continuum
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-heading tracking-tight mt-3">
              Comprehensive Patient Services
            </h2>
            <p className="text-sm text-[#475A6C] mt-2">
              Designed to make every step of your medical journey smooth, transparent, and supportive.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Outpatient Consultations', desc: 'Consult experienced specialists with zero wait-time appointment scheduling.', icon: Users },
              { title: 'Inpatient Private Suites', desc: 'Spacious recovery rooms equipped with patient monitoring, Wi-Fi, and attendant amenities.', icon: BedDouble },
              { title: 'Teleconsultation Video Care', desc: 'Secure high-definition remote video sessions with prescription delivery.', icon: Video },
              { title: 'Executive Health Checkups', desc: 'Tailored preventative wellness screenings for cardiac, diabetic, and oncology risk.', icon: ShieldCheck },
              { title: '24/7 Pharmacy & Delivery', desc: 'Genuine pharmaceutical dispensary with computerized dosage double-checks.', icon: Activity },
              { title: 'Cashless Insurance Desk', desc: 'Fast-track TPA claims processing with 50+ empanelled corporate insurers.', icon: FileText },
            ].map(svc => {
              const Icon = svc.icon;
              return (
                <div key={svc.title} className="p-6 rounded-2xl bg-[#F5FAFC] border border-[#E1EDF5] hover:border-[#16A6A1] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-xs text-[#16A6A1] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-bold text-base text-[#123B5D]">{svc.title}</h4>
                  <p className="text-xs text-[#475A6C] mt-2 leading-relaxed">{svc.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          8. APPOINTMENT BOOKING (INTERACTIVE)
      ────────────────────────────────────────────────────────── */}
      <section id="appointment-booking" className="py-20 bg-gradient-to-b from-[#F5FAFC] to-[#E1EDF5]/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-3xl border border-[#C2DBEB] shadow-2xl overflow-hidden p-6 sm:p-10">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="px-3 py-1 rounded-full bg-[#DDF3EE] text-[#0C685B] text-xs font-semibold uppercase">
                Fast Slot Booking
              </span>
              <h2 className="text-3xl font-extrabold text-[#123B5D] font-heading tracking-tight mt-2">
                Book a Doctor's Appointment
              </h2>
              <p className="text-xs sm:text-sm text-[#475A6C] mt-1">
                Fill the details below to schedule an in-hospital visit or video consultation.
              </p>
            </div>

            {bookingSuccess ? (
              <div className="p-8 bg-[#DDF3EE] rounded-2xl border border-[#BFE7DE] text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#16A6A1] text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-[#123B5D]">Appointment Scheduled!</h3>
                <p className="text-sm text-[#263746]">
                  Thank you, <strong>{bookingSuccess.patient_name}</strong>. Your consultation has been provisionally reserved.
                </p>
                <div className="inline-block px-4 py-2 bg-white rounded-xl text-xs font-mono font-bold text-[#123B5D] border border-[#BFE7DE]">
                  Booking Reference: {bookingSuccess.reference}
                </div>
                <p className="text-xs text-[#475A6C]">
                  Our reception desk will dispatch an SMS confirmation to <strong>{bookingSuccess.phone}</strong> with room directions and slot time.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setBookingSuccess(null)}
                    className="px-4 py-2 bg-[#123B5D] text-white rounded-xl text-xs font-semibold hover:bg-[#16A6A1] transition-colors"
                  >
                    Book Another Appointment
                  </button>
                  <Link
                    to="/appointments"
                    className="px-4 py-2 bg-white text-[#123B5D] border border-[#C2DBEB] rounded-xl text-xs font-semibold hover:bg-[#F5FAFC] transition-colors"
                  >
                    View in Hospital Portal
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Department */}
                  <div>
                    <label className="block text-xs font-bold text-[#123B5D] uppercase tracking-wider mb-1.5">
                      Select Department
                    </label>
                    <select
                      value={booking.dept_id}
                      onChange={(e) => setBooking({ ...booking, dept_id: e.target.value, doctor_id: '' })}
                      className="w-full px-3.5 py-2.5 bg-[#F5FAFC] border border-[#C2DBEB] rounded-xl text-sm focus:outline-none focus:border-[#16A6A1]"
                    >
                      <option value="">-- Choose Speciality --</option>
                      {departments.map(d => (
                        <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Doctor */}
                  <div>
                    <label className="block text-xs font-bold text-[#123B5D] uppercase tracking-wider mb-1.5">
                      Select Doctor
                    </label>
                    <select
                      value={booking.doctor_id}
                      onChange={(e) => setBooking({ ...booking, doctor_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F5FAFC] border border-[#C2DBEB] rounded-xl text-sm focus:outline-none focus:border-[#16A6A1]"
                    >
                      <option value="">-- Choose Doctor --</option>
                      {doctors
                        .filter(doc => !booking.dept_id || String(doc.dept_id) === String(booking.dept_id))
                        .map(doc => (
                          <option key={doc.doctor_id} value={doc.doctor_id}>
                            Dr. {doc.first_name} {doc.last_name} ({doc.specialization}) - ₹{doc.consultation_fee}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-bold text-[#123B5D] uppercase tracking-wider mb-1.5">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={booking.date}
                      onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F5FAFC] border border-[#C2DBEB] rounded-xl text-sm focus:outline-none focus:border-[#16A6A1]"
                    />
                  </div>

                  {/* Time Slot */}
                  <div>
                    <label className="block text-xs font-bold text-[#123B5D] uppercase tracking-wider mb-1.5">
                      Preferred Slot
                    </label>
                    <select
                      value={booking.time_slot}
                      onChange={(e) => setBooking({ ...booking, time_slot: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F5FAFC] border border-[#C2DBEB] rounded-xl text-sm focus:outline-none focus:border-[#16A6A1]"
                    >
                      <option>09:00 AM - 10:00 AM</option>
                      <option>10:00 AM - 11:30 AM</option>
                      <option>11:30 AM - 01:00 PM</option>
                      <option>02:00 PM - 03:30 PM</option>
                      <option>03:30 PM - 05:00 PM</option>
                      <option>05:00 PM - 07:00 PM</option>
                    </select>
                  </div>

                  {/* Patient Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#123B5D] uppercase tracking-wider mb-1.5">
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra Sharma"
                      value={booking.patient_name}
                      onChange={(e) => setBooking({ ...booking, patient_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F5FAFC] border border-[#C2DBEB] rounded-xl text-sm focus:outline-none focus:border-[#16A6A1]"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-[#123B5D] uppercase tracking-wider mb-1.5">
                      Mobile Number (For SMS Confirmation) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={booking.phone}
                      onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F5FAFC] border border-[#C2DBEB] rounded-xl text-sm focus:outline-none focus:border-[#16A6A1]"
                    />
                  </div>
                </div>

                {/* Consultation Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#123B5D] uppercase tracking-wider mb-2">
                    Consultation Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setBooking({ ...booking, consultation_type: 'In-Person' })}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        booking.consultation_type === 'In-Person'
                          ? 'border-[#16A6A1] bg-[#DDF3EE] text-[#0C685B]'
                          : 'border-[#E1EDF5] bg-[#F5FAFC] text-[#475A6C]'
                      }`}
                    >
                      <Building className="w-4 h-4 text-[#16A6A1]" />
                      <span>In-Hospital OPD Visit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBooking({ ...booking, consultation_type: 'Video' })}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        booking.consultation_type === 'Video'
                          ? 'border-[#16A6A1] bg-[#DDF3EE] text-[#0C685B]'
                          : 'border-[#E1EDF5] bg-[#F5FAFC] text-[#475A6C]'
                      }`}
                    >
                      <Video className="w-4 h-4 text-[#16A6A1]" />
                      <span>Tele-Consultation (Video)</span>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#16A6A1] hover:bg-[#118480] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Confirm Consultation Booking</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          9. PATIENT TESTIMONIALS
      ────────────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-20 bg-white border-y border-[#E1EDF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="px-3 py-1 rounded-md bg-[#DDF3EE] text-[#0C685B] text-xs font-semibold uppercase tracking-wider">
              Patient Voices
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-heading tracking-tight mt-3">
              Trusted by Thousands of Families
            </h2>
            <p className="text-sm text-[#475A6C] mt-2">
              Real recovery stories from individuals who experienced care at MediCore Hospital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The cardiac team diagnosed my acute blockage within 15 minutes of entering the ER. Dr. Rajesh Sharma and the cath lab team saved my life. Their kindness was extraordinary.",
                author: "Sunil Singhania",
                city: "Jaipur, Rajasthan",
                treatment: "Emergency Angioplasty",
                rating: 5
              },
              {
                quote: "Underwent robotic knee replacement with Dr. Vikram Singh. I was walking pain-free within 48 hours. The private rooms felt like a 5-star healing sanctuary with attentive nurses.",
                author: "Meenakshi Sharma",
                city: "Kota, Rajasthan",
                treatment: "Robotic Joint Replacement",
                rating: 5
              },
              {
                quote: "Best pediatric and neonatal care for our newborn daughter in their NICU. Dr. Neha Gupta and her team explained every monitor reading with immense warmth and patience.",
                author: "Dr. Arvind & Neha Mathur",
                city: "Ajmer, Rajasthan",
                treatment: "Level-3 NICU Care",
                rating: 5
              }
            ].map(test => (
              <div
                key={test.author}
                className="bg-[#F5FAFC] rounded-3xl p-7 border border-[#E1EDF5] shadow-card hover:shadow-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#263746] italic leading-relaxed">
                    "{test.quote}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E1EDF5] flex items-center justify-between">
                  <div>
                    <h5 className="font-heading font-bold text-sm text-[#123B5D]">{test.author}</h5>
                    <p className="text-[11px] text-[#657B8F]">{test.city}</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#DDF3EE] text-[#0C685B]">
                    {test.treatment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          10. EMERGENCY CONTACT INFORMATION
      ────────────────────────────────────────────────────────── */}
      <section className="py-14 bg-gradient-to-r from-[#123B5D] via-[#0C273E] to-[#123B5D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> 24/7 Level-1 Trauma Centre
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                In a Medical Emergency? We Are Ready.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Advanced life support (ACLS) ambulances with GPS tracking, onboard emergency physicians, and zero-delay triage protocol.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="tel:18002009999"
                className="px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg flex items-center gap-3 transition-transform hover:scale-105"
              >
                <PhoneCall className="w-5 h-5 animate-pulse" />
                <span>Call Emergency: 1800-200-9999</span>
              </a>
              <a
                href="tel:01412378900"
                className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 flex items-center gap-3 transition-all"
              >
                <Ambulance className="w-5 h-5 text-[#35C2BD]" />
                <span>Ambulance: +91 141 237 8900</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          11. CONTACT DETAILS & INTERACTIVE LEAFLET MAP
      ────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 bg-[#F5FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="px-3 py-1 rounded-md bg-[#DDF3EE] text-[#0C685B] text-xs font-semibold uppercase tracking-wider">
              Location & Access
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-heading tracking-tight mt-3">
              Reach MediCore Hospital
            </h2>
            <p className="text-sm text-[#475A6C] mt-2">
              Centrally located on MI Road, Jaipur. Easily accessible from Jaipur Railway Station and the Airport.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-[#E1EDF5] shadow-card space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#DDF3EE] text-[#16A6A1] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-sm text-[#123B5D]">Hospital Address</h5>
                    <p className="text-xs text-[#475A6C] mt-1">
                      12 MI Road, Ashok Nagar, Jaipur, Rajasthan 302001
                    </p>
                    <span className="text-[11px] text-[#657B8F] mt-0.5 block">GPS: 26.9124° N, 75.7873° E</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-3 border-t border-[#F5FAFC]">
                  <div className="w-10 h-10 rounded-xl bg-[#DDF3EE] text-[#16A6A1] flex items-center justify-center flex-shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-sm text-[#123B5D]">Direct Helplines</h5>
                    <p className="text-xs text-[#475A6C] mt-1">
                      Emergency: <strong>1800-200-9999</strong> (Toll Free)
                    </p>
                    <p className="text-xs text-[#475A6C]">
                      OPD Appointments: +91 141 237 8900
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-3 border-t border-[#F5FAFC]">
                  <div className="w-10 h-10 rounded-xl bg-[#DDF3EE] text-[#16A6A1] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-sm text-[#123B5D]">Email & Inquiries</h5>
                    <p className="text-xs text-[#475A6C] mt-1">care@medicorehospital.in</p>
                    <p className="text-xs text-[#475A6C]">appointments@medicorehospital.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-3 border-t border-[#F5FAFC]">
                  <div className="w-10 h-10 rounded-xl bg-[#DDF3EE] text-[#16A6A1] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-sm text-[#123B5D]">Visiting Hours</h5>
                    <p className="text-xs text-[#475A6C] mt-1">Morning: 10:00 AM – 12:00 PM</p>
                    <p className="text-xs text-[#475A6C]">Evening: 05:00 PM – 07:00 PM</p>
                    <p className="text-[11px] text-[#16A6A1] font-semibold mt-0.5">Emergency: Open 24/7, 365 Days</p>
                  </div>
                </div>
              </div>

              {/* Portal Quick Access Box */}
              <div className="bg-[#123B5D] text-white p-6 rounded-3xl shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-heading font-bold text-sm text-white">Staff & Patient Portal</h5>
                    <p className="text-xs text-slate-300 mt-0.5">Access EHR records, lab reports, and doctor schedules.</p>
                  </div>
                  <Link
                    to={user ? "/dashboard" : "/login"}
                    className="px-3.5 py-2 rounded-xl bg-[#16A6A1] text-white text-xs font-semibold hover:bg-[#118480] transition-colors"
                  >
                    {user ? "Dashboard" : "Sign In"}
                  </Link>
                </div>
              </div>
            </div>

            {/* Interactive Leaflet OpenStreetMap */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-3 border border-[#E1EDF5] shadow-card h-[450px]">
              <div className="w-full h-full rounded-2xl overflow-hidden relative">
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
                        <span className="text-[11px] text-[#16A6A1] font-semibold block mt-1">24/7 Emergency & Inpatient</span>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          12. PROFESSIONAL FOOTER
      ────────────────────────────────────────────────────────── */}
      <footer className="bg-[#123B5D] text-white pt-16 pb-8 border-t border-[#0C273E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-700/60">
            {/* Column 1: Hospital Identity */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#16A6A1] text-white flex items-center justify-center font-bold text-lg shadow-md">
                  M+
                </div>
                <div>
                  <span className="text-xl font-extrabold text-white font-heading tracking-tight block">
                    MediCore Hospital
                  </span>
                  <span className="text-[10px] font-medium text-[#DDF3EE] tracking-widest uppercase block">
                    Tertiary Healthcare & Research
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                MediCore Hospital is a premier NABH and NABL accredited multi-speciality tertiary institution committed to evidence-based medical treatment, patient safety, and compassionate clinical care.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-[#35C2BD] font-semibold border border-slate-700">
                  NABH Accredited
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-[#35C2BD] font-semibold border border-slate-700">
                  NABL Certified Lab
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-[#35C2BD] font-semibold border border-slate-700">
                  ISO 9001:2015
                </span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h5 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4">
                Quick Links
              </h5>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><a href="#about" className="hover:text-[#35C2BD] transition-colors">About Hospital</a></li>
                <li><a href="#departments" className="hover:text-[#35C2BD] transition-colors">Speciality Centres</a></li>
                <li><a href="#doctors" className="hover:text-[#35C2BD] transition-colors">Find a Doctor</a></li>
                <li><a href="#facilities" className="hover:text-[#35C2BD] transition-colors">Medical Technology</a></li>
                <li><a href="#appointment-booking" className="hover:text-[#35C2BD] transition-colors">Book Appointment</a></li>
                <li><Link to="/map" className="hover:text-[#35C2BD] transition-colors">Patient GPS Catchment</Link></li>
              </ul>
            </div>

            {/* Column 3: Clinical Specialities */}
            <div>
              <h5 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4">
                Specialities
              </h5>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><a href="#doctors" className="hover:text-[#35C2BD] transition-colors">Interventional Cardiology</a></li>
                <li><a href="#doctors" className="hover:text-[#35C2BD] transition-colors">Neurology & Stroke</a></li>
                <li><a href="#doctors" className="hover:text-[#35C2BD] transition-colors">Robotic Joint Surgery</a></li>
                <li><a href="#doctors" className="hover:text-[#35C2BD] transition-colors">Neonatal & Pediatric ICU</a></li>
                <li><a href="#doctors" className="hover:text-[#35C2BD] transition-colors">Medical Oncology</a></li>
                <li><a href="#doctors" className="hover:text-[#35C2BD] transition-colors">Emergency & Trauma</a></li>
              </ul>
            </div>

            {/* Column 4: Hospital Portal & Compliance */}
            <div>
              <h5 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4">
                Portal & Systems
              </h5>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link to="/login" className="hover:text-[#35C2BD] transition-colors">Doctor & Staff Login</Link></li>
                <li><Link to="/login" className="hover:text-[#35C2BD] transition-colors">Patient EHR Access</Link></li>
                <li><Link to="/lab-tools/query-explorer" className="hover:text-[#35C2BD] transition-colors">Database Query Explorer</Link></li>
                <li><Link to="/lab-tools/rule-tests" className="hover:text-[#35C2BD] transition-colors">Constraint Rule Lab</Link></li>
                <li className="pt-2 text-[11px] text-slate-400">Database: MySQL 8 (Raw SQL)</li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              © 2026 MediCore Hospital & Medical Research Centre. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span>Patient Privacy Policy</span>
              <span>Terms of Care</span>
              <span>Bio-Medical Waste Reports</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
