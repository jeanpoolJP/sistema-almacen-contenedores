-- ============================================================
-- BASE DE DATOS: almacen-contenedores
-- ============================================================

-- ============================================================
-- CLIENTES
-- ============================================================

CREATE TABLE clientes (
    id BIGSERIAL PRIMARY KEY,
    dni VARCHAR(8) UNIQUE,
    nombre_completo VARCHAR(150),
    telefono VARCHAR(20),
    observaciones TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- EMPRESAS DE TRANSPORTE
-- ============================================================

CREATE TABLE empresas_transporte (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    ruc VARCHAR(11),
    telefono VARCHAR(20),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CONDUCTORES
-- ============================================================

CREATE TABLE conductores (
    id BIGSERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    numero_licencia VARCHAR(30) NOT NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- VEHÍCULOS
-- ============================================================

CREATE TABLE vehiculos (
    id BIGSERIAL PRIMARY KEY,
    placa VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CONTENEDORES
-- ============================================================

CREATE TABLE contenedores (
    id BIGSERIAL PRIMARY KEY,
    numero_contenedor VARCHAR(20) NOT NULL UNIQUE,
    marca VARCHAR(100) NOT NULL,
    medida VARCHAR(10) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- GUÍAS DE INTERNAMIENTO
-- ============================================================

CREATE TABLE guias_internamiento (
    id BIGSERIAL PRIMARY KEY,

    -- Información general
    numero_guia INTEGER NOT NULL UNIQUE,
    cliente_id BIGINT,
    contenedor_id BIGINT NOT NULL,

    -- Información de ingreso
    empresa_transporte_ingreso_id BIGINT NOT NULL,
    vehiculo_ingreso_id BIGINT NOT NULL,
    conductor_ingreso_id BIGINT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    hora_ingreso TIME(0) WITHOUT TIME ZONE NOT NULL,

    -- Información de salida
    empresa_transporte_salida_id BIGINT,
    vehiculo_salida_id BIGINT,
    conductor_salida_id BIGINT,
    fecha_salida DATE,
    hora_salida TIME(0) WITHOUT TIME ZONE,

    -- Información del almacenamiento
    dias_almacenamiento INTEGER,
    monto_total DECIMAL(10, 2),
    estado VARCHAR(30) NOT NULL DEFAULT 'ALMACENADO',

    -- Otros
    observaciones TEXT,

    -- Auditoría
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Relaciones
    CONSTRAINT fk_guias_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id),

    CONSTRAINT fk_guias_contenedor
        FOREIGN KEY (contenedor_id)
        REFERENCES contenedores(id),

    CONSTRAINT fk_guias_empresa_transporte_ingreso
        FOREIGN KEY (empresa_transporte_ingreso_id)
        REFERENCES empresas_transporte(id),

    CONSTRAINT fk_guias_vehiculo_ingreso
        FOREIGN KEY (vehiculo_ingreso_id)
        REFERENCES vehiculos(id),

    CONSTRAINT fk_guias_conductor_ingreso
        FOREIGN KEY (conductor_ingreso_id)
        REFERENCES conductores(id),

    CONSTRAINT fk_guias_empresa_transporte_salida
        FOREIGN KEY (empresa_transporte_salida_id)
        REFERENCES empresas_transporte(id),

    CONSTRAINT fk_guias_vehiculo_salida
        FOREIGN KEY (vehiculo_salida_id)
        REFERENCES vehiculos(id),

    CONSTRAINT fk_guias_conductor_salida
        FOREIGN KEY (conductor_salida_id)
        REFERENCES conductores(id)
);

-- ============================================================
-- PAGOS
-- ============================================================

CREATE TABLE pagos (
    id BIGSERIAL PRIMARY KEY,

    cliente_id BIGINT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(30) NOT NULL,
    numero_operacion VARCHAR(100),
    fecha_pago DATE NOT NULL,
    hora_pago TIME(0) WITHOUT TIME ZONE NOT NULL,
    observaciones TEXT,

    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pagos_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_guias_cliente_id
    ON guias_internamiento(cliente_id);

CREATE INDEX idx_guias_contenedor_id
    ON guias_internamiento(contenedor_id);

CREATE INDEX idx_guias_empresa_transporte_ingreso_id
    ON guias_internamiento(empresa_transporte_ingreso_id);

CREATE INDEX idx_guias_vehiculo_ingreso_id
    ON guias_internamiento(vehiculo_ingreso_id);

CREATE INDEX idx_guias_conductor_ingreso_id
    ON guias_internamiento(conductor_ingreso_id);

CREATE INDEX idx_guias_empresa_transporte_salida_id
    ON guias_internamiento(empresa_transporte_salida_id);

CREATE INDEX idx_guias_vehiculo_salida_id
    ON guias_internamiento(vehiculo_salida_id);

CREATE INDEX idx_guias_conductor_salida_id
    ON guias_internamiento(conductor_salida_id);

CREATE INDEX idx_pagos_cliente_id
    ON pagos(cliente_id);