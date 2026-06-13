CREATE DATABASE IF NOT EXISTS bmeuwu2pjl4x1msneduv;
USE bmeuwu2pjl4x1msneduv;

-- --------------------------------------------------------
-- CREACIÓN DE TABLAS (Estructura en Español)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'user') DEFAULT 'user',
    creado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

CREATE TABLE IF NOT EXISTS libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    paginas INT NOT NULL,
    url_pdf TEXT NOT NULL,
    creado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

CREATE TABLE IF NOT EXISTS resenas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_libro INT NOT NULL,
    contenido TEXT NOT NULL,
    calificacion INT CHECK (calificacion >= 1 AND calificacion <= 5),
    creado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_resena_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_resena_libro
        FOREIGN KEY (id_libro)
        REFERENCES libros(id)
        ON DELETE CASCADE
); 

CREATE TABLE IF NOT EXISTS libros_usuario (
    id_usuario INT NOT NULL,
    id_libro INT NOT NULL,
    agregado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pagina_marcador INT DEFAULT 0,

    PRIMARY KEY (id_usuario, id_libro),

    CONSTRAINT fk_librosusuario_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_librosusuario_libro
        FOREIGN KEY (id_libro)
        REFERENCES libros(id)
        ON DELETE CASCADE
);

-- --------------------------------------------------------
-- INSERCIÓN DE DATOS REALES
-- --------------------------------------------------------

-- 1. Insertar Usuarios
INSERT INTO usuarios (nombre, apellido, nombre_usuario, email, contrasena, rol) VALUES
('Admin', 'Principal', 'admin', 'admin@bookapp.com', 'admin123', 'admin'),
('Juan', 'Perez', 'juanperez', 'juan@bookapp.com', 'user123', 'user');

-- 2. Insertar Libros
INSERT INTO libros (titulo, autor, paginas, url_pdf) VALUES
('Hannibal', 'Thomas Harris', 340, '1ypRGZNW3SQi1VwtRE822vA0PYugRIphB'),
('Crimen y Castigo', 'Fiódor Dostoyevski', 672, '183muXXJkD_eR4YYuXB7dQc8-7fir8-9T'),
('Guerra y Paz', 'León Tolstói', 1225, '1NVsMq2u5-ov5SM4DMZemJmIGjap4xYTL'),
('It (Eso)', 'Stephen King', 1138, '1QjvzOPbcyHMSpU0HRb22wPT_HvFGZ5sN'),
('El Lobo Estepario', 'Hermann Hesse', 237, '1hPrbBg_J4urmff3J15QIOwbCW3ukZG3f'),
('Los Hermanos Karamazov', 'Fiódor Dostoyevski', 796, '1A_ovO3iECz7RNlnBX2HBDH3wOIggnnFV'),
('El Renacido', 'Michael Punke', 272, '1IsqT_4WILe3JjJxWng85ywkddqa4gssL'),
('El Silencio de los Inocentes', 'Thomas Harris', 421, '1BtuWjMTllwZYbFVdk0UH93IHlI08ojP1'),
('Vida y Destino', 'Vasili Grossman', 1120, '1OFAci81RQloEmzYskvwXMDcRz823SyrC'),
('Cementerio de Animales', 'Stephen King', 416, '1ts7pkVQbXaej7Ig8aJNCPTCUVS0Zg1CK'),
('Berlín', 'Antony Beevor', 552, '1fYcExiaN_5XC06FV2aq870t8r3I_o_Xp'),
('Por una causa justa', 'Vasili Grossman', 880, '1zTB84gh9ly2dwKPcHvOJWRRhAHqU-S4B'),
('El Diario', 'Ana Frank', 352, '1rBfLDsO7U_kk3CRXLGUCfMRkPX-vWo8l'),
('Asesinato en el Orient Express', 'Agatha Christie', 274, '19X3B8jV5-EwTkiFZ2KGpdEbohOloQfRV'),
('El asesinato de Roger Ackroyd', 'Agatha Christie', 312, '1UPoEXVFBj-3ouy-1gsd4XpTBK1D5CZID');
