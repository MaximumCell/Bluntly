import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      {
        password: 0, // Exclude password if it exists
        clerkId: 0, // Exclude sensitive clerk data
      }
    ).sort({ createdAt: -1 });

    // Transform users to match the expected format in mobile app
    const transformedUsers = users.map((user) => ({
      _id: user._id.toString(),
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      profilePicture: user.profilePicture || "",
      bannerImage: user.bannerImage || "",
      bio: user.bio || "",
      location: user.location || "",
      followers: user.followers || [],
      following: user.following || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.status(200).json(transformedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};

export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne(
      { username },
      {
        password: 0,
        clerkId: 0,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transformedUser = {
      _id: user._id.toString(),
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      profilePicture: user.profilePicture || "",
      bannerImage: user.bannerImage || "",
      bio: user.bio || "",
      location: user.location || "",
      followers: user.followers || [],
      following: user.following || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json(transformedUser);
  } catch (error) {
    console.error("Error fetching user by username:", error);
    res.status(500).json({
      message: "Error fetching user",
      error: error.message,
    });
  }
};
