import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import axios from "axios"

import User from "../models/auth.js"

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existinguser = await User.findOne({ email });
        
        if(existinguser){
            return res.status(400).json("User already exists.")
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const newUser = await User.create({ name, email, password: hashedPassword })
        const token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ result: newUser, token })
    } catch (error) {
        res.status(500).json("Something went wrong...")
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existinguser = await User.findOne({ email });
        
        if(!existinguser){
            return res.status(404).json("User doen't exists.")
        }

        const isPasswordCrt = await bcrypt.compare( password, existinguser.password )

        if(!isPasswordCrt) {
            return res.status(400).json("Invalid credentials")
        }

        const token = jwt.sign({ email: existinguser.email, id: existinguser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ result: existinguser, token })
    } catch (error) {
        res.status(500).json("Something went wrong...")
    }
}

export const sendOtp = async (req, res) => {
    const { name, phoneNumber } = req.body;

    const __otp  = Math.floor(100000 + Math.random() * 900000)
    const _otp = JSON.stringify(__otp)

    try {
        const existingUser = await User.findOne({ phoneNumber });

        if(!existingUser){
            const hashedOtp = await bcrypt.hash(_otp, 12)

            const newUser = await User.create({ name, phoneNumber, otp: hashedOtp })

            // Send sms to user

            const encodedParams = new URLSearchParams();
            encodedParams.append("to", '+91'+phoneNumber);
            encodedParams.append("p", process.env.SMS77IO_API_KEY);
            encodedParams.append("text", `Your login otp is ${_otp}`);

            const options = {
            method: 'POST',
            url: 'https://sms77io.p.rapidapi.com/sms',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'X-RapidAPI-Key': '2acb9a956dmsh66be44166ea64fdp1dbdcdjsn535fa7f4d1b0',
                'X-RapidAPI-Host': 'sms77io.p.rapidapi.com'
            },
            data: encodedParams
            };

            axios.request(options).then(function (response) {
                console.log(response.data);
            }).catch(function (error) {
                console.error(error);
            });

            return res.status(200).json({ newUser })
        }

        // Send sms to user

        const encodedParams = new URLSearchParams();
        encodedParams.append("to", '+91'+phoneNumber);
        encodedParams.append("p", process.env.SMS77IO_API_KEY);
        encodedParams.append("text", `Your login otp is ${_otp}`);

        const options = {
        method: 'POST',
        url: 'https://sms77io.p.rapidapi.com/sms',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': '2acb9a956dmsh66be44166ea64fdp1dbdcdjsn535fa7f4d1b0',
            'X-RapidAPI-Host': 'sms77io.p.rapidapi.com'
        },
        data: encodedParams
        };

        axios.request(options).then(function (response) {
            console.log(response.data);
        }).catch(function (error) {
            console.error(error);
        });
 

        // Update User model with otp

        const hashedOtp = await bcrypt.hash(_otp, 12)

        await User.updateOne({ phoneNumber: phoneNumber}, { otp: hashedOtp }, {name: name} )

        res.status(200).json({ result: existingUser })

    } catch (error) {
        res.status(404).json("User not found!")
    }
}

export const verifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;
    try {
        const existinguser = await User.findOne({ phoneNumber });
        
        if(!existinguser){
            return res.status(404).json("User doen't exists.")
        }

        const isOtpCorrect = await bcrypt.compare( otp, existinguser.otp )

        if(!isOtpCorrect) {
            return res.status(400).json("Invalid credentials")
        }

        const token = jwt.sign({ id: existinguser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ result: existinguser, token })
    } catch (error) {
        res.status(404).json("User not found!")
    }
}

// export const sendOtpEmail = async (req, res) => {
//     const { email } = req.body;

//     const __otp  = Math.floor(100000 + Math.random() * 900000)
//     const _otp = JSON.stringify(__otp)

//     try {
//         const existingUser = await User.findOne({ email });
//         if(!existingUser){
//             return res.status(404).json("User doesn't exists.")
//         }

//         // Send an email to user

//         const transporter = nodemailer.createTransport({
//             service:"gmail",
//             auth:{
//                 user:process.env.MAIL,
//                 pass:process.env.PASSWORD
//             }
//         });

//         const mailOtions = {
//             from: process.env.MAIL,
//             to: email,
//             subject: "OTP",
//             html: `<h1>Successfully sent email otp: ${_otp}</h1>`
//         }

//         transporter.sendMail(mailOtions,(error,info)=>{
//             if(error){
//                 console.log("Error",error)
//             }
//             else{
//                 console.log("Email sent" + info.response);
//                 res.status(200).json({status:200,info})
//             }
//         })

//         // Update User model with otp

//         const hashedOtp = await bcrypt.hash(_otp, 12)
        
//         await User.updateOne({ email: email }, { otp: hashedOtp })

//         res.status(200).json({ result: existingUser })
        
//     } catch (error) {
//         res.status(404).json("User not found!")
//     }
// }



// export const verifyOtpEmail = async (req, res) => {
//     const { email, otp } = req.body;
//     try {
//         const existinguser = await User.findOne({ email });
        
//         if(!existinguser){
//             return res.status(404).json("User doen't exists.")
//         }

//         const isOtpCorrect = await bcrypt.compare( otp, existinguser.otp )

//         if(!isOtpCorrect) {
//             return res.status(400).json("Invalid credentials")
//         }

//         const token = jwt.sign({ email: existinguser.email, id: existinguser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         res.status(200).json({ result: existinguser, token })
//     } catch (error) {
//         res.status(404).json("User not found!")
//     }
// }