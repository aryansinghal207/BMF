import React from 'react';
import BookingHistory from './BookingHistory';

const ProfilePage = ({ token }) => {
  return (
    <div className="profile-page">
      <h1>Profile Page</h1>
      <p>Welcome to your profile!</p>
      <BookingHistory token={token} />
    </div>
  );
};

export default ProfilePage;
