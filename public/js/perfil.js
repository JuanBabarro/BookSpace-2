document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('usuario');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    // Avatar Drawer Toggle
    const toggleAvatarBtn = document.getElementById('toggleAvatarBtn');
    const avatarDrawer = document.getElementById('avatarDrawer');

    if (toggleAvatarBtn && avatarDrawer) {
        toggleAvatarBtn.addEventListener('click', () => {
            toggleAvatarBtn.classList.toggle('active');
            avatarDrawer.classList.toggle('open');
        });
    }

    // Avatar Selection Logic
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const mainAvatar = document.getElementById('mainAvatar');
    const defaultUserIcon = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23c2a170'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

    // Load initial avatar from session
    if (mainAvatar) {
        const savedAvatar = currentUser && currentUser.avatar ? currentUser.avatar : defaultUserIcon;
        mainAvatar.src = savedAvatar;
        
        avatarOptions.forEach(opt => {
            if (opt.getAttribute('data-avatar') === savedAvatar) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
    }

    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from others
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to current
            option.classList.add('selected');
            
            // Update main avatar preview
            const newSrc = option.getAttribute('data-avatar');
            if (mainAvatar) mainAvatar.src = newSrc;

            // Save to localStorage session
            if (currentUser) {
                const updatedUser = {
                    ...currentUser,
                    avatar: newSrc
                };
                localStorage.setItem('usuario', JSON.stringify(updatedUser));
            }

            // Subtle animation
            if (mainAvatar) {
                mainAvatar.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    mainAvatar.style.transform = 'scale(1)';
                }, 200);
            }
        });
    });

    // Profile Form Logic
    const profileForm = document.getElementById('profileForm');
    if (profileForm && currentUser) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const usernameVal = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Simple validation
            if (password && password !== confirmPassword) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            // Split name to support full name updating
            const nameParts = usernameVal.trim().split(' ');
            const first_name = nameParts[0];
            const last_name = nameParts.slice(1).join(' ') || '.';
            const username = usernameVal.replace(/\s+/g, '').toLowerCase() || first_name;

            const saveBtn = profileForm.querySelector('button');
            const originalText = saveBtn.innerHTML;
            
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="iconify" data-icon="mdi:loading" data-inline="false"></span> Guardando...';
            saveBtn.style.opacity = '0.7';

            let isSuccess = false;
            try {
                const response = await fetch(`/api/auth/update-profile/${currentUser.id || currentUser.id_usuario}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        first_name,
                        last_name,
                        username,
                        email,
                        password: password || undefined
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    
                    // Update session storage
                    const updatedUser = {
                        ...currentUser,
                        ...result.user
                    };
                    localStorage.setItem('usuario', JSON.stringify(updatedUser));
                    
                    // Update header name and alias in page
                    document.querySelector('.profile-header-card h2').textContent = updatedUser.first_name + " " + updatedUser.last_name;
                    document.getElementById('username').value = updatedUser.username || updatedUser.first_name;
                    document.getElementById('email').value = updatedUser.email;
                    
                    // Clear password fields
                    document.getElementById('password').value = '';
                    document.getElementById('confirmPassword').value = '';
                    
                    isSuccess = true;
                    
                    // Show success state on the button
                    saveBtn.innerHTML = '<span class="iconify" data-icon="mdi:check-circle" data-inline="false"></span> Cambios guardados';
                    saveBtn.style.backgroundColor = '#81c784'; // success green
                    saveBtn.style.borderColor = '#81c784';
                    saveBtn.style.color = '#1e1814';
                    saveBtn.style.opacity = '1';
                    
                    setTimeout(() => {
                        saveBtn.disabled = false;
                        saveBtn.innerHTML = originalText;
                        saveBtn.style.backgroundColor = '';
                        saveBtn.style.borderColor = '';
                        saveBtn.style.color = '';
                    }, 3000);
                } else {
                    const errData = await response.json();
                    alert('Error: ' + (errData.error || 'No se pudo actualizar el perfil.'));
                }
            } catch (err) {
                console.error("Error al actualizar perfil:", err);
                alert('Error de conexión al servidor.');
            } finally {
                if (!isSuccess) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = originalText;
                    saveBtn.style.opacity = '1';
                }
            }
        });
    }

    // Lógica para cargar reseñas de la Base de Datos
    const reviewsGrid = document.getElementById('reviewsGrid');

    if (reviewsGrid && currentUser) {
        // Cargar nombre e email guardados
        document.querySelector('.profile-header-card h2').textContent = currentUser.first_name + " " + currentUser.last_name;
        document.getElementById('username').value = currentUser.username || currentUser.first_name;
        document.getElementById('email').value = currentUser.email;

        const coverImages = [
            '/images/image/Hannibal.jpg',
            '/images/image/CrimenyCastigo.jpg',
            '/images/image/GuerrayPaz.jpeg',
            '/images/image/It.jpeg',
            '/images/image/Lobo.jpg',
            '/images/image/LosHermanos.jpg',
            '/images/image/Renacido.webp',
            '/images/image/Silencio.GIF',
            '/images/image/VidayDestino.GIF',
            '/images/image/Animales.jpg',
            '/images/image/Berlin.jpg',
            '/images/image/CausaJusta.jpg',
            '/images/image/Diario.webp',
            '/images/image/Misterio.jpg',
            '/images/image/Misterio2.webp'
        ];

        fetch(`/api/resenas/user/${currentUser.id || currentUser.id_usuario}`)
            .then(res => res.json())
            .then(reviews => {
                // Update badge
                const badge = document.querySelector('.reviews-section .status-badge');
                if (badge) {
                    badge.textContent = `${reviews.length} Reseñas Totales`;
                }

                if (reviews.length === 0) {
                    reviewsGrid.innerHTML = '<p style="color: var(--reader-text-muted); text-align: center; width: 100%; grid-column: 1 / -1; padding: 2rem;">Aún no has escrito ninguna reseña.</p>';
                    return;
                }

                reviewsGrid.innerHTML = reviews.map(review => {
                    const coverSrc = coverImages[(review.book_id - 1) % coverImages.length];
                    
                    // Generate stars
                    let starsHtml = '';
                    for (let i = 1; i <= 5; i++) {
                        if (i <= review.rating) {
                            starsHtml += '<span class="iconify" data-icon="mdi:star"></span>';
                        } else if (i - 0.5 === review.rating) {
                            starsHtml += '<span class="iconify" data-icon="mdi:star-half-full"></span>';
                        } else {
                            starsHtml += '<span class="iconify" data-icon="mdi:star-outline"></span>';
                        }
                    }

                    // Format date
                    const dateObj = new Date(review.created_at);
                    const formattedDate = isNaN(dateObj) ? 'Recientemente' : dateObj.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

                    return `
                    <div class="glass-card review-card">
                        <div class="review-book-cover" onclick="window.location.href='/html/reader.html?id=${review.book_id}'" style="cursor: pointer;">
                            <img src="${coverSrc}" alt="${review.title}">
                        </div>
                        <div class="review-content">
                            <div class="review-info">
                                <h3>${review.title}</h3>
                                <p class="author">${review.author}</p>
                            </div>
                            <div class="review-rating" style="color: #ffb74d;">
                                ${starsHtml}
                            </div>
                            <p class="review-text">"${review.content || 'Sin comentario escrito.'}"</p>
                            <span class="review-date">Publicado el ${formattedDate}</span>
                        </div>
                    </div>
                    `;
                }).join('');
            })
            .catch(err => {
                console.error("Error cargando reseñas:", err);
                reviewsGrid.innerHTML = '<p style="color: var(--error); text-align: center; width: 100%; grid-column: 1 / -1; padding: 2rem;">Error cargando tus reseñas.</p>';
            });
    } else if (reviewsGrid) {
        reviewsGrid.innerHTML = '<p style="color: var(--reader-text-muted); text-align: center; width: 100%; grid-column: 1 / -1; padding: 2rem;">Inicia sesión para ver tus reseñas.</p>';
    }
});
