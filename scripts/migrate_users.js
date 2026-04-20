// To run this script: 
// node scripts/migrate_users.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Determine database URI
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is missing from environment variables.");
  process.exit(1);
}

// Basic User Schema representation
const userSchema = new mongoose.Schema({
  registrationLimit: Number,
  unlimitedRegistrations: Boolean,
  totalTokensRedeemed: Number
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function migrate() {
  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(uri);
    console.log("Connected successfully.\n");

    console.log("Starting migration for User limits...");

    // Find users missing the fields or having null values
    const result = await User.updateMany(
      {
        $or: [
          { registrationLimit: { $exists: false } },
          { unlimitedRegistrations: { $exists: false } },
          { totalTokensRedeemed: { $exists: false } }
        ]
      },
      {
        $set: {
          registrationLimit: 1,
          unlimitedRegistrations: false,
          totalTokensRedeemed: 0
        }
      }
    );

    console.log(`Migration Complete!`);
    console.log(`Updated ${result.modifiedCount} users to default registration settings.`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

migrate();
