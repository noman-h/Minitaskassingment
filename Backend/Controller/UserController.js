const users=require('../Models/UserModel')
const jwt=require('jsonwebtoken')

exports.singup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!(name && email && password)) {
      return res.status(400).json({ message: "all keys are required" });
    }

    const existinguser = await users.findOne({ email });
    if (existinguser) {
      return res.status(409).json({ message: "user already exist" });
    }


    const data = { name, email,password};
    const result = await users.create(data);

    return res.status(201).json({ message: "singup successfully" });
  } catch (err) {
    console.log(err);
    
    res.status(500).json({ message: "internal server error", err });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).json({ message: "all keys are required" });
    }

    const result = await users.findOne({ email });
    if (!result) {
      return res.status(404).json({ message: "user not found" });
    }

    const match =(password===result.password)
    if (!match) {
      return res.status(400).json({ message: "login failed" });
    }

    const secretkey=process.env.Secret_key
    console.log("result",result);
    
    const token=jwt.sign({email:result.email,_id:result._id},secretkey,{expiresIn:"1d"})
    
    return res.status(200).json({ message: "login successfully",result,token});
  } catch (err) {
    console.log(err);
    
    res.status(500).json({ message: "internal server error", err });
  }
};