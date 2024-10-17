const express = require("express");
const path = require("path");
const hbs = require("hbs");
const multer = require("multer");
const bodyParser = require('body-parser');
const session = require('express-session');
const { User, Activity, Notice, Image } = require('./mongodb'); // Import correct models
const mongoose = require('mongoose'); // Ensure you have Mongoose connected

const app = express();

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set secure to true if you're using HTTPS
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up template engine and static files
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, '../templates'));
app.use(express.static('public'));

const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// File Upload Middleware (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Ensure the correct relative path
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Authentication Middleware
function isAuthenticated(req, res, next) {
    console.log("Session before checking authentication:", req.session);
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Login Route
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Simple hardcoded login logic (replace with actual database query)
    if (email === "gargimittal@gmail.com" && password === "1234") {
        // Store user information in session
        req.session.user = { name: "Gargi Mittal", email: "gargimittal@gmail.com" };
        res.redirect("/volunteerDash");
    }
    else if(email==="garret@gmail.com" && password==="9876"){
        req.session.user = { name: "Garret Fernendez", email: "garret@gmail.com" };
        res.redirect("/staffDash");
    }
    else if(email==="anant@gmail.com" && password==="a123"){
        req.session.user = { name: "Anant Mishra", email: "anant@gmail.com" };
        res.redirect("/parents");
    }
    else {
        res.send("Invalid username or password");
    }
});

// Volunteer Dashboard
app.get("/volunteerDash", isAuthenticated, (req, res) => {
    const username = req.session.user.name;
    res.render("volunteerDash", { username });
});

app.get("/staffDash", isAuthenticated,(req, res) => {
    const username = req.session.user.name;
    res.render("staffDash", { username });
  });

app.get("/parents", isAuthenticated,(req, res) => {
    const username = req.session.user.name;
    res.render("parents" , { username });  
  });
  

// My Activities Route
app.get("/my-activities", isAuthenticated, async (req, res) => {
    try {
        const activities = await Activity.find({ user: req.session.user.email });
        res.render("vol-management", { activities });
    } catch (err) {
        res.status(500).send("Error fetching activities: " + err.message);
    }
});

// Add Activity Route
app.post("/add-activity", isAuthenticated, upload.single('media'), async (req, res) => {
    try {
        const newActivity = new Activity({
            user: req.session.user.email,
            description: req.body.description,
            media: req.file ? req.file.path : null,
            hours: req.body.hours
        });

        await newActivity.save();
        res.json({
            description: newActivity.description,
            hours: newActivity.hours,
            media: req.file ? req.file.filename : null, // Send only the filename for client-side display
            date: newActivity.date.toLocaleString() 
        });

    } catch (err) {
        res.status(500).send("Error adding activity: " + err.message);
    }
});

// Delete Activity Route (DELETE request)
app.delete("/delete-activity/:id", isAuthenticated, async (req, res) => {
    try {
        const deletedActivity = await Activity.findByIdAndDelete(req.params.id);

        if (!deletedActivity) {
            return res.status(404).json({ message: "Activity not found" });
        }

        res.json({ message: "Activity deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting activity: " + err.message });
    }
});

// Logout Route
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

app.get("/add-notice", (req, res) => {
    res.render('add-notice');
  });

  app.post('/add-notice', async (req, res) => {
    try {
      const newNotice = new Notice({
        notice: req.body.notice
      });
  
      await newNotice.save();  // Save the notice to the database
      res.redirect('/add-notice');
    } catch (err) {
      console.error('Error saving notice:', err);
      res.status(500).send('Error saving notice');
    }
  });

  app.get('/add-image', (req, res) => {
    res.render('add-image');
  });
  
  // Handle image upload (POST request)
  app.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
      const newImage = new Image({
        filename: req.file.filename,
        description: req.body.description
      });
  
      await newImage.save();  // Save the image to the database
      res.redirect('/add-image');
    } catch (err) {
      console.error('Error uploading image:', err);
      res.status(500).send('Error saving image');
    }
  });

  app.get('/view-notice', (req, res) => {
    res.render('view-notice');
  });

  app.get('/view-image', (req, res) => {
    res.render('view-image');
  });

  app.get('/view-notice', async (req, res) => {
    try {
      // Fetch all notices from the database
      const notices = await Notice.find({});
      console.log('Fetched Notices:', notices);
  
      // Render the view-notices.ejs page and pass the notices to the view
      res.render('view-notice', { notices });
    } catch (err) {
      console.error('Error fetching notices:', err);
      res.status(500).send('Error fetching notices');
    }
  });

  app.get('/view-images', async (req, res) => {
    try {
      // Fetch all images from the database
      const images = await Image.find({});
      console.log('Rendering view-images with images:', images);
  
      // Render the view-images.ejs and pass the images data to the view
      res.render('view-images', { images });
    } catch (err) {
      console.error('Error fetching images:', err);
      res.status(500).send('Error fetching images');
    }
  });

// Route to serve form1.hbs
app.get("/form1", (req, res) => {
    res.render("form1");
});

// Mongoose schema for form submission
const formSchema = new mongoose.Schema({
    photo: String,
    role: String,
    name: String,
    gender: String,
    dob: Date,
    age: Number,
    marital_status: String,
    occupation: String,
    designation: String,
    address: String,
    passport: String,
    arrival: Date,
    contact_residence: String,
    contact_office: String,
    mobile: String,
    email: String,
    education: String,
    mother_tongue: String,
    hobbies: String,
    experience: String,
    interest: String,
    know_navkshitij: String,
    motivation: String,
    duration: String,
    languages: {
        english: { speak: Boolean, write: Boolean, understand: Boolean },
        hindi: { speak: Boolean, write: Boolean, understand: Boolean },
        marathi: { speak: Boolean, write: Boolean, understand: Boolean },
        other: { speak: Boolean, write: Boolean, understand: Boolean }
    },
    signature: String,
    date_place: String
});

const Form = mongoose.model('Form', formSchema);

// Route to handle form submission
app.post("/submit-form", upload.single('photo'), async (req, res) => {
    console.log("Session after form submission:", req.session);
    try {
        const newUser = new User({
            photo: req.file ? req.file.path : null,  // Store the photo file path
            role: req.body.role,
            name: req.body.name,
            gender: req.body.gender,
            dob: req.body.dob,
            age: req.body.age,
            marital_status: req.body.marital_status,
            occupation: req.body.occupation,
            designation: req.body.designation,
            address: req.body.address,
            passport: req.body.passport,
            arrival: req.body.arrival,
            contact_residence: req.body.contact_residence,
            contact_office: req.body.contact_office,
            mobile: req.body.mobile,
            email: req.body.email,
            education: req.body.education,
            mother_tongue: req.body.mother_tongue,
            hobbies: req.body.hobbies,
            experience: req.body.experience,
            interest: req.body.interest,
            know_navkshitij: req.body.know_navkshitij,
            motivation: req.body.motivation,
            duration: req.body.duration,
            languages: {
                english: {
                    speak: req.body.english_speak === "on" ? true : false,
                    write: req.body.english_write === "on" ? true : false,
                    understand: req.body.english_understand === "on" ? true : false
                },
                hindi: {
                    speak: req.body.hindi_speak === "on" ? true : false,
                    write: req.body.hindi_write === "on" ? true : false,
                    understand: req.body.hindi_understand === "on" ? true : false
                },
                marathi: {
                    speak: req.body.marathi_speak === "on" ? true : false,
                    write: req.body.marathi_write === "on" ? true : false,
                    understand: req.body.marathi_understand === "on" ? true : false
                },
                other: {
                    speak: req.body.other_speak === "on" ? true : false,
                    write: req.body.other_write === "on" ? true : false,
                    understand: req.body.other_understand === "on" ? true : false
                }
            }
        });

        await newUser.save();
        res.redirect("/subm");
    } catch (err) {
        console.error("Error saving form data:", err.message);
        res.status(500).send("Error saving form data: " + err.message);
    }
});

app.get("/subm", (req, res) => {
    res.render("subm"); // Render subm.hbs
});

// Start the server
app.listen(3000, () => console.log("Server running on port 3000"));
