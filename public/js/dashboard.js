// Datos de Sesión
const usuarioStr = localStorage.getItem('usuario');
const usuarioActual = usuarioStr ? JSON.parse(usuarioStr) : null;
let idsLibrosGuardados = [];

// Helpers de API para Mi Lista
window.obtenerLibrosGuardados = function () {
    return idsLibrosGuardados;
};

window.guardarLibroEnLista = async function (idLibro) {
    const idLibroInt = parseInt(idLibro, 10);
    if (!usuarioActual) {
        alert('Debes iniciar sesión para guardar favoritos.');
        return false;
    }
    try {
        const payload = { user_id: (usuarioActual.id || usuarioActual.id_usuario), book_id: idLibroInt };
        console.log("Enviando POST a /api/favoritos con payload:", payload);
        const respuesta = await fetch('/api/favoritos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (respuesta.ok) {
            if (!idsLibrosGuardados.includes(idLibroInt)) idsLibrosGuardados.push(idLibroInt);

            // Inicializar progreso local en 0
            const libro = datosLibros.find(l => (l.id || l.id_libro) === idLibroInt);
            if (libro) {
                libro.pagina_marcador = libro.pagina_marcador || 0;
            }

            // Renderizar la lista de favoritos si estamos en esa vista
            if (document.getElementById('myListContainer') && typeof window.renderizarMiLista === 'function') {
                window.renderizarMiLista();
            }

            return true;
        }
    } catch (err) {
        console.error("Error agregando favorito:", err);
    }
    return false;
};

window.eliminarLibroDeLista = async function (idLibro) {
    const idLibroInt = parseInt(idLibro, 10);
    if (!usuarioActual) return false;
    try {
        const respuesta = await fetch('/api/favoritos', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: (usuarioActual.id || usuarioActual.id_usuario), book_id: idLibroInt })
        });
        if (respuesta.ok) {
            idsLibrosGuardados = idsLibrosGuardados.filter(id => id !== idLibroInt);

            // Renderizar la lista de favoritos si estamos en esa vista
            if (document.getElementById('myListContainer') && typeof window.renderizarMiLista === 'function') {
                window.renderizarMiLista();
            }
            return true;
        }
    } catch (err) {
        console.error("Error eliminando favorito:", err);
    }
    return false;
};

// Lógica de Modal - Carga Dinámica desde modal.html
let idLibroActual = null;

window.abrirModalLibro = function (idLibro) {
    idLibroActual = idLibro;
    const libro = datosLibros.find(l => (l.id || l.id_libro) === idLibro);
    if (!libro) return;

    const modal = document.getElementById('bookModal');
    const modalTitulo = document.getElementById('modalBookTitle');
    const modalAutor = document.getElementById('modalBookAuthor');
    const modalDesc = document.getElementById('modalBookDescription');
    const modalPortada = document.getElementById('modalBookCover');
    const modalPortadaBg = document.getElementById('modalCoverBg');
    const botonListaModal = document.getElementById('modalListBtn');

    if (!modal) {
        console.error("El modal aún no se ha cargado en el DOM");
        return;
    }

    if (botonListaModal) {
        if (idsLibrosGuardados.includes(idLibro)) {
            botonListaModal.innerHTML = `
                <span class="iconify" data-icon="mdi:bookmark-remove-outline"></span>
                Quitar de mi Lista
            `;
            botonListaModal.style.backgroundColor = 'var(--error)';
        } else {
            botonListaModal.innerHTML = `
                <span class="iconify" data-icon="mdi:bookmark-outline"></span>
                Añadir a mi Lista
            `;
            botonListaModal.style.backgroundColor = '';
        }
    }

    modalTitulo.textContent = libro.titulo;
    modalAutor.textContent = `por ${libro.autor}`;
    modalDesc.textContent = libro.descripcion || 'Sin descripción';
    modalPortada.src = libro.portada;
    modalPortada.alt = libro.titulo;
    modalPortadaBg.style.backgroundImage = `url('${libro.portada}')`;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

// Lógica de favoritos (alternar)
window.alternarFavorito = async function (evento, boton, idLibro) {
    evento.stopPropagation();

    if (!usuarioActual) {
        alert('Debes iniciar sesión para agregar favoritos.');
        return;
    }

    const estaGuardado = idsLibrosGuardados.includes(idLibro);

    if (estaGuardado) {
        const exito = await window.eliminarLibroDeLista(idLibro);
        if (exito) {
            boton.classList.remove('active');
            boton.querySelector('.iconify').setAttribute('data-icon', 'mdi:heart-outline');
        }
    } else {
        const exito = await window.guardarLibroEnLista(idLibro);
        if (exito) {
            boton.classList.add('active');
            boton.querySelector('.iconify').setAttribute('data-icon', 'mdi:heart');
        }
    }
};

// Contenedor global de libros
let datosLibros = [];

document.addEventListener('DOMContentLoaded', () => {
    const booksGrid = document.getElementById('booksGrid');
    const searchInput = document.getElementById('bookSearch');
    const modalContainer = document.getElementById('modalContainer');
    const myListContainer = document.getElementById('myListContainer');

    // Cargar el Modal dinámicamente si el contenedor existe
    if (modalContainer) {
        fetch('/html/modal.html')
            .then(respuesta => respuesta.text())
            .then(html => {
                modalContainer.innerHTML = html;
                configurarEventosModal();
            })
            .catch(err => console.error("Error cargando el modal:", err));
    }

    const imagenesPortada = [
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

    // Mostrar skeletons de carga mientras se obtienen los datos
    if (booksGrid) {
        booksGrid.innerHTML = Array(6).fill(`
            <div class="book-card" style="pointer-events:none;">
                <div class="book-cover" style="background: linear-gradient(90deg, #2a2118 25%, #3a3028 50%, #2a2118 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; min-height: 280px;">
                    <div style="position:absolute;bottom:0;left:0;right:0;padding:12px;">
                        <div style="background:#3a3028;height:14px;border-radius:4px;margin-bottom:8px;width:80%;"></div>
                        <div style="background:#3a3028;height:11px;border-radius:4px;width:55%;"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Carga inicial desde las API en español
    const obtenerLibros = fetch('/api/libros').then(res => res.json());
    const obtenerFavoritos = usuarioActual ?
        fetch(`/api/favoritos/${usuarioActual.id || usuarioActual.id_usuario}`).then(res => res.json()) :
        Promise.resolve([]);

    Promise.all([obtenerLibros, obtenerFavoritos])
        .then(([resultadoLibros, resultadoFavoritos]) => {
            idsLibrosGuardados = Array.isArray(resultadoFavoritos) ? resultadoFavoritos.map(f => typeof f === 'object' ? f.book_id : f) : [];

            datosLibros = resultadoLibros.map((libro, indice) => {
                libro.portada = imagenesPortada[indice % imagenesPortada.length];

                // Mapear marcador/progreso guardado desde la BD
                const fav = Array.isArray(resultadoFavoritos) ? resultadoFavoritos.find(f => (typeof f === 'object' ? f.book_id : f) === (libro.id || libro.id_libro)) : null;
                libro.pagina_marcador = fav && typeof fav === 'object' ? fav.bookmark_page : 0;

                return libro;
            });

            // Si estamos en el inicio, renderizar grilla
            if (booksGrid) {
                window.renderizarLibros(datosLibros);
            }

            // Si estamos en mi-lista, renderizar lista
            if (myListContainer) {
                window.renderizarMiLista();
            }
        })
        .catch(err => {
            console.error("Error cargando datos desde la API:", err);
            if (booksGrid) {
                booksGrid.innerHTML = '<p style="color: var(--reader-text-muted, #a89880); text-align: center; width: 100%; grid-column: 1 / -1; padding: 3rem; font-size: 1.1rem;">⚠️ Error al conectar con el servidor. Recarga la página.</p>';
            }
        });

    // Funcionalidad de Búsqueda para Dashboard Principal
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const terminoBusqueda = e.target.value.toLowerCase();
            const librosFiltrados = datosLibros.filter(libro =>
                libro.titulo.toLowerCase().includes(terminoBusqueda) ||
                libro.autor.toLowerCase().includes(terminoBusqueda)
            );
            window.renderizarLibros(librosFiltrados);
        });
    }

    // Funcionalidad de Búsqueda para Mi Lista
    const listSearchInput = document.getElementById('listSearch');
    if (listSearchInput) {
        listSearchInput.addEventListener('input', (e) => {
            const terminoBusqueda = e.target.value.toLowerCase();
            const itemsLista = document.querySelectorAll('.list-item');

            itemsLista.forEach(item => {
                const titulo = item.querySelector('h3').textContent.toLowerCase();
                const autor = item.querySelector('.author').textContent.toLowerCase();

                if (titulo.includes(terminoBusqueda) || autor.includes(terminoBusqueda)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }


    const configBtn = document.getElementById('configBtn');
    const configDropdown = document.getElementById('configDropdown');

    if (configBtn && configDropdown) {
        configBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            configDropdown.classList.toggle('show');
        });

        // Cerrar al hacer clic afuera
        window.addEventListener('click', () => {
            if (configDropdown.classList.contains('show')) {
                configDropdown.classList.remove('show');
            }
        });

        // Prevenir cierre al hacer clic adentro
        configDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    function configurarEventosModal() {
        const bookModal = document.getElementById('bookModal');
        const closeModal = document.getElementById('closeModal');
        const readNowBtn = document.getElementById('readNowBtn');
        const botonListaModal = document.getElementById('modalListBtn');

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                bookModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }

        if (readNowBtn) {
            readNowBtn.addEventListener('click', async () => {
                if (idLibroActual) {
                    await window.guardarLibroEnLista(idLibroActual); // Guardar progreso al iniciar a leer
                    window.location.href = `/html/reader.html?id=${idLibroActual}`;
                }
            });
        }

        if (botonListaModal) {
            // Eliminar listeners previos clonando el botón
            const nuevoBotonListaModal = botonListaModal.cloneNode(true);
            botonListaModal.parentNode.replaceChild(nuevoBotonListaModal, botonListaModal);

            nuevoBotonListaModal.addEventListener('click', async () => {
                if (!idLibroActual) return;

                if (!usuarioActual) {
                    alert('Debes iniciar sesión para guardar favoritos.');
                    return;
                }

                if (idsLibrosGuardados.includes(idLibroActual)) {
                    await window.eliminarLibroDeLista(idLibroActual);
                } else {
                    await window.guardarLibroEnLista(idLibroActual);
                }

                // Refrescar modal
                window.abrirModalLibro(idLibroActual);
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === bookModal) {
                bookModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Asignar renderizarLibros al objeto global para llamarlo desde cualquier lado
    window.renderizarLibros = function (libros) {
        if (!booksGrid) return;

        const librosGuardados = obtenerLibrosGuardados();

        booksGrid.innerHTML = libros.map((libro) => {
            const libroId = libro.id || libro.id_libro;
            const estaGuardado = librosGuardados.includes(libroId);
            const iconoCorazon = estaGuardado ? 'mdi:heart' : 'mdi:heart-outline';
            const claseActiva = estaGuardado ? 'active' : '';

            return `
                <div class="book-card" onclick="abrirModalLibro(${libroId})">
                    <div class="book-cover">
                        <img src="${libro.portada}" alt="${libro.titulo}">
                        <button class="fav-btn ${claseActiva}" onclick="alternarFavorito(event, this, ${libroId})">
                            <span class="iconify" data-icon="${iconoCorazon}"></span>
                        </button>
                        <div class="book-details">
                            <h3>${libro.titulo}</h3>
                            <p>${libro.autor}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };

    // Renderizar la página de Mi Lista dinámicamente
    window.renderizarMiLista = function () {
        if (!myListContainer) return;

        const idsGuardados = obtenerLibrosGuardados();
        const librosGuardados = datosLibros.filter(libro => idsGuardados.includes(libro.id || libro.id_libro));

        if (librosGuardados.length === 0) {
            myListContainer.innerHTML = '<p style="color: var(--reader-text-muted); text-align: center; width: 100%; grid-column: 1 / -1; padding: 2rem;">Tu lista está vacía. Explora el inicio para agregar libros.</p>';
            return;
        }

        myListContainer.innerHTML = librosGuardados.map(libro => {
            const paginaMarcador = libro.pagina_marcador || 0;
            const totalPaginas = libro.paginas || 0;
            const porcentajeProgreso = totalPaginas > 0 ? Math.round((paginaMarcador / totalPaginas) * 100) : 0;

            let textoEstado = 'En Lista';
            let claseEstado = 'progress';

            if (porcentajeProgreso === 100) {
                textoEstado = 'Completado';
                claseEstado = 'completed';
            } else if (porcentajeProgreso > 0) {
                textoEstado = 'Leyendo';
                claseEstado = 'progress';
            }

            const claseBarraProgreso = porcentajeProgreso === 100 ? 'progress-bar completed' : 'progress-bar';

            return `
            <div class="list-item glass-card">
                <div class="item-cover">
                    <img src="${libro.portada}" alt="${libro.titulo}">
                </div>
                <div class="item-info">
                    <div class="item-header">
                        <div>
                            <span class="status-badge ${claseEstado}">${textoEstado}</span>
                            <h3>${libro.titulo}</h3>
                            <p class="author">${libro.autor}</p>
                        </div>
                        <div class="item-progress">
                            <span class="percentage">${porcentajeProgreso}%</span>
                            <div class="progress-bar-container">
                                <div class="${claseBarraProgreso}" style="width: ${porcentajeProgreso}%;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="item-footer">
                        <div class="item-actions">
                            <button class="btn-read" onclick="window.location.href='/html/reader.html?id=${libro.id || libro.id_libro}'">
                                <span class="iconify" data-icon="mdi:book-open-page-variant"></span>
                                ${porcentajeProgreso > 0 ? 'Continuar' : 'Leer'}
                            </button>
                            <button class="btn-remove" onclick="eliminarLibroDeLista(${libro.id || libro.id_libro})">
                                <span class="iconify" data-icon="mdi:trash-can-outline"></span>
                                Eliminar de la Lista
                            </button>
                        </div>
                        <div class="item-meta-extra">
                            <div class="meta-stat pages">
                                <span class="iconify" data-icon="mdi:book-open-outline"></span>
                                <span>${paginaMarcador} / ${totalPaginas} págs</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    };
});
