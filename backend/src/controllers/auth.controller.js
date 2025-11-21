export const signup = (req, res) => {
  req.json({ message: "User registered successfully" });
};

export const login = (req, res) => {
  req.json({ message: "login successfully" });
};

export const logout = (req, res) => {
  req.json({ message: "logout successfully" });
};
