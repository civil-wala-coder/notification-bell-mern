import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket'] });

    socket.on('notification', (notification) => {
      console.log('Notification:', notification);
      setNotifications((prevNotifications) => [notification, ...prevNotifications]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Notifications</h1>
      {notifications.map((notification, index) => (
        <div key={index}>
          <p>{JSON.stringify(notification)}</p>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
