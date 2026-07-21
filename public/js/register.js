document.addEventListener('DOMContentLoaded', () => {
    // Configuración inicial si es necesaria
});

document.getElementById('formularioRegistro').addEventListener('submit', async function (e) {
    e.preventDefault();
    const boton = this.querySelector('button');
    const resultado = document.getElementById('textoResultadoRegistro');

    // Mapear los campos del frontend a los campos que espera el backend
    const nombreCompleto = document.getElementById('nombre_completo').value.trim();
    const nombreUsuario = document.getElementById('nombre_usuario').value.trim();
    const email = document.getElementById('correo').value.trim();
    const password = document.getElementById('contrasena').value;
    const confirmarPassword = document.getElementById('confirmar_contrasena').value;

    if (password !== confirmarPassword) {
        resultado.textContent = 'Las contraseñas no coinciden.';
        resultado.style.color = '#ef4444';
        resultado.style.display = 'block';
        return;
    }

    const partesNombre = nombreCompleto.split(' ');
    const first_name = partesNombre[0];
    const last_name = partesNombre.length > 1 ? partesNombre.slice(1).join(' ') : first_name;

    boton.classList.add('btn-loading');

    try {
        const respuesta = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                first_name,
                last_name,
                username: nombreUsuario,
                email,
                password
            })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            // Ocultar cualquier error previo
            resultado.style.display = 'none';
            
            setTimeout(() => {
                window.location.href = '/login';
            }, 1200);
        } else {
            boton.classList.remove('btn-loading');
            const mensajeError = datos.errors ? datos.errors[0].msg : datos.error;
            resultado.textContent = 'Error: ' + mensajeError;
            resultado.style.color = '#ef4444';
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
