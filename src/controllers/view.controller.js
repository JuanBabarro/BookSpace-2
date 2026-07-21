const path = require('path');

// Helper para obtener la ruta absoluta a la carpeta public/html
const getHtmlPath = (filename) => {
    return path.join(__dirname, '..', '..', 'public', 'html', filename);
};

const renderLogin = (req, res) => {
    res.sendFile(getHtmlPath('index.html'));
};

const renderRegister = (req, res) => {
    res.sendFile(getHtmlPath('register.html'));
};

const renderHome = (req, res) => {
    res.sendFile(getHtmlPath('home.html'));
};

const renderMyList = (req, res) => {
    res.sendFile(getHtmlPath('mylist.html'));
};

const renderProfile = (req, res) => {
    res.sendFile(getHtmlPath('perfil.html'));
};

const logout = (req, res) => {
    res.redirect('/login');
};

module.exports = {
    renderLogin,
    renderRegister,
    renderHome,
    renderMyList,
    renderProfile,
    logout
};
