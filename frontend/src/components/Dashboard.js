import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import dp from './download.png';

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); 
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Dashboard = () => {
  const [message, setMessage] = useState('');
  const [lastLogin, setLastLogin] = useState('');
  const [bestTechnician, setBestTechnician] = useState(null);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [technicianDetails, setTechnicianDetails] = useState({
    profile_picture: '',
    experience_years: 0,
    rating: 0,
    reviews_count: 0,
    booking_count: 0,
  });
  const [bookingDate, setBookingDate] = useState(getCurrentDate());
  const [status, setStatus] = useState('Pending');
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    user_name: '',
    phone_number: '',
    email: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios.get('http://localhost:8000/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setMessage(res.data.message); setLastLogin(res.data.last_login); })
      .catch(() => setMessage('Access denied. Please log in.'));

    axios.get('http://localhost:8000/api/customer-details', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCustomerDetails(res.data))
      .catch(console.error);

    axios.get('http://localhost:8000/api/cities')
      .then(res => setCities(res.data))
      .catch(console.error);

    axios.get('http://localhost:8000/api/bookings', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBookings(res.data))
      .catch(console.error);
  }, [navigate]);

  useEffect(() => {
    if (selectedCity) {
      axios.get(`http://localhost:8000/api/areas/${selectedCity}`)
        .then(res => setAreas(res.data))
        .catch(console.error);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedArea) {
      axios.get(`http://localhost:8000/api/technicians/${selectedArea}`)
        .then(res => setTechnicians(res.data.technicians))
        .catch(console.error);

      axios.get(`http://localhost:8000/api/best-technician/${selectedArea}`)
        .then(res => setBestTechnician(res.data))
        .catch(console.error);
    }
  }, [selectedArea]);

  const handleTechnicianChange = (e) => {
    const technicianId = e.target.value;
    setSelectedTechnician(technicianId);
    if (!technicianId) return setTechnicianDetails({ profile_picture: '', experience_years: 0, rating: 0, reviews_count: 0, booking_count: 0 });

    axios.get(`http://localhost:8000/api/technician-details/${technicianId}`)
      .then(res => setTechnicianDetails(res.data))
      .catch(console.error);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!selectedTechnician || !bookingDate) return setErrorMessage('Select a technician and date');

    axios.post('http://localhost:8000/api/bookings',
      { technician_id: selectedTechnician, booking_date: bookingDate, status },
      { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBookings([...bookings, res.data]))
      .catch(console.error);
  };

  const toggleReviewForm = (booking_id) => {
    setSelectedBookingId(booking_id === selectedBookingId ? null : booking_id);
    setErrorMessage('');
  };

  const handleReviewSubmit = (booking_id) => {
    const token = localStorage.getItem('token');
    if (!rating || !review) return setErrorMessage('Provide rating and review');

    axios.put(`http://localhost:8000/api/bookings/${booking_id}`,
      { status: 'Completed', rating, review },
      { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setBookings(bookings.map(b => b.booking_id === booking_id ? { ...b, status: 'Completed', rating, review } : b));
        setRating(''); setReview(''); setSelectedBookingId(null);
      })
      .catch(console.error);
  };

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };
  const handleDeleteAccount = () => { localStorage.removeItem('token'); navigate('/signup'); };
  const handleUpdateProfile = () => { navigate('/update-profile'); };

  return (
    <div className="dashboard-container">

      {/* Top-right buttons */}
      <div className="top-right-buttons">
        <button onClick={handleDeleteAccount} className="btn delete">Delete</button>
        <button onClick={handleUpdateProfile} className="btn update">Update</button>
        <button onClick={handleLogout} className="btn logout">Logout</button>
      </div>

      {/* 3-column layout */}
      <div className="three-panels">

        {/* LEFT: User info */}
        <div className="left-panel">
          <h2>User Info</h2>
          <p><strong>Name:</strong> {customerDetails.user_name}</p>
          <p><strong>Phone:</strong> {customerDetails.phone_number}</p>
          <p><strong>Email:</strong> {customerDetails.email}</p>

          <h3>Best Technician</h3>
          {bestTechnician ? (
            <div className="best-tech-card">
              <p><strong>{bestTechnician.user_name}</strong></p>
              <p>Experience: {bestTechnician.experienced_year} yrs</p>
              <p>Rating: {bestTechnician.avg_rating}</p>
              <p>Bookings: {bestTechnician.total_bookings}</p>
            </div>
          ) : <p>Select area first</p>}

          <h3>Last Login</h3>
          <p>{lastLogin ? new Date(lastLogin).toLocaleString() : 'Loading...'}</p>
        </div>

        {/* MIDDLE: Booking form */}
        <div className="middle-panel">
          <h2>Book a Technician</h2>
          <form onSubmit={handleBookingSubmit}>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
              <option value="">Select City</option>
              {cities.map(city => <option key={city.city_id} value={city.city_id}>{city.city_name}</option>)}
            </select>

            <select value={selectedArea} onChange={e => setSelectedArea(e.target.value)}>
              <option value="">Select Area</option>
              {areas.map(area => <option key={area.zipcode} value={area.zipcode}>{area.area}</option>)}
            </select>

            <select value={selectedTechnician} onChange={handleTechnicianChange}>
              <option value="">Select Technician</option>
              {technicians.map(t => <option key={t.user_id} value={t.user_id}>{t.user_name} - {t.services}</option>)}
            </select>

            <div className="technician-card">
              <img src={technicianDetails.profile_picture ? `http://localhost:8000/uploads/${technicianDetails.profile_picture}` : dp} alt="Tech" />
              <p>Experience: {technicianDetails.experience_years} yrs</p>
              <p>Rating: {technicianDetails.rating}</p>
              <p>Reviews: {technicianDetails.reviews_count}</p>
            </div>

            <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
            <button type="submit" className="btn submit">Book Now</button>
          </form>
        </div>

        {/* RIGHT: Your bookings */}
        <div className="right-panel">
          <h2>Your Bookings</h2>
          <div className="bookings-list">
            {bookings.map(booking => (
              <div key={booking.booking_id} className="booking-card">
                <p>
                  <strong>{booking.technician_name}</strong> <br /> 
                  {booking.booking_date} <br />
                  <span className={`status ${booking.status?.toLowerCase() ?? "unknown"}`}>
                    {booking.status ?? booking.technician_name}
                  </span>
                </p>



                {booking.status === "Completed" && !booking.review ? (
                  selectedBookingId === booking.booking_id ? (
                    <div className="review-form">
                      <div className="star-rating">{[1,2,3,4,5].map(s => (
                        <span key={s} className={s <= rating ? "star filled" : "star"} onClick={() => setRating(s)}>★</span>
                      ))}</div>
                      <textarea value={review} onChange={e=>setReview(e.target.value)} placeholder="Write review..."/>
                      <div className="review-actions">
                        <button className="btn submit" onClick={()=>handleReviewSubmit(booking.booking_id)}>Submit</button>
                        <button className="btn cancel" onClick={()=>toggleReviewForm(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : <button className="btn review-btn" onClick={()=>toggleReviewForm(booking.booking_id)}>✨ Review</button>
                ) : booking.review && <p className="review-display">“{booking.review}” ⭐{booking.rating}</p>}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
