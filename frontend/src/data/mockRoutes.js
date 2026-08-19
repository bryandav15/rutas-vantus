export const mockRoutes = [
  {
    id: 5,
    numero: "Texcalac",
    color: "#10b981",
    nombre: "Texcalac - Apizaco Centro",
    origen: "Base Texcalac Centro",
    destino: "Terminal Apizaco",
    precio: 10.00,
    duracionMin: 18,
    calificacionPromedio: 4.9,
    totalCalificaciones: 18,
    ultimasResenias: [
      { id: 201, puntuacion: 5, comentario: "Pasa muy seguido frente a la iglesia de Texcalac.", nombreUsuario: "Rosa M.", fechaCreacion: new Date().toISOString() },
      { id: 202, puntuacion: 5, comentario: "Excelente combi, rápida y limpia.", nombreUsuario: "Jorge L.", fechaCreacion: new Date(Date.now() - 86400000).toISOString() }
    ],
    paradas: [
      { nombre: "Base Texcalac Centro", referencia: "Calle Hidalgo frente al parque y kiosco central", lat: 19.4350, lng: -98.1150 },
      { nombre: "Crucero Santa Anita", referencia: "Entronque carretera federal y gasolinera", lat: 19.4230, lng: -98.1300 },
      { nombre: "Terminal Apizaco", referencia: "Calle Cuauhtémoc frente a Farmacias Guadalajara", lat: 19.4128, lng: -98.1428 }
    ]
  },
  {
    id: 1,
    numero: "07",
    color: "#2F5233",
    nombre: "Apizaco - Tlaxcala Centro",
    origen: "Terminal Apizaco",
    destino: "Tlaxcala Centro",
    precio: 12.00,
    duracionMin: 25,
    calificacionPromedio: 4.8,
    totalCalificaciones: 24,
    ultimasResenias: [
      { id: 101, puntuacion: 5, comentario: "Combi muy puntual en las mañanas.", nombreUsuario: "Mariana G.", fechaCreacion: new Date().toISOString() }
    ],
    paradas: [
      { nombre: "Terminal Apizaco", referencia: "Calle Cuauhtémoc esq. 2 de Abril", lat: 19.4128, lng: -98.1428 },
      { nombre: "Panotla", referencia: "Entrada principal sobre autopista", lat: 19.3667, lng: -98.2000 },
      { nombre: "Tlaxcala Centro", referencia: "Parada Plaza Juárez frente a los Portales", lat: 19.3182, lng: -98.2374 }
    ]
  },
  {
    id: 2,
    numero: "12",
    color: "#C9A227",
    nombre: "Apizaco - Huamantla",
    origen: "Terminal Apizaco",
    destino: "Huamantla Centro",
    precio: 18.00,
    duracionMin: 35,
    calificacionPromedio: 4.6,
    totalCalificaciones: 12,
    paradas: [
      { nombre: "Terminal Apizaco", referencia: "Base Huamantla en Blvd. Emilio Sánchez Piedras", lat: 19.4128, lng: -98.1428 },
      { nombre: "Santa Cruz Tlaxcala", referencia: "Parada de la capilla", lat: 19.3850, lng: -98.0700 },
      { nombre: "Huamantla Centro", referencia: "Parque Juárez y Parroquia de San Luis", lat: 19.3106, lng: -97.9142 }
    ]
  },
  {
    id: 3,
    numero: "03",
    color: "#7A2E2E",
    nombre: "Apizaco - Chiautempan",
    origen: "Terminal Apizaco",
    destino: "Santa Ana Chiautempan",
    precio: 10.00,
    duracionMin: 20,
    calificacionPromedio: 4.5,
    totalCalificaciones: 8,
    paradas: [
      { nombre: "Terminal Apizaco", referencia: "Base mercado 12 de Mayo", lat: 19.4128, lng: -98.1428 },
      { nombre: "Yauhquemehcan", referencia: "Cruce San Dionisio", lat: 19.3800, lng: -98.1500 },
      { nombre: "Santa Ana Chiautempan", referencia: "Estación del Tren y Mercado de Artesanías", lat: 19.3167, lng: -98.1833 }
    ]
  },
  {
    id: 4,
    numero: "21",
    color: "#2F5233",
    nombre: "Apizaco - Santa Cruz Tlaxcala",
    origen: "Terminal Apizaco",
    destino: "Santa Cruz Tlaxcala",
    precio: 9.00,
    duracionMin: 15,
    calificacionPromedio: 4.7,
    totalCalificaciones: 6,
    paradas: [
      { nombre: "Terminal Apizaco", referencia: "Calle Aquiles Serdán", lat: 19.4128, lng: -98.1428 },
      { nombre: "Santa Cruz Tlaxcala", referencia: "Centro Vacacional La Trinidad", lat: 19.3850, lng: -98.0700 }
    ]
  }
];
