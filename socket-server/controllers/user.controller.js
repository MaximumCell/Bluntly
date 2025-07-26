import User from '../models/user.model.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, {
            password: 0, // Exclude password if it exists
            clerkId: 0,  // Exclude sensitive clerk data
        }).sort({ createdAt: -1 });

        // Transform users to match the expected format in mobile app
        const transformedUsers = users.map(user => ({
            id: user._id.toString(),
            username: user.username,
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email,
            avatar: user.profilePicture || 'https://via.placeholder.com/150?text=User',
            bio: user.bio || '',
            verified: false, // You can add verified field to your user schema if needed
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));

        res.status(200).json(transformedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            message: 'Error fetching users',
            error: error.message 
        });
    }
};

export const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        
        const user = await User.findOne({ username }, {
            password: 0,
            clerkId: 0,
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const transformedUser = {
            id: user._id.toString(),
            username: user.username,
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email,
            avatar: user.profilePicture || 'https://via.placeholder.com/150?text=User',
            bio: user.bio || '',
            verified: false,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        res.status(200).json(transformedUser);
    } catch (error) {
        console.error('Error fetching user by username:', error);
        res.status(500).json({ 
            message: 'Error fetching user',
            error: error.message 
        });
    }
};
