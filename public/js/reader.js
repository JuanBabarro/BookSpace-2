// Reader Logic - Replica BookSpace

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = parseInt(urlParams.get('id'));
    let currentBookPages = 0;

    // Obtener datos de sesión
    const userStr = localStorage.getItem('usuario');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    let currentBookmarkPage = 0;

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

    if (bookId) {
        fetch(`/api/libros/${bookId}`)
            .then(res => res.json())
            .then(book => {
                if (book.error) {
                    alert("Error: " + book.error);
                    return;
                }
                currentBookPages = book.paginas || 0;
                
                // Mapear la imagen usando el ID del libro
                book.cover = coverImages[(bookId - 1) % coverImages.length];
                
                document.getElementById('readerBookTitle').textContent = book.titulo;
                document.getElementById('readerBookAuthor').textContent = `por ${book.autor}`;
                document.getElementById('readerMiniCover').src = book.cover;
                document.getElementById('readerMiniCover').alt = book.titulo;
                document.getElementById('pdfViewer').src = book.pdfUrl;
                
                // Cargar marcador una vez que conocemos la cantidad de páginas del libro
                loadBookmark();
            })
            .catch(err => console.error("Error fetching book details:", err));
    }

    // --- Navbar Dropdown Fix ---
    const configBtn = document.getElementById('configBtn');
    const configDropdown = document.getElementById('configDropdown');

    if (configBtn && configDropdown) {
        configBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            configDropdown.classList.toggle('show');
        });

        window.addEventListener('click', () => {
            if (configDropdown.classList.contains('show')) {
                configDropdown.classList.remove('show');
            }
        });
    }

    // --- Zoom Logic ---
    let zoomLevel = 100;
    const zoomPercentDisplay = document.getElementById('zoomPercent');
    const zoomStatDisplay = document.getElementById('zoomValStat');
    const pdfSheet = document.querySelector('.pdf-sheet');

    function updateZoom(delta) {
        zoomLevel = Math.max(50, Math.min(200, zoomLevel + delta));
        zoomPercentDisplay.textContent = `${zoomLevel}%`;
        zoomStatDisplay.textContent = `${zoomLevel}%`;
        if (pdfSheet) {
            const parent = pdfSheet.parentElement;
            const computedStyle = window.getComputedStyle(parent);
            const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
            const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
            const usableWidth = parent.clientWidth - paddingLeft - paddingRight;
            
            const baseWidth = Math.min(800, usableWidth); 
            pdfSheet.style.maxWidth = 'none';
            pdfSheet.style.width = `${baseWidth * (zoomLevel / 100)}px`;
        }
    }

    document.getElementById('zoomInBtn').addEventListener('click', () => updateZoom(10));
    document.getElementById('zoomOutBtn').addEventListener('click', () => updateZoom(-10));
    document.getElementById('zoomInSidebar').addEventListener('click', () => updateZoom(10));
    document.getElementById('zoomOutSidebar').addEventListener('click', () => updateZoom(-10));
    
    // Inicializar zoom y recalcular al redimensionar la pantalla
    updateZoom(0);
    window.addEventListener('resize', () => updateZoom(0));

    // --- Fullscreen ---
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
        const panel = document.querySelector('.panel-container');
        if (!document.fullscreenElement) {
            panel.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // --- Bookmark ---
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    const bookmarkIcon = document.getElementById('bookmarkIcon');
    const bookmarkStat = document.getElementById('bookmarkValStat');
    
    // --- Actualizar Progreso del Lector ---
    function updateReaderProgress() {
        const progressPercent = currentBookPages > 0 ? Math.round((currentBookmarkPage / currentBookPages) * 100) : 0;
        
        const progressBarFill = document.getElementById('progressBarFill');
        if (progressBarFill) {
            progressBarFill.style.width = `${progressPercent}%`;
        }
        
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${progressPercent}% completado`;
        }
        
        const bookmarkStatVal = document.getElementById('bookmarkValStat');
        if (bookmarkStatVal) {
            bookmarkStatVal.textContent = currentBookmarkPage > 0 ? currentBookmarkPage : "----";
        }
        
        const bookmarkIconElement = document.getElementById('bookmarkIcon');
        if (bookmarkIconElement) {
            if (currentBookmarkPage > 0) {
                bookmarkIconElement.setAttribute('data-icon', 'mdi:bookmark');
            } else {
                bookmarkIconElement.setAttribute('data-icon', 'mdi:bookmark-outline');
            }
        }
    }

    function loadBookmark() {
        if (!bookId) return;
        
        // 1. Cargar instantáneamente desde localStorage (caché rápida)
        const bookmarks = JSON.parse(localStorage.getItem('bookBookmarks') || '{}');
        const savedPage = bookmarks[bookId];
        if (savedPage) {
            currentBookmarkPage = parseInt(savedPage) || 0;
        } else {
            currentBookmarkPage = 0;
        }
        updateReaderProgress();

        // 2. Consultar la BD para obtener el progreso actualizado y sincronizarlo
        if (currentUser) {
            fetch(`/api/favoritos/${currentUser.id || currentUser.id_usuario}`)
                .then(res => res.json())
                .then(favorites => {
                    const fav = Array.isArray(favorites) ? favorites.find(f => f.book_id === bookId) : null;
                    if (fav) {
                        currentBookmarkPage = fav.bookmark_page || 0;
                        
                        // Sincronizar hacia localStorage
                        if (currentBookmarkPage > 0) {
                            bookmarks[bookId] = currentBookmarkPage.toString();
                        } else {
                            delete bookmarks[bookId];
                        }
                        localStorage.setItem('bookBookmarks', JSON.stringify(bookmarks));
                    } else {
                        currentBookmarkPage = 0;
                        delete bookmarks[bookId];
                        localStorage.setItem('bookBookmarks', JSON.stringify(bookmarks));
                    }
                    updateReaderProgress();
                })
                .catch(err => console.error("Error sincronizando marcador desde el servidor:", err));
        }
    }
    
    // Cargar al inicio
    loadBookmark();

    const bookmarkModal = document.getElementById('bookmarkModal');
    const bookmarkPageInput = document.getElementById('bookmarkPageInput');
    const saveBookmarkBtn = document.getElementById('saveBookmarkBtn');
    const clearBookmarkBtn = document.getElementById('clearBookmarkBtn');
    const closeBookmarkModal = document.getElementById('closeBookmarkModal');

    const bookmarkError = document.getElementById('bookmarkError');

    bookmarkBtn.addEventListener('click', () => {
        if (!bookId) return;
        bookmarkPageInput.value = currentBookmarkPage > 0 ? currentBookmarkPage : "";
        if (bookmarkError) bookmarkError.style.display = 'none'; // ocultar error al abrir
        bookmarkModal.style.display = 'flex';
    });

    closeBookmarkModal.addEventListener('click', () => {
        bookmarkModal.style.display = 'none';
    });

    // Cerrar al clickear fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target === bookmarkModal) {
            bookmarkModal.style.display = 'none';
        }
    });

    saveBookmarkBtn.addEventListener('click', () => {
        if (!bookId) return;
        const page = bookmarkPageInput.value.trim();
        
        if (bookmarkError) bookmarkError.style.display = 'none';

        let pageNum = 0;
        if (page !== "") {
            pageNum = Number(page);
            if (isNaN(pageNum) || !Number.isInteger(pageNum) || pageNum <= 0) {
                if (bookmarkError) {
                    bookmarkError.textContent = 'Por favor, ingresa un número de página válido.';
                    bookmarkError.style.display = 'block';
                }
                return;
            }

            if (currentBookPages > 0 && pageNum > currentBookPages) {
                if (bookmarkError) {
                    bookmarkError.textContent = `La página no puede ser mayor al total del libro (${currentBookPages} páginas).`;
                    bookmarkError.style.display = 'block';
                }
                return;
            }
        }

        // Guardar en la base de datos si el usuario está logueado
        if (currentUser) {
            fetch('/api/favoritos/progress', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: (currentUser.id || currentUser.id_usuario),
                    book_id: bookId,
                    bookmark_page: pageNum
                })
            })
            .then(res => {
                if (res.ok) {
                    currentBookmarkPage = pageNum;
                    updateReaderProgress();
                    
                    // Sincronizar con localStorage
                    const bookmarks = JSON.parse(localStorage.getItem('bookBookmarks') || '{}');
                    if (pageNum === 0) {
                        delete bookmarks[bookId];
                    } else {
                        bookmarks[bookId] = pageNum.toString();
                    }
                    localStorage.setItem('bookBookmarks', JSON.stringify(bookmarks));
                } else {
                    alert("Error guardando el marcador en el servidor.");
                }
            })
            .catch(err => {
                console.error("Error al guardar marcador en servidor:", err);
                alert("Error de conexión. Se guardará localmente.");
                
                // Fallback local en caso de error de red
                currentBookmarkPage = pageNum;
                updateReaderProgress();
                const bookmarks = JSON.parse(localStorage.getItem('bookBookmarks') || '{}');
                if (pageNum === 0) {
                    delete bookmarks[bookId];
                } else {
                    bookmarks[bookId] = pageNum.toString();
                }
                localStorage.setItem('bookBookmarks', JSON.stringify(bookmarks));
            });
        } else {
            // Guardado local tradicional si no hay usuario
            currentBookmarkPage = pageNum;
            updateReaderProgress();
            const bookmarks = JSON.parse(localStorage.getItem('bookBookmarks') || '{}');
            if (pageNum === 0) {
                delete bookmarks[bookId];
            } else {
                bookmarks[bookId] = pageNum.toString();
            }
            localStorage.setItem('bookBookmarks', JSON.stringify(bookmarks));
        }

        bookmarkModal.style.display = 'none';
    });

    clearBookmarkBtn.addEventListener('click', () => {
        if (!bookId) return;
        if (bookmarkError) bookmarkError.style.display = 'none';
        
        if (currentUser) {
            fetch('/api/favoritos/progress', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: (currentUser.id || currentUser.id_usuario),
                    book_id: bookId,
                    bookmark_page: 0
                })
            })
            .then(res => {
                if (res.ok) {
                    currentBookmarkPage = 0;
                    updateReaderProgress();
                    
                    const bookmarks = JSON.parse(localStorage.getItem('bookBookmarks') || '{}');
                    delete bookmarks[bookId];
                    localStorage.setItem('bookBookmarks', JSON.stringify(bookmarks));
                } else {
                    alert("Error eliminando el marcador del servidor.");
                }
            })
            .catch(err => {
                console.error("Error al eliminar marcador en servidor:", err);
                alert("Error de conexión. Se eliminará localmente.");
                
                currentBookmarkPage = 0;
                updateReaderProgress();
                const bookmarks = JSON.parse(localStorage.getItem('bookBookmarks') || '{}');
                delete bookmarks[bookId];
                localStorage.setItem('bookBookmarks', JSON.stringify(bookmarks));
            });
        } else {
            currentBookmarkPage = 0;
            updateReaderProgress();
            const bookmarks = JSON.parse(localStorage.getItem('bookBookmarks') || '{}');
            delete bookmarks[bookId];
            localStorage.setItem('bookBookmarks', JSON.stringify(bookmarks));
        }

        bookmarkModal.style.display = 'none';
    });

    // --- Rating / Calificar Modal ---
    const ratingModalContainer = document.getElementById('ratingModalContainer');
    let currentRating = 0;
    let bookTitle = '';

    // Fetch book title for the modal
    if (bookId) {
        fetch(`/api/libros/${bookId}`)
            .then(r => r.json())
            .then(b => { if (!b.error) bookTitle = b.titulo; })
            .catch(() => {});
    }

    // Load rating modal HTML dynamically
    fetch('/html/rating-modal.html')
        .then(r => r.text())
        .then(html => {
            ratingModalContainer.innerHTML = html;
            setupRatingModal();
        })
        .catch(err => console.error('Error cargando rating modal:', err));

    function setupRatingModal() {
        const ratingModal      = document.getElementById('ratingModal');
        const closeRatingModal = document.getElementById('closeRatingModal');
        const cancelRatingBtn  = document.getElementById('cancelRatingBtn');
        const saveRatingBtn    = document.getElementById('saveRatingBtn');
        const ratingLabel      = document.getElementById('ratingLabel');
        const ratingBookName   = document.getElementById('ratingBookName');
        const ratingReview     = document.getElementById('ratingReview');
        const ratingCharCount  = document.getElementById('ratingCharCount');
        const starsContainer   = document.getElementById('ratingStarsContainer');
        const hitZones         = document.querySelectorAll('.star-hit');

        const starLabels = {
            0.5: 'Pésimo (0.5/5)',
            1:   'Terrible (1/5)',
            1.5: 'Muy malo (1.5/5)',
            2:   'Malo (2/5)',
            2.5: 'Regular (2.5/5)',
            3:   'Bueno (3/5)',
            3.5: 'Muy bueno (3.5/5)',
            4:   'Excelente (4/5)',
            4.5: 'Casi perfecto (4.5/5)',
            5:   'Obra maestra (5/5)',
        };

        // Paint the 5 display stars by rebuilding Iconify spans
        function paintStars(value) {
            const display = document.querySelector('.stars-display');
            let html = '';
            for (let i = 1; i <= 5; i++) {
                let icon, colorClass;
                if (i <= value) {
                    icon = 'mdi:star';
                    colorClass = 'full';
                } else if (i - 0.5 === value) {
                    icon = 'mdi:star-half-full';
                    colorClass = 'half';
                } else {
                    icon = 'mdi:star-outline';
                    colorClass = 'empty';
                }
                html += `<span class="iconify star-display ${colorClass}" data-icon="${icon}"></span>`;
            }
            display.innerHTML = html;
            if (window.Iconify) Iconify.scan(display);
        }

        function setStars(value) {
            currentRating = value;
            paintStars(value);
            if (value > 0) {
                ratingLabel.textContent = starLabels[value] || `${value}/5`;
                ratingLabel.classList.add('has-rating');
            } else {
                ratingLabel.textContent = 'Selecciona una calificación';
                ratingLabel.classList.remove('has-rating');
            }
            saveRatingBtn.disabled = (value === 0);
        }

        function loadSavedRating() {
            if (!bookId) return;
            const ratings = JSON.parse(localStorage.getItem('bookRatings') || '{}');
            const saved = ratings[bookId];
            ratingBookName.textContent = bookTitle ? `"${bookTitle}"` : '"..."';
            ratingReview.value = '';
            ratingCharCount.textContent = '0';
            setStars(saved ? saved.rating : 0);
            if (saved && saved.review) {
                ratingReview.value = saved.review;
                ratingCharCount.textContent = saved.review.length;
            }
        }

        // Wire up the 10 invisible hit zones
        hitZones.forEach(zone => {
            const val = parseFloat(zone.dataset.value);

            zone.addEventListener('mouseenter', () => {
                paintStars(val);
                ratingLabel.textContent = starLabels[val] || `${val}/5`;
                ratingLabel.classList.add('has-rating');
            });

            zone.addEventListener('click', () => {
                setStars(val);
            });
        });

        // Reset on leaving stars area
        starsContainer.addEventListener('mouseleave', () => {
            paintStars(currentRating);
            if (currentRating > 0) {
                ratingLabel.textContent = starLabels[currentRating];
                ratingLabel.classList.add('has-rating');
            } else {
                ratingLabel.textContent = 'Selecciona una calificación';
                ratingLabel.classList.remove('has-rating');
            }
        });

        // Char counter
        ratingReview.addEventListener('input', () => {
            ratingCharCount.textContent = ratingReview.value.length;
        });

        // Open modal
        document.getElementById('finishBtn').addEventListener('click', () => {
            if (currentBookPages > 0 && currentBookmarkPage < currentBookPages) {
                alert(`Debes terminar de leer el libro (llegar a la página ${currentBookPages}) para poder clasificarlo.`);
                return;
            }
            loadSavedRating();
            ratingModal.style.display = 'flex';
        });

        // Close handlers
        function closeModal() { ratingModal.style.display = 'none'; }
        closeRatingModal.addEventListener('click', closeModal);
        cancelRatingBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (e) => { if (e.target === ratingModal) closeModal(); });

        // Save
        saveRatingBtn.addEventListener('click', async () => {
            if (!bookId || currentRating === 0) return;
            
            const userStr = localStorage.getItem('usuario');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            
            if (!currentUser) {
                alert('Debes iniciar sesión para calificar.');
                return;
            }

            const reviewText = ratingReview.value.trim();

            try {
                saveRatingBtn.disabled = true;
                const response = await fetch('/api/resenas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: (currentUser.id || currentUser.id_usuario),
                        book_id: bookId,
                        rating: currentRating,
                        content: reviewText
                    })
                });

                if (response.ok) {
                    // Guardar en cache local para que cargue rápido al reabrir el modal
                    const ratings = JSON.parse(localStorage.getItem('bookRatings') || '{}');
                    ratings[bookId] = { rating: currentRating, review: reviewText };
                    localStorage.setItem('bookRatings', JSON.stringify(ratings));
                    closeModal();
                } else {
                    const errorData = await response.json();
                    alert('Error: ' + (errorData.error || 'No se pudo guardar'));
                }
            } catch (err) {
                console.error("Error guardando calificación:", err);
                alert("Ocurrió un error al guardar.");
            } finally {
                saveRatingBtn.disabled = false;
            }
        });
    }

    // --- Mobile Sidebar Toggle Logic ---
    const toggleControlsBtn = document.getElementById('toggleControlsBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarControls = document.getElementById('sidebarControls');

    if (toggleControlsBtn && sidebarControls) {
        toggleControlsBtn.addEventListener('click', () => {
            sidebarControls.classList.add('open');
            if (sidebarOverlay) sidebarOverlay.classList.add('active');
        });
    }

    const closeMenu = () => {
        if (sidebarControls) sidebarControls.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    };

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeMenu);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMenu);
    }


});
