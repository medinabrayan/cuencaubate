// Cambiar contraseña
function changePassword() {
    const auth = checkAuth();
    const currentPass = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    // Validaciones
    if (!auth.verify(currentPass)) {
        document.getElementById('currentPasswordError').style.display = 'block';
        return;
    }
    if (newPass.length < 6) {
        document.getElementById('newPasswordError').style.display = 'block';
        return;
    }
    if (newPass !== confirmPass) {
        document.getElementById('confirmPasswordError').style.display = 'block';
        return;
    }

    // Actualizar contraseña
    auth.updatePassword(newPass);
    document.getElementById('changePasswordSuccess').style.display = 'block';
    setTimeout(() => document.getElementById('passwordModal').style.display = 'none', 1500);
}