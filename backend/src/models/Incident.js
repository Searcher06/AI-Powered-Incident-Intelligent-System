import mongoose from 'mongoose';

const { Schema } = mongoose;

const incidentSchema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, default: '' },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    confidence: { type: Number, min: 0, max: 1, default: 0.5 },
    status: {
      type: String,
      enum: ['active', 'critical', 'resolved', 'archived'],
      default: 'active',
    },
    summary: { type: String, default: '' },
    recommendedResponse: { type: String, default: '' },
    reportCount: { type: Number, default: 1, min: 1 },
    location: {
      text: { type: String, default: '' },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
    },
    latestBriefingId: {
      type: Schema.Types.ObjectId,
      ref: 'Briefing',
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

incidentSchema.index({ status: 1, severity: 1 });
incidentSchema.index({ updatedAt: -1 });
incidentSchema.index({ 'location.coordinates': '2dsphere' });

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;
