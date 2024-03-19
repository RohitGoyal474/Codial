import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { Account } from "../models/Account.model.js";
import mongoose from "mongoose";


const balance= asyncHandler(async (req, res) => {
     const account = await Account.findOne({
       userId: req.user?._id,
     });
     if(!account) {
       throw new ApiError(404, "Account not found");
     }
     res.json({
       balance: account.balance,
     });
});

const transfer = asyncHandler(async (req, res) => {
   const session = await mongoose.startSession();

   session.startTransaction();
   const { amount, to } = req.body;

   // Fetch the accounts within the transaction
   const account = await Account.findOne({ userId: req.user?._id }).session(
     session
   );

   if (!account || account.balance < amount) {
     await session.abortTransaction();
     return res.status(400).json({
       message: "Insufficient balance",
     });
   }

   const toAccount = await Account.findOne({ userId: to }).session(session);

   if (!toAccount) {
     await session.abortTransaction();
     return res.status(400).json({
       message: "Invalid account",
     });
   }

   // Perform the transfer
   await Account.updateOne(
     { userId: req.user?._id },
     { $inc: { balance: -amount } }
   ).session(session);
   await Account.updateOne(
     { userId: to },
     { $inc: { balance: amount } }
   ).session(session);

   // Commit the transaction
   await session.commitTransaction();
   res.json({
     message: "Transfer successful",
   });
});

export{
  balance,
  transfer
}