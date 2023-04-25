import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    unique: false,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: [true, "Email already exists"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    unique: false,
  },
  nickname: {
    type: String,
    required: [true, "Please provide a nickname"],
    unique: [true, "Nickname already exists"],
  },
  about: {
    type: String,
    required: [false, "Please provide a description"],
    unique: false,
  },
  employment: {
    type: String,
    required: [false, "Please provide your employment"],
    unique: false,
  },
  hometown: {
    type: String,
    required: [false, "Please provide your hometown"],
    unique: false,
  },
  webbpage: {
    type: String,
    required: [false, "Please provide your webbpage"],
    unique: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },

  tweets: [
    {
      tweet: {
        type: String,
        required: false,
        unique: false,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      likes: [
        {
          user: {
            type: String,
            required: false,
            unique: false,
          },
        },
      ],
    },
  ],
  followers: [
    {
      follower: {
        type: String,
        required: false,
        unique: false,
      },
    },
  ],
  following: [
    {
      following: {
        type: String,
        required: false,
        unique: false,
      },
    },
  ],
  hashtags: [
    {
      hashtag: {
        type: String,
        required: false,
        unique: false,
      },
      numberOfTimes: {
        type: Number,
        required: false,
        unique: false,
      },
    },
  ],
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
