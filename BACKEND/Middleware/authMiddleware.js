
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Token manquant ou format incorrect"
            });
        }

        const token = authHeader.split(" ")[1];
      console.log("Authentification : vérification du token");

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        console.error("Erreur JWT :", error.name, error.message);

        return res.status(401).json({
            message: "Token invalide ou expiré"
        });
    }
};

module.exports = verifyToken;
