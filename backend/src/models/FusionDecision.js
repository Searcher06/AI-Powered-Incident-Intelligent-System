import mongoose from 'mongoose';

const { Schema } = mongoose;

const fusionDecisionSchema = new Schema(
  {
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
      required: true,
    },
    decisionType: {
      type: String,
      enum: ['create_new_incident', 'merge_with_existing', 'no_change'],
      required: true,
    },
    candidateIncidentIds: [{ type: Schema.Types.ObjectId, ref: 'Incident' }],
    selectedIncidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      default: null,
    },
    confidence: { type: Number, min: 0, max: 1, default: 0.5 },
    reasoning: { type: String, default: '' },
    evidence: [{ type: String }],
    processingTimeMs: { type: Number, default: 0 },
    modelVersion: { type: String, default: 'gemma-4' },
    shouldRegenerateBriefing: { type: Boolean, default: false },
    shouldCreateTimelineEvent: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

fusionDecisionSchema.index({ reportId: 1 });
fusionDecisionSchema.index({ selectedIncidentId: 1 });
fusionDecisionSchema.index({ decisionType: 1, createdAt: -1 });

const FusionDecision = mongoose.model('FusionDecision', fusionDecisionSchema);

export default FusionDecision;
