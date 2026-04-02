const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { createSession, deleteSession, deleteAllUserSessions } = require('../utils/session');
const { isAuthenticated } = require('../middleware/auth');

router.post('/register', async (req, res) => {
	try{
		const {username, email, password} = req.body;

		// we require all fields for registration
		if(!username || !email || !password){
			return res.status(400).json({
				success: false,
				message: 'Provide username, email and password.'
			});
		}

		//we also check if a user already exists or not. such that only one email can be registered in our system.
		const existingUser = await User.findOne({ email }).select('_id').lean(); //we minimize the data by selecting only the id and also use lean to save time.
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: 'Email has already neen registered.'
			});
		}

		//we are creating a new user
		const user = new User({username,  email, password});
		await user.save();

		//send a success response 
		res.status(201).json({
			success: true,
			message: 'User registered successfully',
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				role: user.role
			}
		})
	} catch (error){
		//handleing errors
		//first we need to handle validation error
		if (error.name === 'ValidationError') {
	      const messages = Object.values(error.errors).map(err => err.message);
	      return res.status(400).json({
	        success: false,
	        message: messages.join(', ')
	      });
	    }

	    //handle duplicate key error
	    //handling race condition
	    if (error.code === 11000) {
	      return res.status(400).json({
	        success: false,
	        message: 'Email already registered'
	      });
	    }

	    // Server error
	    console.error('Registration error:', error);
	    res.status(500).json({
	      success: false,
	      message: 'Registration failed'
	    });
	}
})

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // we require email and password for signin
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Provide email and password.'
      });
    }

    // find user by email (no .lean() — we need comparePassword method)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // verify password using schema method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // create session (stores role, username, email in session.data)
    const { sessionId, expiresAt } = await createSession(user);

    // set cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt
    });

    // send success response
    res.json({
      success: true,
      message: 'Signed in successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Signin failed'
    });
  }
});

router.post('/signout', isAuthenticated, async (req, res) => {
  try {
    await deleteSession(req.cookies.sessionId);
    res.clearCookie('sessionId');

    res.json({
      success: true,
      message: 'Signed out successfully'
    });

  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({
      success: false,
      message: 'Signout failed'
    });
  }
});

router.get('/me', isAuthenticated, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.userId,
      username: req.session.data.username,
      email: req.session.data.email,
      role: req.session.data.role
    }
  });
});

module.exports = router;
