import mongoose from 'mongoose';

const { Schema } = mongoose;

const mediaAssetSchema = new Schema(
  {
    url: { type: String, required: true },
    mimeType: { type: String, default: '' },
    provider: { type: String, default: 'cloudinary' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const understandingSchema = new Schema(
  {
    model: { type: String, default: 'gemma-4' },
    modelVersion: { type: String, default: 'gemma-4' },
    detectedLanguage: { type: String, default: 'en' }, // ISO 639-1, detected by Gemma
    englishSummary: { type: String, default: '' },     // Gemma's English-normalized summary
    category: { type: String, default: '' },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    confidence: { type: Number, min: 0, max: 1, default: 0.5 },
    summary: { type: String, default: '' },            // summary in original language
    tags: [{ type: String }],
    affectedInfrastructure: [{ type: String }],
    affectedServices: [{ type: String }],
    recommendedResponse: { type: String, default: '' },
    rawOutput: { type: Object, default: {} },
    generatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const pipelineSchema = new Schema(
  {
    startedAt: { type: Date, default: null },
    analyzedAt: { type: Date, default: null },
    matchedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const reportSchema = new Schema(
  {
    sourceType: {
      type: String,
      enum: ['whatsapp', 'facebook', 'x', 'phone', 'officer', 'other'],
      required: true,
    },
    reporterType: {
      type: String,
      enum: ['citizen', 'field_officer', 'organization', 'volunteer', 'other'],
      default: 'citizen',
    },
    // ── Raw input from citizen ────────────────────────────────────────────
    description: { type: String, default: '' },  // kept for backward compat
    input: {
      text: { type: String, default: '' },        // original text as submitted
      language: { type: String, default: 'en' },  // user-declared or detected
      modality: {
        type: String,
        enum: ['text', 'voice', 'image', 'multimodal'],
        default: 'text',
      },
    },
    language: { type: String, default: 'en' },    // kept for backward compat
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
    timestamp: { type: Date, required: true },
    mediaAssets: [mediaAssetSchema],
    understanding: understandingSchema,
    pipeline: pipelineSchema,
    status: {
      type: String,
      enum: ['submitted', 'analyzing', 'matching', 'merged', 'completed', 'rejected'],
      default: 'submitted',
    },
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

reportSchema.index({ status: 1, timestamp: -1 });
reportSchema.index({ incidentId: 1 });
reportSchema.index({ 'location.coordinates': '2dsphere' });

const Report = mongoose.model('Report', reportSchema);

export default Report;
