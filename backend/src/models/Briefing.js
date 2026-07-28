import mongoose from 'mongoose';

const { Schema } = mongoose;

const briefingSchema = new Schema(
  {
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      required: true,
    },
    text: { type: String, required: true },
    generatedBy: { type: String, default: 'gemma-4' },
    basedOnReportIds: [{ type: Schema.Types.ObjectId, ref: 'Report' }],
    confidence: { type: Number, min: 0, max: 1, default: 0.5 },
    generatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

briefingSchema.index({ incidentId: 1, generatedAt: -1 });

const Briefing = mongoose.model('Briefing', briefingSchema);

export default Briefing;
