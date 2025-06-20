const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;

    // Check if authorization header exists and starts with "Bearer"
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];  // Extract the token

        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        try {
            // Verify the token using the secret key
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;  // Attach the decoded user info to the request object
            console.log("The decoded user is:", req.user);

            next();  // Proceed to the next middleware or route handler
        } catch (error) {
            // Handle invalid token errors
            return res.status(401).json({ error: "Invalid token" });
        }
    } else {
        // No authorization header found
        return res.status(401).json({ message: "Authorization header missing or invalid" });
    }
};

module.exports = verifyToken;