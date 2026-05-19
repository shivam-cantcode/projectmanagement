import mongoose, { Schema } from "mongoose";

const notesSchema = Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const Notes = mongoose.model("Notes", notesSchema);
