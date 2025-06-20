const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role:"user" });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
    } 
    catch (error) {
        res.status(500).json({ error: error.message });
    }

};

exports.login = async (req, res) => {
    
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(404).json({ error: "Invalid email or password" });
        }
        const token = jwt.sign({ 
            userId: user._id, 
            role: user.role 
        }, process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select("-password"); // exclude password

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, email, password } = req.body;

        const updatedData = {};
        if (name) updatedData.name = name;
        if (email) updatedData.email = email;
        if (password) updatedData.password = await bcrypt.hash(password, 10);

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updatedData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.deleteUser = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.putFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { countryId } = req.body;

        if (!countryId) {
            return res.status(400).json({ error: "countryId is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.favorites.includes(countryId)) {
            user.favorites.push(countryId);
            await user.save();
            return res.status(200).json({ message: "Country added to favorites" });
        } else {
            return res.status(400).json({ message: "Country already in favorites" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select("favorites");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { countryId } = req.body;

        if (!countryId) {
            return res.status(400).json({ error: "countryId is required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const index = user.favorites.indexOf(countryId);
        if (index === -1) {
            return res.status(404).json({ error: "Country not in favorites" });
        }

        user.favorites.splice(index, 1);
        await user.save();

        res.status(200).json({ message: "Country removed from favorites" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
