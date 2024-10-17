const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/LoginTut")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });

// Schema for User Data (volunteer/intern)
const FormSchema = new mongoose.Schema({
    photo: String,
    role: { type: String, enum: ['volunteer', 'intern'], required: true },
    name: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    dob: { type: Date, required: true },
    age: { type: Number, required: true },
    marital_status: { type: String, enum: ['unmarried', 'married'], required: true },
    occupation: String,
    designation: String,
    address: { type: String, required: true },
    passport: String,
    arrival: Date,
    contact_residence: String,
    contact_office: String,
    mobile: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    education: { type: String, required: true },
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
    }
});

// Correctly name the model as User (instead of Collection1)
const User = mongoose.model("User", FormSchema);

// Schema for Activities
const ActivitySchema = new mongoose.Schema({
    user: { type: String, required: true },  // Reference by user's email
    description: { type: String, required: true },
    media: { type: String },  // Optional for media files
    date: { type: Date, default: Date.now },
    hours: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

// Create a model for activities
const Activity = mongoose.model("Activity", ActivitySchema);

//notice schema
const NoticeSchema = new mongoose.Schema({
  notice: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});
const Notice = mongoose.model('Notice', NoticeSchema);

//notice schema
const ImageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Create image model for the image database
const Image = mongoose.model('Image', ImageSchema);


// Export the models
module.exports = {
    User,     // Export User model (previously Collection1)
    Activity,
    Notice,
    Image  // Export Activity model
};
