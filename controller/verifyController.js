//Post_login
const { User } = require("../models/User.js");
const { Wallet } = require("../models/Wallet.js");
const { Transaction } = require("../models/Transaction.js");
const { io } = require("../server.js");
const utils = require("../utils/index.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { Notification } = require("../models/Notification.js");

// dotenv.config()
// import { v4 as uuidv4 } from 'uuid';

// const users = {};
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const Post_signUp = async (req, res) =>{
    try {
      // const userId = uuidv4();
      // const otp = process.env.OTP
      // Math.floor(1000 + Math.random() * 9000).toString();
      const { firstname, lastname, email, phoneNumber, password } = req.body;
       
      // users[userId] = { email, otp };
      // const mailOptions = {
      //   from: 'Peter <polalekan526@gmail.com>',
      //   to: email,
      //   subject: 'Verify your account',
      //   text: `Your OTP is: ${otp}. Please use this OTP to verify your account.`
      // };
    
      // utils.transporter.sendMail(mailOptions, (error, info) => {
      //   if (error) {
      //     console.error('Error sending OTP:', error);
      //     return res.status(500).json({ error: 'Failed to send OTP' });
      //   } 

      //     console.log('OTP sent:', info.response);
      //     console.log(userId)
      //     // return res.json({ userId, otp });          
      // });
        const formattedPhoneNumber = utils.convertPhoneToISO(phoneNumber);
        if (!formattedPhoneNumber) {
          return res.status(400).json({ error: 'Invalid phone number format' });
      }
        const hashedPassword = await bcrypt.hash(password, 10); 
        const newAccountNumber = utils.generateAccountNumber();
        const user = new User({
            firstname,
            lastname,
            email,
            phoneNumber: formattedPhoneNumber,
            password: hashedPassword,
            accountBalance: 0,
            status:false,
            kycLevel: 1,
            transactionPin: 0, 
            bvn:0,
            accountNumber:0
        });
 
        const wallet = new Wallet({ 
            user: user._id,
            accountNumber: newAccountNumber, 
        });
        const check =  await User.findOne({email:email})
        const checkAccNum = await Wallet.findOne({accountNumber: newAccountNumber,})
       

        if (check){
            return res.status(401).json({error:"This email already exist"})
        }
      
        if(checkAccNum){
            generateAccountNumber();
        }
        else{
            await user.save();   
            await wallet.save();
        }
        res.status(201).json({ message: 'Account successfully Created', user});
      
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while creating the account' });
    }
}

const Post_login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        
        if (!user) {
           return res.status(404).json({ error: ' User not found' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const userID = user._id;
        if(!user.status){
          return res.status(401).json({ user: userID});
        }

          // say.speak('Hello, Welcome to Banko!', 'Samantha', 0.3)
          // say.stop()

        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour
        res.status(200).json({ success: 'Exist', token, message: 'User logged In Succesfully', user });
        console.log()

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while logging in' });
    }
};

const verifyOTP = async(req, res) =>{
  try {
    const { userId, otp } = req.body
    const userID = await User.findById(userId);

    if (!userID) {
      return res.status(404).json({ error: 'User not found' });
    }
    if(otp !== process.env.OTP){
        return res.status(401).json({error: "Invalid OTP"})
    }
    await User.findByIdAndUpdate(userID, { status: true });
    res.json({  message:"Account verified, please proceed to log in" });
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

}

const Get_user = async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
      console.log(user)
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

const UpdateTransPin = async (req, res) => { 
    try {
        const { pin } = req.body;
        const hashedPin = await bcrypt.hash(pin, 10);

       
        await User.findByIdAndUpdate(req.user.userId, { transactionPin: hashedPin });

        // Emit a Socket.IO event to notify connected clients about the pin update
        io.emit('transactionPinUpdated', { userId: req.user.userId });

        res.status(200).json({ message: 'Transaction pin updated successfully' });
    } catch (error) {
        console.error('Failed to update transaction pin:', error);
        res.status(500).json({ error: 'Failed to update transaction pin' });
    }
}

   
const UpdateKyc = async (req, res) => { 
        try {
            const { bvn } = req.body;
            const hashedPin = await bcrypt.hash(bvn, 10);
            const user = await User.findById(req.user.userId);
            
            
            const allUsers = await User.find();

                  // Loop through all users and compare their encrypted BVNs with the BVN provided by the user
                  let bvnMatch = false;
                  for (const user of allUsers) {
                      const encryptedBVN = user.bvn;
                      const match = await bcrypt.compare(bvn, encryptedBVN);
                      if (match) {
                          bvnMatch = true;
                          break; // Exit the loop if a match is found
                      }
                  } 
    
            if(user.bvn !== "0"){
             return  res.status(401).json({ error: 'KYC already Updated' });
            }
            if (bvnMatch) {
              // If the provided BVN matches the encrypted BVN of an existing user
              return res.status(400).json({ error: 'BVN already exists' });
          }
            if (user.bvn == "0") {  
              await User.findByIdAndUpdate(req.user.userId, { kycLevel: 2 , bvn: hashedPin})
              res.status(200).json({ message: 'KYC Level Upgraded successfully' });
            }

        } catch (error) {
            console.error('Failed to update transaction pin:', error);
            res.status(500).json({ error: 'Failed to update transaction pin' });
        }
    }

const GetBalance = async (req, res) => {
        try {
          const wallet = await Wallet.findOne({ user: req.user.userId });
          if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
          }
          res.json({ balance: wallet.balance });
        } catch (error) {
          res.status(500).json({ error: 'Internal server error' });
        }
     
}
    
const Check_transfer = async(req, res) =>{
    try {
      const { recipientAccountNumber, amount } = req.body;
      // Find sender's wallet
      if(recipientAccountNumber.length === 0){
        return res.status(400).json({ error: 'Recipient account number needed' });
      }
      if(recipientAccountNumber.length < 10){
        return res.status(400).json({ error: 'Invalid account number' });
      }

      const senderWallet = await Wallet.findOne({ user: req.user.userId });
      if (!senderWallet || senderWallet.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
     
      if (amount < 50) {
        return res.status(400).json({ error: 'Minimum amount to transfer is 50' });
      }
      if(senderWallet.accountNumber == recipientAccountNumber){
        return res.status(400).json({ error: `${recipientAccountNumber} is your Banko account number, you can only transfer to other accounts` });
      }
  
      // Find recipient's wallet by account number
      const recipientWallet = await Wallet.findOne({ accountNumber: recipientAccountNumber });
      if (!recipientWallet) {
        return res.status(404).json({ error: 'Recipient wallet not found' });
      }

      const recipientId = recipientWallet.user
      const recipientData = await User.findOne({_id:recipientId})
      res.json({ mes: 'success', user: recipientData });
      
    } catch (error) {
      console.error('Failed to transfer funds:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

const Post_transfer = async(req, res) =>{
    try {
      const { recipientAccountNumber, amount, transPin } = req.body;
  
      // Find sender's wallet
      if(recipientAccountNumber.length === 0){
        return res.status(400).json({ error: 'Recipient account number needed' });
      }
      if(recipientAccountNumber.length < 10){
        return res.status(400).json({ error: 'Invalid account number' });
      }
      const senderWallet = await Wallet.findOne({ user: req.user.userId });
      if (!senderWallet || senderWallet.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      const recipientWallet = await Wallet.findOne({ accountNumber: recipientAccountNumber });
      if (!recipientWallet) {
        return res.status(404).json({ error: 'Recipient wallet not found' });
      }
     
  
      if (amount < 50) {
        return res.status(400).json({ error: 'Minimum amount transferable is 50' });
      }
        const userTransPin = await User.findById( req.user.userId);
       
    if (userTransPin.accountNumber === "0") {
      await User.findByIdAndUpdate(req.user.userId, { accountNumber: senderWallet.accountNumber });
    }

    // Update recipient's account number if it is 0
    const recipientUser = await User.findById(recipientWallet.user);
    if (recipientUser.accountNumber === "0") {
      await User.findByIdAndUpdate(recipientWallet.user, { accountNumber: recipientWallet.accountNumber });
    }
            if (!userTransPin) {
            return res.status(404).json({ error: 'Transaction Pin not found' });
             }

            const pinMatch = await bcrypt.compare(transPin, userTransPin.transactionPin);
            if (!pinMatch) {
            return res.status(400).json({ error: 'Transaction Pin Incorrect' });
            }
         
      // Update sender's balance
      senderWallet.balance -= amount;
      await senderWallet.save();
  
      // Update recipient's balance
      recipientWallet.balance += parseInt(amount);
      await recipientWallet.save();
  
      // Create transaction record
      
      const transaction = new Transaction({ sender: senderWallet.user, recipient: recipientWallet.user, amount, status: "Successful" });
      await transaction.save();
      const notification = new Notification({
        type: 'fund_transfer',
        message: `You received $${amount} from ${senderWallet.user}`,
        recipient: recipientWallet.user,
      });
    
     
      await notification.save();
      res.json({ message: 'Funds transferred successfully' });
    } catch (error) {
      console.error('Failed to transfer funds:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  const Transfer_history = async( req, res) =>{

    try {
        const userID = req.user.userId;
        const transferHistory = await Transaction.find({
            $or: [{ sender: userID }, { recipient: userID }]
          }).populate('sender recipient');

        if (!transferHistory || transferHistory.length === 0) {
          return res.status(404).json({ error: 'No history found' });
        }
        res.json({ transferHistory });
      } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };

    const notificationInfo = async(req, res) =>{
      try{
        const userID = req.user.userId;
      }
      catch{

      }
    }

module.exports = { 
    Post_signUp,
    Post_login,
    verifyOTP,
    Get_user,
    UpdateTransPin,
    UpdateKyc,
    GetBalance,
    Check_transfer,
    Post_transfer,
    Transfer_history,
    notificationInfo
}