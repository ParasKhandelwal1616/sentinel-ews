import mongoose from "mongoose";

const IncidentSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  severity: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    default: "Pending",
  },
});

IncidentSchema.index({ location: "2dsphere" });

export default mongoose.model("Incident", IncidentSchema);
