import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
    },
    senderRole: {
      type: String,
      enum: ["student", "lecturer", "admin"],
      required: true,
    },
    receiverRole: {
      type: String,
      enum: ["student", "lecturer", "admin"],
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: 3000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    parentMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ receiver: 1, isRead: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ parentMessage: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
