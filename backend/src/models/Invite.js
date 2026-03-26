import mongoose from 'mongoose';

const InviteSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  labourId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The labourer user
  labourProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Labour' }, // Optional link to specific profile
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Invite', InviteSchema);
