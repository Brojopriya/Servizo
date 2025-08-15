import React, { useState, useEffect, Profiler } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import dp from './download.png'
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
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false); 
  const [isCustomerDetailsVisible, setIsCustomerDetailsVisible] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState(''); 

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('http://localhost:8000/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {setMessage(response.data.message);
          setLastLogin(response.data.last_login);
    })
        .catch(() => setMessage('Access denied. Please log in.'));

      axios
        .get('http://localhost:8000/api/customer-details', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setCustomerDetails(response.data))
        .catch((error) => console.error('Error fetching customer details:', error));

      axios
        .get('http://localhost:8000/api/cities')
        .then((response) => setCities(response.data))
        .catch((error) => console.error('Error fetching cities:', error));

      axios
        .get('http://localhost:8000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setBookings(response.data))
        .catch((error) => console.error('Error fetching bookings:', error));
    } else {
      navigate('/login');
    }
  }, [navigate]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('http://localhost:8000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setBookings(response.data))
        .catch((error) => console.error('Error fetching bookings:', error));
    } else {
      navigate('/login');
    }
  }, [navigate]);
  useEffect(() => {
    if (selectedArea) {
    
      axios
        .get(`http://localhost:8000/api/best-technician/${selectedArea}`)
        
        .then((response) => setBestTechnician(response.data))
        .catch((error) => console.error('Error fetching best technician:', error));
    }
  }, [selectedArea]);
  
  useEffect(() => {
    if (selectedCity) {
      axios
        .get(`http://localhost:8000/api/areas/${selectedCity}`)
        .then((response) => setAreas(response.data))
        .catch((error) => console.error('Error fetching areas:', error));
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedArea) {
      axios
        .get(`http://localhost:8000/api/technicians/${selectedArea}`)
        .then((response) => setTechnicians(response.data.technicians))
        .catch((error) => console.error('Error fetching technicians:', error));
    }
  }, [selectedArea]);

  const handleTechnicianChange = (e) => {
    const technicianId = e.target.value;
    console.log(technicianId)
    setSelectedTechnician(technicianId);
    if (technicianId) {
      axios
        .get(`http://localhost:8000/api/technician-details/${technicianId}`)
        .then((response) => {
          setTechnicianDetails(response.data);
        })
        .catch((error) => {
          console.error('Error fetching technician details:', error);
          setTechnicianDetails({
            profile_picture: '',
            experience_years: 0,
            rating: 0,
            reviews_count: 0,
            booking_count: 0,
          });
        });
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (selectedTechnician && bookingDate) {
      axios
        .post(
          'http://localhost:8000/api/bookings',
          { technician_id: selectedTechnician, booking_date: bookingDate, status },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          setBookings([...bookings, response.data]);
          alert("Booking successful!");
          setConfirmationMessage('Booking successful!'); 
          setTimeout(() => {
            setConfirmationMessage();  
          }, 3000);
        })
        .catch((error) => {
          setErrorMessage('Error creating booking. Please try again.');
          console.error(error);
        });
    } else {
      setErrorMessage('Please select a technician and a date.');
    }
  };
  const toggleReviewForm = (booking_id) => {
    setSelectedBookingId(booking_id === selectedBookingId ? null : booking_id);
    setErrorMessage('');
    setConfirmationMessage('');
  };
  const handleReviewSubmit = (booking_id) => {
    const token = localStorage.getItem('token');
    if (rating && review) {
      // console.log('Submitting Review:');
      // console.log('Booking ID:', booking_id);
      // console.log('Token:', token);
      // console.log(status);
      // console.log('Rating:', rating);
      // console.log('Review:', review);
      axios
        .put(
          `http://localhost:8000/api/bookings/${booking_id}`,
          { status: 'Completed', rating, review },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          setBookings(
            bookings.map((booking) =>
              booking.booking_id === booking_id
                ? { ...booking, status: 'Completed', rating, review }
                : booking
            )
          );
          setConfirmationMessage(response.data.message);
          setRating('');
          setReview('');
          setSelectedBookingId(null); 
        })
        .catch((error) => {
          setErrorMessage('Error updating booking. Please try again.');
          console.error(error);
        });
    } else {
      setErrorMessage('Please provide a rating and review.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .delete('http://localhost:8000/delete-account', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setMessage('Account deleted successfully. Redirecting to signup...');
          localStorage.removeItem('token');
          setTimeout(() => {
            navigate('/signup');
          }, 5000);
        })
        .catch(() => {
          setMessage('Error deleting account.');
        });
    }
  };

  const handleCustomerUpdate = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    axios
      .put('http://localhost:8000/api/customer-details', customerDetails, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setMessage('Customer details updated successfully!');
        setErrorMessage('');
        setIsUpdatingInfo(false);
        
      })
      .catch((error) => {
        setErrorMessage('Error updating details. Please try again.');
        console.error(error);
      });
  };

  const toggleCustomerDetails = () => {
    setIsCustomerDetailsVisible(!isCustomerDetailsVisible); 
  };

  return (
    <div className="dashboard-container">
      {/* LEFT PANEL */}
      <div className="left-panel">
        <h2>Find & Book Technician</h2>
        <form onSubmit={handleBookingSubmit}>
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city.city_id} value={city.city_id}>{city.city_name}</option>
            ))}
          </select>
  
          <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
            <option value="">Select Area</option>
            {areas.map((area) => (
              <option key={area.zipcode} value={area.zipcode}>{area.area}</option>
            ))}
          </select>
  
          <select value={selectedTechnician} onChange={handleTechnicianChange}>
            <option value="">Select Technician</option>
            {technicians.map((tech) => (
              <option key={tech.user_id} value={tech.user_id}>
                {tech.user_name} - {tech.services}
              </option>
            ))}
          </select>
  
          <div className="technician-details">
            <h4>Technician Details</h4>
            <img
              src={technicianDetails.profile_picture ? 
                `http://localhost:8000/uploads/${technicianDetails.profile_picture}` : dp} 
              alt="Technician"
            />
            <p>Experience: {technicianDetails.experience_years} years</p>
            <p>Rating: {technicianDetails.rating}</p>
            <p>Reviews: {technicianDetails.reviews_count}</p>
            <p>Bookings: {technicianDetails.booking_count}</p>
          </div>
  
          <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
          <button type="submit">Book Technician</button>
        </form>
  
        <h3>Your Bookings</h3>
        <ul>
          {bookings.map((booking) => (
            <li key={booking.booking_id}>
              {booking.technician_name} - {booking.booking_date} - {booking.status}
            </li>
          ))}
        </ul>
      </div>
  
      {/* RIGHT PANEL */}
      <div className="right-panel">
        <div className="user-info">
          <h2>Your Details</h2>
          <p><strong>Name:</strong> {customerDetails.user_name}</p>
          <p><strong>Phone:</strong> {customerDetails.phone_number}</p>
          <p><strong>Email:</strong> {customerDetails.email}</p>
  
          <h3>Best Technician of Last Month</h3>
          {bestTechnician ? (
            <div>
              <p>Name: {bestTechnician.user_name}</p>
              <p>Experience: {bestTechnician.experienced_year} years</p>
              <p>Rating: {bestTechnician.avg_rating}</p>
              <p>Total Bookings: {bestTechnician.total_bookings}</p>
            </div>
          ) : <p>Select your area first.</p>}
  
          <h3>Last Login</h3>
          <p>{lastLogin ? new Date(lastLogin).toLocaleString() : 'Loading...'}</p>
        </div>
  
        {/* Bottom Buttons */}
        <div className="right-bottom-buttons">
          <button onClick={handleDeleteAccount}>Delete Account</button>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={() => navigate('/update-profile')}>Update Info</button>
        </div>
      </div>
    </div>
  );
  

};


export default Dashboard;
