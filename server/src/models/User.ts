import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    
    // 🔴 NEW: The Geospatial Location Field
    location: {
      type: {
        type: String,
        enum: ['Point'], 
        default: 'Point'
      },
      coordinates: {
        type: [Number], // STRICTLY [longitude, latitude]
        default: [75.7849, 23.1815] // Defaulting to your testing area coordinates!
      }
    }
  },
  { timestamps: true },
);

// 🔴 NEW: The Engine! Tell MongoDB to index this field for 5km $near searches
userSchema.index({ location: "2dsphere" });

// ✅ NEW/CORRECT WAY (20 LPA Standard)
userSchema.pre("save", async function () {
  // If password isn't changed, just return (no next needed)
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);