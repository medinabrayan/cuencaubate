// Sistema de autenticación mejorado
const authSystem = {
    STORAGE_KEY: 'adminAuthData',
    data: {
        password: null,
        lastChanged: null
    },
    
    init: function() {
        this.loadAuthData();
        if (!this.data.password) {
            this.data.password = "admin123";
            this.saveAuthData();
        }
    },
    
    loadAuthData: function() {
        const savedData = localStorage.getItem(this.STORAGE_KEY);
        if (savedData) this.data = JSON.parse(savedData);
    },
    
    saveAuthData: function() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    },
    
    verifyPassword: function(password) {
        return password === this.data.password;
    },
    
    changePassword: function(currentPassword, newPassword) {
        if (this.data.password && !this.verifyPassword(currentPassword)) {
            return { success: false, message: "Contraseña actual incorrecta" };
        }
        
        if (newPassword.length < 6) {
            return { success: false, message: "La contraseña debe tener al menos 6 caracteres" };
        }
        
        this.data.password = newPassword;
        this.data.lastChanged = new Date().toISOString();
        this.saveAuthData();
        return { success: true, message: "Contraseña cambiada exitosamente" };
    }
};

// Control de audio global
let currentAudio = null;

// Configuración mejorada para las hojas
const leafConfig = {
    count: 20, // Cantidad de hojas
    minSize: 80, // Tamaño mínimo en px
    maxSize: 150, // Tamaño máximo en px
    minDuration: 15, // Duración mínima de animación
    maxDuration: 30, // Duración máxima de animación
    spin: 720, // Rotación máxima
    types: [
        'assets/img/leaf1.png',
        'assets/img/leaf2.png',
        'assets/img/leaf3.png'
    ]
};

// Función mejorada para crear hojas grandes y nítidas
function createLeaves() {
    // Limpiar hojas existentes
    document.querySelectorAll('.leaf').forEach(leaf => leaf.remove());
    
    // Crear nuevas hojas
    for (let i = 0; i < leafConfig.count; i++) {
        createLeaf();
    }
    
    // Crear hojas adicionales periódicamente
    setInterval(createLeaf, 2000);
}

function createLeaf() {
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    
    // Configuración aleatoria
    const size = Math.random() * (leafConfig.maxSize - leafConfig.minSize) + leafConfig.minSize;
    const startX = Math.random() * window.innerWidth;
    const endX = (Math.random() - 0.5) * 300;
    const duration = Math.random() * (leafConfig.maxDuration - leafConfig.minDuration) + leafConfig.minDuration;
    const delay = Math.random() * 5;
    const rotation = Math.random() * leafConfig.spin * (Math.random() > 0.5 ? 1 : -1);
    const leafType = leafConfig.types[Math.floor(Math.random() * leafConfig.types.length)];
    
    // Aplicar estilos
    leaf.style.cssText = `
        left: ${startX}px;
        width: ${size}px;
        height: ${size}px;
        background-image: url('${leafType}');
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        --start-x: ${startX}px;
        --end-x: ${endX}px;
        --rotation: ${rotation}deg;
        filter: 
            hue-rotate(${Math.random() * 360}deg)
            brightness(${Math.random() * 0.3 + 0.7})
            drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
    `;
    
    document.body.appendChild(leaf);
    
    // Eliminar hoja después de la animación
    setTimeout(() => {
        if (leaf.parentNode) {
            leaf.parentNode.removeChild(leaf);
        }
    }, (duration + delay) * 1000);
}

// Galería de imágenes
function setupGallery() {
    const imagenes = document.querySelectorAll('.img-gallery');
    const imagenLight = document.querySelector('.imagen-light');
    const closeLightbox = document.querySelector('.close');
    
    imagenes.forEach(imagen => {
        imagen.addEventListener('click', () => {
            showImage(imagen.querySelector('img').getAttribute('src'),
                     imagen.querySelector('h3').textContent,
                     imagen.querySelector('p').textContent);
        });
    });
    
    closeLightbox.addEventListener('click', () => {
        imagenLight.classList.remove('show');
    });
    
    function showImage(imagen, title, description) {
        imagenLight.querySelector('.agregar-imagen').src = imagen;
        imagenLight.querySelector('.image-title').textContent = title;
        imagenLight.querySelector('.image-description').textContent = description;
        imagenLight.classList.add('show');
    }
}

// Menú hamburguesa
function setupMenu() {
    const hamburguer = document.querySelector('.hamburguer');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburguer.addEventListener('click', () => {
        navMenu.classList.toggle('spread');
    });
    
    window.addEventListener('click', e => {
        if (navMenu.classList.contains('spread') && 
            e.target != navMenu && 
            e.target != hamburguer) {
            navMenu.classList.remove('spread');
        }
    });
}

// Inicialización cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar sistemas
    authSystem.init();
    setupGallery();
    setupMenu();
    createLeaves();
    
    // Control de audio
    document.querySelectorAll('.audio-player').forEach(player => {
        const playIcon = player.querySelector('.bx-play-circle');
        const pauseIcon = player.querySelector('.bx-pause-circle');
        const audio = new Audio(player.getAttribute('data-audio'));
        
        pauseIcon.style.display = 'none';
        
        player.addEventListener('click', function() {
            // Pausar audio actual si hay otro reproduciéndose
            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
                const currentPlayIcon = currentAudio.playerElement.querySelector('.bx-play-circle');
                const currentPauseIcon = currentAudio.playerElement.querySelector('.bx-pause-circle');
                currentPlayIcon.style.display = 'inline';
                currentPauseIcon.style.display = 'none';
            }
            
            // Reproducir o pausar
            if (audio.paused) {
                audio.play();
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'inline';
                currentAudio = audio;
                audio.playerElement = player;
            } else {
                audio.pause();
                playIcon.style.display = 'inline';
                pauseIcon.style.display = 'none';
                currentAudio = null;
            }
        });
        
        audio.addEventListener('ended', function() {
            playIcon.style.display = 'inline';
            pauseIcon.style.display = 'none';
            currentAudio = null;
        });
    });
    
    // Carrusel automático
    const carouselItems = document.querySelectorAll('.carousel-item');
    let currentItem = 0;
    
    function showNextItem() {
        carouselItems[currentItem].classList.remove('active');
        currentItem = (currentItem + 1) % carouselItems.length;
        carouselItems[currentItem].classList.add('active');
    }
    
    // Iniciar carrusel
    if (carouselItems.length > 0) {
        carouselItems[0].classList.add('active');
        setInterval(showNextItem, 5000);
    }
    
    // Sistema de autenticación
    window.verifyAdmin = function() {
        const passwordInput = document.getElementById('adminPassword');
        const password = passwordInput.value;
        const errorMessage = document.getElementById('errorMessage');
        
        if (authSystem.verifyPassword(password)) {
            sessionStorage.setItem('adminAuth', 'true');
            window.location.href = 'admin/dashboard.html';
        } else {
            errorMessage.style.display = 'flex';
            passwordInput.classList.add('shake');
            setTimeout(() => passwordInput.classList.remove('shake'), 500);
        }
    };
    
    window.changePassword = function() {
        const currentPass = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;
        
        const currentError = document.getElementById('currentPasswordError');
        const newError = document.getElementById('newPasswordError');
        const confirmError = document.getElementById('confirmPasswordError');
        const successMessage = document.getElementById('changePasswordSuccess');
        
        currentError.style.display = 'none';
        newError.style.display = 'none';
        confirmError.style.display = 'none';
        successMessage.style.display = 'none';
        
        if (newPass !== confirmPass) {
            confirmError.style.display = 'flex';
            return;
        }
        
        const result = authSystem.changePassword(currentPass, newPass);
        
        if (result.success) {
            successMessage.textContent = result.message;
            successMessage.style.display = 'flex';
            setTimeout(() => {
                closeModal();
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
                successMessage.style.display = 'none';
            }, 2000);
        } else {
            if (result.message.includes("actual")) {
                currentError.textContent = result.message;
                currentError.style.display = 'flex';
            } else {
                newError.textContent = result.message;
                newError.style.display = 'flex';
            }
        }
    };
    
    window.closeModal = function() {
        document.getElementById('passwordModal').style.display = 'none';
    };
    
    document.getElementById('changePasswordLink')?.addEventListener('click', function() {
        document.getElementById('passwordModal').style.display = 'block';
    });
    
    document.getElementById('adminPassword')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') verifyAdmin();
    });
    
    // Actualizar hojas al cambiar el tamaño de la ventana
    window.addEventListener('resize', createLeaves);
});