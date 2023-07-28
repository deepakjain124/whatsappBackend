let mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      default: null,
      required: true,
    },
    userImage: { type: String, default: null },
    status: { type: String, default: null },
    userMobile: { type: Number, default: null, required: true },
    password: { type: String, required: true, default: null },
    blockList:{type:Array,required:false,default:null}
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
const user = new mongoose.model("user", userSchema);
module.exports = user;
