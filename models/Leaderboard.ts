import { Schema, model, models } from 'mongoose';

const LeaderboardSchema = new Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Leaderboard = models.Leaderboard || model('Leaderboard', LeaderboardSchema);

export default Leaderboard;
