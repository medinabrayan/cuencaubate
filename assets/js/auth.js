// Función para verificar credenciales
function checkAuth() {
    const storedPassword = localStorage.getItem('adminPassword') || "admin123";
    return {
        verify: (password) => password === storedPassword,
        updatePassword: (newPass) => localStorage.setItem('adminPassword', newPass)
    };
}

// Verificar sesión activa
function checkSession() {
    if (!sessionStorage.getItem('adminAuth') && !localStorage.getItem('adminPassword')) {
        window.location.href = 'login.html';
    }
}