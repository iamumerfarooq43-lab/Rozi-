import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    // Step 1: Get the Authorization header
    // It looks like: "Bearer eyJhbGciOiJIUzI1NiJ9..."
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    // Step 2: Extract just the token part (remove "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // Step 3: Verify the token using our secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Step 4: Attach the decoded user info to the request
        // Now any controller after this middleware can access req.user
        req.user = decoded;

        // Step 5: Move on to the next middleware or controller
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.'
        });
    }
};

export default authMiddleware;