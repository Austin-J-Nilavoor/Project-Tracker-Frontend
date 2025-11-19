import React from 'react';

// Import avatar images from assets
// Ensure these files exist in your src/assets folder
import avatar1 from '../assets/avatars/avatar_1.png';
import avatar2 from '../assets/avatars/avatar_2.png';
import avatar3 from '../assets/avatars/avatar_3.png';
import avatar4 from '../assets/avatars/avatar_4.png';


const AVATARS = [avatar1, avatar2, avatar3, avatar4];

const UserAvatar = ({ name, id }) => {
    // Use ID for consistent mapping, fallback to name or 'U' if missing
    const seed = id ? id.toString() : (name || 'User');
    
    // Simple hash logic: sum of char codes or just first char
    // Using first char code is simple and consistent with your previous logic
    const charCode = seed.charCodeAt(0) || 0;
    const avatarIndex = charCode % AVATARS.length;

    const selectedAvatar = AVATARS[avatarIndex];

    return (
        <img 
            src={selectedAvatar} 
            alt={name || "User"} 
            className="user-avatar small"
            style={{ objectFit: 'cover' }} // Ensures image fills the circle without distortion
            title={name}
        />
    );
};

export default UserAvatar;