// src/components/ForgotPassword.jsx
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP & new password

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (step === 1) {
        const { data } = await axios.post(`${backendUrl}/api/user/send-otp`, { email });
        if (data.success) {
          toast.success('OTP sent to your email');
          setStep(2);
        } else {
          toast.error(data.message);
        }
      } else if (step === 2) {
        const { data } = await axios.post(`${backendUrl}/api/user/reset-password`, {
          email,
          otp,
          newPassword
        });
        if (data.success) {
          toast.success('Password reset successfully');
          navigate('/login');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>Reset Password</p>
        <p>Please enter your email to reset your password</p>

        <div className='w-full'>
          <p>Email</p>
          <input
            type='email'
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {step === 2 && (
          <>
            <div className='w-full'>
              <p>OTP</p>
              <input
                type='text'
                className='border border-zinc-300 rounded w-full p-2 mt-1'
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <div className='w-full'>
              <p>New Password</p>
              <input
                type='password'
                className='border border-zinc-300 rounded w-full p-2 mt-1'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>
          {step === 1 ? 'Send OTP' : 'Reset Password'}
        </button>

        <p
          onClick={() => navigate('/login')}
          className='text-primary underline cursor-pointer'
        >
          Back to Login
        </p>
      </div>
    </form>
  );
};

export default ForgotPassword;
