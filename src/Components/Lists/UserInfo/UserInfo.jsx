import React,{useState,useEffect} from 'react'
import './UserInfo.css'
import { useUserStore } from '../../../Libary/userStore'
import { getAuth,} from 'firebase/auth';
import upload from '../../../Libary/Upload';
const UserInfo = () => {
  const auth = getAuth();
  const { currentUser, updateUser } = useUserStore();
  const [onlineStatus, setOnlineStatus] = useState(currentUser.online);
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState(currentUser.username);
  const [newAvatar, setNewAvatar] = useState(currentUser.avatar);
  const [originalUsername, setOriginalUsername] = useState('');
  const [originalAvatar, setOriginalAvatar] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Store the original username and avatar when editing starts
  useEffect(() => {
    if (editingProfile) {
      setOriginalUsername(currentUser.username);
      setOriginalAvatar(currentUser.avatar);
    }
  }, [editingProfile, currentUser]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown); // Toggle dropdown visibility
  };

  const toggleOnlineStatus = async () => {
    if (!currentUser || !currentUser.uid) {
      console.error('User data is incomplete:', currentUser);
      return;
    }

    const newStatus = !currentUser.online; // Toggle the current status
    await updateUser(currentUser.uid, { online: newStatus }); // Update status in Firestore
    setOnlineStatus(newStatus); // Update local online status
  };

  const handleEditProfile = () => {
    setEditingProfile(!editingProfile);
  };

  // Define the function to upload image to storage
  const uploadImageToStorage = async (imageFile) => {
    try {
      if (!imageFile) {
        throw new Error('Image file is not provided.');
      }

      // Upload the image file to storage using the upload function
      const imageUrl = await upload(imageFile);

      return imageUrl;
    } catch (error) {
      console.error('Error uploading image to storage:', error);
      throw error;
    }
  };

  const handleSaveProfile = async () => {
    try {
      let imageUrl = newAvatar; // Use the current avatar URL by default

      // If a new image file is selected, upload it to storage
      if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile);
      }

      // Update user's profile with new username and avatar URL
      await updateUser(currentUser.uid, { username: newUsername, avatar: imageUrl });
      setEditingProfile(false);
    } catch (error) {
      // Handle error if image upload fails
      console.error('Error saving profile:', error);
    }
  };

  const handleCancelEdit = () => {
    // Reset profile data to original values
    setNewUsername(originalUsername);
    setNewAvatar(originalAvatar);
    setImageFile(null); // Reset the image file
    setEditingProfile(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 300;
        const maxHeight = 300;
        let width = img.width;
        let height = img.height;

        // Resize the image if it exceeds maximum dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions and draw the resized image
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert the canvas content to a Blob
        canvas.toBlob((blob) => {
          // Create a new File object from the Blob
          const resizedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
          // Set the new avatar URL and image file state
          setNewAvatar(URL.createObjectURL(resizedFile));
          setImageFile(resizedFile); // Update image file state with the new file
        }, 'image/jpeg', 1);
      };
    };
  };

  return (
    <div className='userinfo'>
      <div className='user'>
        <label htmlFor='avatarInput'>
          <img src={newAvatar || './avatar.png'} alt='' />
        </label>
        {/* Hidden file input triggered by clicking on the avatar */}
        <input
          id='avatarInput'
          type='file'
          accept='image/*'
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        {editingProfile ? (
          <>
            <input
              type='text'
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </>
        ) : (
          <h2>{currentUser.username}</h2>
        )}
      </div>
      <div className='icons'>
        <div className='dropdown-container'>
          <img src='./more.png' alt='' onClick={toggleDropdown} />{' '}
          {/* Add onClick handler */}
          {showDropdown && (
            <div className='dropdown'>
              <button className='logout' onClick={() => auth.signOut()}>
                Logout
              </button>
            </div>
          )}
        </div>
        {!editingProfile && (
          <img src='./edit.png' alt='' onClick={handleEditProfile} />
        )}
        {editingProfile && (
  <div className='edit-buttons'>
    {/* Dropdown for save and cancel buttons */}
    <div className='dropdown'>
      <button onClick={handleSaveProfile}>Save</button>
      <button onClick={handleCancelEdit}>Cancel</button>
    </div>
  </div>
)}
        <button
          style={{ cursor: 'pointer' }}
          className={onlineStatus ? 'online' : 'offline'}
          onClick={toggleOnlineStatus}
        >
          {currentUser.online ? 'Offline' : 'Online'}
        </button>
      </div>
    </div>
  );
};

export default UserInfo;