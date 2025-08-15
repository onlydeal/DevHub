// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import axios from 'axios';

// interface FormData {
//   name: string;
//   skills: string;
//   bio: string;
// }

// const ProfileWizard: React.FC = () => {
//   const { register, handleSubmit } = useForm<FormData>();
//   const [step, setStep] = useState(1);

//   const onSubmit = async (data: FormData) => {
//     if (step < 3) {
//       setStep(step + 1);
//       return;
//     }
//     try {
//       await axios.put('/api/auth/profile', data, { // Assuming backend endpoint for profile update
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
//       {step === 1 && <input {...register('name')} placeholder="Name" className="w-full border p-2 mb-4 rounded" />}
//       {step === 2 && <input {...register('skills')} placeholder="Skills (comma-separated)" className="w-full border p-2 mb-4 rounded" />}
//       {step === 3 && <textarea {...register('bio')} placeholder="Bio" className="w-full border p-2 mb-4 rounded h-32" />}
//       <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">{step < 3 ? 'Next' : 'Finish'}</button>
//     </form>
//   );
// };

// export default ProfileWizard;






import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { AppDispatch, RootState } from '../store';
import { addNotification } from '../slices/notificationSlice';
import { useNavigate } from 'react-router-dom';

interface FormData {
  name: string;
  skills: string;
  bio: string;
}

const ProfileWizard: React.FC = () => {
  const { register, handleSubmit } = useForm<FormData>();
  const [step, setStep] = useState(1);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const onSubmit = async (data: FormData) => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    try {
      await axios.put(
        '/api/auth/profile',
        data,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );
      dispatch(addNotification('Profile updated successfully'));
      navigate('/');
    } catch (err) {
      dispatch(addNotification('Failed to update profile'));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Profile Setup - Step {step}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === 1 && (
          <input
            {...register('name')}
            placeholder="Name"
            defaultValue={user?.name}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        {step === 2 && (
          <input
            {...register('skills')}
            placeholder="Skills (comma-separated)"
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        {step === 3 && (
          <textarea
            {...register('bio')}
            placeholder="Bio"
            className="w-full border p-2 rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          {step < 3 ? 'Next' : 'Finish'}
        </button>
      </form>
    </div>
  );
};

export default ProfileWizard;