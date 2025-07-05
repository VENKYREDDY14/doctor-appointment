import express from 'express'
import { registerUser,loginUser,getProfile,updateProfile,bookAppointment,listAppointment,cancelAppointment,validateUser,sendOtpForReset,resetPassword } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';


const userRouter=express.Router()

userRouter.post('/register',registerUser);
userRouter.post('/verify-otp',validateUser);
userRouter.post('/send-otp',sendOtpForReset);
userRouter.post('/reset-password',resetPassword);
userRouter.post('/login',loginUser);
userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile)
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/appointments',authUser,listAppointment)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)


export default userRouter