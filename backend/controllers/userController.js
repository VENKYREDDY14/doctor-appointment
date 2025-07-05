import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary' 
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import nodemailer from 'nodemailer'


const generateOtp=()=>{
    return Math.floor(10000+Math.random()*900000);
}

const sendOtpEmail=async(email,otp,name)=>{
    const transporter=nodemailer.createTransport({service:"Gmail",
        auth:{
            user:'venkyreddy2031@gmail.com',
            pass:'xlrl lhxl xusg pkxz'
        }
    });
    const mailOptions={
        from:'venkyreddy2031@gmail.com',
        to:email,
        subject:"Your OTP code",
        text:`Hi ${name} ! ! Greetings from the prescripto,here is your otp code is:${otp}`
    };
    await transporter.sendMail(mailOptions);
}

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
      const user = await userModel.findOne({ email });
  
      if (!user) {
        return res.json({ success: false, message: 'Invalid  email' });
      }
  
      if (user.otp !== parseInt(otp) || user.otpExpiresAt < Date.now()) {
        return res.json({ success: false, message: "Invalid or expired OTP" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      
      user.isVerified = true;
user.otp = null;
user.otpExpiresAt = null;
      await user.save();
  
      res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

const sendOtpForReset = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await userModel.findOne({ email });
  
      if (!user) return res.json({ success: false, message: 'User not found' });
  
      const otp = generateOtp();
     
      user.otp = otp;
      user.otpExpiresAt = Date.now() + 5 * 60 * 1000;
      await user.save();
  
      await sendOtpEmail(email, otp, user.name);
      res.json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
const validateUser=async(req,res)=>{
    const {otp,email}=req.body;
   
    const storedOtp=await userModel.find({email})

    if(storedOtp.length===0){
        return res.json({success:false,message:"Invalid Otp"})
    }

    if(storedOtp[0].otp===parseInt(otp) && storedOtp[0].otpExpiresAt > Date.now()){
        storedOtp[0].isVerified = true;
        storedOtp[0].otp = null;
        storedOtp[0].otpExpiresAt = null;

        await storedOtp[0].save();
      
        res.json({success:true,message:"Otp verified successfully"})

}

    else{
        res.json({success:false,message:"Invalid or expired OTP"})  
    }}


// API to register user

const registerUser=async(req,res)=>{
    try{
        const {name,email,password}=req.body;

        if(!name || !email || !password){
            return res.json({success:false,message:"Missing Details"})
        }

        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Enter a valid Email"})
        }

    
        if(password.length<8){
            return res.json({success:false,message:"Enter a strong password"})
        }

        const otp = generateOtp();
    
        await sendOtpEmail(email, otp, name);
  
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

        const userData={
            name,
            email,
            password:hashedPassword,
            otp,
            otpExpiresAt : Date.now() + 5 * 60 * 1000
        }
        const newUser=new userModel(userData)
        const user=await newUser.save()

        
        res.json({ success: true, message: "OTP sent to your email. Please verify." });
        
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// API for user login

const loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user=await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"User does not exist"})
        }
        if (!user.isVerified) {
            return res.json({ success: false, message: "Please verify your email first." });
          }
        const isMatch=await bcrypt.compare(password,user.password)

        if(isMatch){
            const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
            res.json({success:true,token})
        }else{
            res.json({success:false,message:"Invalid credentials"})
        }
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// API to get user profile data

const getProfile=async(req,res)=>{
    try{
        const {userId}=req.body;
        const userData=await userModel.findById(userId).select('-password')

        res.json({success:true,userData})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// API to update user profile

const updateProfile=async(req,res)=>{
    try{
        const {userId,name,phone,address,dob,gender}=req.body
        const imageFile=req.file

        if(!name || !phone || !address || !dob || !gender){
            return res.json({success:false,message:"Data Missing"})
        }
        await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})

        if(imageFile){
            const imageUpload=await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageUrl=imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId,{image:imageUrl})
        }
        res.json({success:true,message:"Profile Updated"})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// API to book appointment

const bookAppointment=async (req,res)=>{
    console.log(req.body)
    try{
        const {userId,docId,slotDate,slotTime}=req.body;

        const docData=await doctorModel.findById(docId).select('-password')

        if(!docData.available){
            return res. json({success:false,message:"Doctor not available"})
        }

        let slots_booked=docData.slots_booked

        if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
                return res.json({success:false,message:"Slot not available"})
            }else{
                slots_booked[slotDate].push(slotTime)
            }
        }
        else{
            slots_booked[slotDate]=[]
            slots_booked[slotDate].push(slotTime)
        }

        const userData=await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const appointmentData={
            userId,
            docId,
            userData,
            docData,
            amount:docData.fees,
            slotTime,
            slotDate,
            date:Date.now()
        }

        const newAppointment=new appointmentModel(appointmentData)
        await newAppointment.save()

        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success:true,message:"Appointment Booked"})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// API to get user appointments

const listAppointment=async(req,res)=>{
    try{
        const {userId}=req.body;
        const appointments=await appointmentModel.find({userId})

        res.json({success:true,appointments})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// API to cancel appointment

const cancelAppointment=async(req,res)=>{
    try{
        const {userId,appointmentId}=req.body;

        const appointmentData=await appointmentModel.findById(appointmentId)

        if(userId!==appointmentData.userId){
            return res.json({success:false,message:"Unauthorized action"})
        }
        await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})

        // releasing doctors Slot

        const {docId,slotDate,slotTime}=appointmentData
        const doctorData=await doctorModel.findById(docId)

        let slots_booked=doctorData.slots_booked
        slots_booked[slotDate]=slots_booked[slotDate].filter(e=>e!==slotTime)
        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success:true,message:"Appointment Cancelled"})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}




export {registerUser,loginUser,getProfile,updateProfile,bookAppointment,listAppointment,cancelAppointment,validateUser,sendOtpForReset,resetPassword}