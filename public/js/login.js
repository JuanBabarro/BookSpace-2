document.addEventListener('DOMContentLoaded', () => {
    // Configuración inicial si es necesaria
});

document.getElementById('formularioLogin').addEventListener('submit', async function (e) {
    e.preventDefault();
    const boton = this.querySelector('button');
    const resultado = document.getElementById('textoResultadoLogin');

    const email = document.getElementById('correo').value.trim();
    const password = document.getElementById('contrasena').value;

    boton.classList.add('btn-loading');

    try {
        const respuesta = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            // Ocultar cualquier error previo
            resultado.style.display = 'none';

            // Guardar info del usuario para saber quién es
            localStorage.setItem('usuario', JSON.stringify(datos.user));

            // Limpiar favoritos locales para obligar a cargar desde la BD
            localStorage.removeItem('miLista');

            setTimeout(() => {
                window.location.href = '/inicio';
            }, 1200);
        } else {
            // Quitar animación en caso de error
            boton.classList.remove('btn-loading');
            
            // Mostrar error del backend
            const mensajeError = datos.errors ? datos.errors[0].msg : datos.error;
            resultado.textContent = 'Error: ' + mensajeError;
            resultado.style.color = '#ef4444'; // Rojo para error
            resultado.style.display = 'block';
        }
    } catch (error) {
        boton.classList.remove('btn-loading');
        console.error('Error:', error);
        resultado.textContent = 'Ocurrió un error de conexión con el servidor.';
        resultado.style.color = '#ef4444';
        resultado.style.display = 'block';
    }
});
