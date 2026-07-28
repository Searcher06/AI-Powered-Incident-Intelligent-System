import mongoose from 'mongoose';

const { Schema } = mongoose;

const timelineEventSchema = new Schema(
  {
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      required: true,
    },
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
      default: null,
    },
    fusionDecisionId: {
      type: Schema.Types.ObjectId,
      ref: 'FusionDecision',
      default: null,
    },
    eventType: {
      type: String,
      enum: [
        'created',
        'merged',
        'severity_changed',
        'confidence_changed',
        'status_changed',
        'briefing_updated',
      ],
      required: true,
    },
    triggeredBy: {
      type: String,
      enum: ['fusion', 'gemma', 'system', 'user'],
      default: 'system',
    },
    before: { type: Object, default: {} },
    after: { type: Object, default: {} },
    reason: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

timelineEventSchema.index({ incidentId: 1, createdAt: -1 });

const TimelineEvent = mongoose.model('TimelineEvent', timelineEventSchema);

export default TimelineEvent;
