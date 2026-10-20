import { supabase } from './supabase.js';

// ==========================================================================
// ESTADO GLOBAL DEL CRM
// ==========================================================================
let currentCases = [];
let activeCaseId = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentUserEmail = 'holzeribarra@hotmail.com';
let isDemoMode = false;

// Instancias de Chart.js
let chartAreasInstance = null;
let chartEstadosInstance = null;
let chartAbogadosInstance = null;
let chartFinanzasInstance = null;

// Instancias de SortableJS
let sortableInstances = [];

// ==========================================================================
// BANCO DE CASOS REALISTAS DE SANTA FE (SEED DATA)
// ==========================================================================
const SANTA_FE_SAMPLE_CASES = [
  {
    id: "sf-001",
    nombre: "BENÍTEZ, CLAUDIA",
    caratula: "BENÍTEZ, CLAUDIA c/ IAPOS s/ AMPARO DE SALUD Y MEDIDA CAUTELAR",
    cuij: "21-02849182-3",
    area: "Amparo de Salud",
    juzgado: "Juzgado de Distrito Civil y Comercial 3° Nominación - Santa Fe",
    contraparte: "IAPOS (Instituto Autárquico Provincial de Obra Social)",
    abogado_contraparte: "Fiscalía de Estado de la Pcia. de Santa Fe",
    profesional_asignado: "Ma. Eugenia Ibarra",
    estado: "En proceso",
    telefono: "3425123456",
    email: "claudia.benitez@gmail.com",
    dni: "32.418.902",
    domicilio: "San Martín 2450, Santa Fe Capital",
    honorarios: 950000,
    pagado: 500000,
    aportes: 275500,
    tasasuc: 0,
    tag: "Urgente",
    tarea: {
      desc: "Presentar informe médico ampliatorio de cirujano de columna",
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Mañana
    },
    historial: [
      { date: "2026-10-18T10:30:00Z", text: "Dictada Medida Cautelar Innovativa ordenando cobertura integral de prótesis importada." },
      { date: "2026-10-12T09:15:00Z", text: "Presentación formal de Demanda de Amparo con habilitación de días y horas inhábiles." },
      { date: "2026-10-05T14:20:00Z", text: "Recepción del cliente e intimación prejudicial mediante Carta Documento." }
    ],
    mensaje: "Reclamo urgente contra IAPOS por negativa a suministrar prótesis de reemplazo discal cervical indicada por médico tratante.",
    created_at: "2026-10-05T14:20:00Z"
  },
  {
    id: "sf-002",
    nombre: "RODRÍGUEZ, JUAN MANUEL",
    caratula: "RODRÍGUEZ, JUAN MANUEL c/ ASOCIART ART S.A. s/ ACCIDENTE DE TRABAJO",
    cuij: "21-04918231-1",
    area: "Accidente Laboral / ART",
    juzgado: "Juzgado del Trabajo de la 2° Nominación - Santa Fe",
    contraparte: "Asociart ART S.A.",
    abogado_contraparte: "Dr. Roberto M. Gómez",
    profesional_asignado: "Luciano Holzer",
    estado: "En proceso",
    telefono: "3424891023",
    email: "jm.rodriguez.operario@outlook.com",
    dni: "29.740.118",
    domicilio: "Facundo Zuviría 4820, Santa Fe",
    honorarios: 1400000,
    pagado: 600000,
    aportes: 406000,
    tasasuc: 0,
    tag: "VIP",
    tarea: {
      desc: "Audiencia de peritaje médico traumatológico oficial",
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0] // Pasado mañana
    },
    historial: [
      { date: "2026-10-15T11:00:00Z", text: "Apertura a prueba en autos principales. Designación de perito médico traumatólogo." },
      { date: "2026-09-20T16:00:00Z", text: "Demanda judicial iniciada por incapacidad física residual del 24% (fractura expuesta)." }
    ],
    mensaje: "Accidente laboral in itinere en motocicleta mientras regresaba de su turno en planta fabril de Sauce Viejo.",
    created_at: "2026-09-15T09:00:00Z"
  },
  {
    id: "sf-003",
    nombre: "MÉNDEZ, MARÍA ESTHER",
    caratula: "MÉNDEZ, MARÍA ESTHER s/ SUCESIÓN AB INTESTATO",
    cuij: "21-01928374-9",
    area: "Sucesiones",
    juzgado: "Juzgado de Distrito Civil y Comercial 1° Nominación - Santa Fe",
    contraparte: "Ninguna (Proceso Voluntario)",
    abogado_contraparte: "-",
    profesional_asignado: "Luciano Holzer",
    estado: "En proceso",
    telefono: "3424119988",
    email: "herederos.mendez@hotmail.com",
    dni: "18.320.405",
    domicilio: "Bv. Gálvez 1420, Santa Fe",
    honorarios: 1800000,
    pagado: 1200000,
    aportes: 522000,
    tasasuc: 882000,
    tag: "Falta Documentación",
    tarea: {
      desc: "Inscribir hijuelas de partición en el Registro General de la Propiedad",
      date: new Date(Date.now() + 345600000).toISOString().split('T')[0]
    },
    historial: [
      { date: "2026-10-10T12:00:00Z", text: "Dictada Declaratoria de Herederos a favor de cónyuge supérstite y tres hijos." },
      { date: "2026-08-14T10:00:00Z", text: "Publicación de edictos cumplimentada en Boletín Oficial y diario local." }
    ],
    mensaje: "Sucesión de inmueble residencial en Barrio Candioti y dos vehículos.",
    created_at: "2026-08-01T10:30:00Z"
  },
  {
    id: "sf-004",
    nombre: "VALENZUELA, SILVIA",
    caratula: "VALENZUELA, SILVIA c/ MARTÍNEZ, PABLO s/ ALIMENTOS Y RÉGIMEN DE COMUNICACIÓN",
    cuij: "21-08192384-5",
    area: "Derecho de Familia",
    juzgado: "Tribunal Colegiado de Familia N° 2 - Santa Fe",
    contraparte: "Martínez, Pablo",
    abogado_contraparte: "Dra. Carolina Ríos",
    profesional_asignado: "Ma. Eugenia Ibarra",
    estado: "Negociacion",
    telefono: "3426987123",
    email: "silvia.valenzuela@gmail.com",
    dni: "34.120.940",
    domicilio: "Urquiza 3100, Santa Fe",
    honorarios: 750000,
    pagado: 450000,
    aportes: 217500,
    tasasuc: 0,
    tag: "Urgente",
    tarea: {
      desc: "Audiencia de mediación prejudicial para fijación de cuota alimentaria definitiva",
      date: new Date(Date.now() + 259200000).toISOString().split('T')[0]
    },
    historial: [
      { date: "2026-10-14T09:30:00Z", text: "Fijada cuota de alimentos provisorios equivalente al 25% de los haberes del demandado." }
    ],
    mensaje: "Fijación urgente de alimentos para dos hijos menores de edad e incumplimiento del régimen de comunicación.",
    created_at: "2026-09-28T11:00:00Z"
  },
  {
    id: "sf-005",
    nombre: "FERREIRA, CARLOS ALBERTO",
    caratula: "FERREIRA, CARLOS ALBERTO c/ SWISS MEDICAL S.A. s/ ACCIÓN DE AMPARO",
    cuij: "21-09823412-2",
    area: "Amparo de Salud",
    juzgado: "Juzgado Federal N° 1 de Santa Fe",
    contraparte: "Swiss Medical S.A.",
    abogado_contraparte: "Dr. Mariano Casal",
    profesional_asignado: "Ma. Eugenia Ibarra",
    estado: "En proceso",
    telefono: "3424771234",
    email: "carlos.ferreira@agencia.com",
    dni: "26.480.123",
    domicilio: "General Paz 5600, Santa Fe",
    honorarios: 1100000,
    pagado: 700000,
    aportes: 319000,
    tasasuc: 0,
    tag: "VIP",
    tarea: {
      desc: "Contestar traslado de informe del art. 8vo de Ley 16.986",
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    },
    historial: [
      { date: "2026-10-17T11:45:00Z", text: "Swiss Medical contesta informe de ley oponiendo falta de cobertura de medicamento fuera de PMO." },
      { date: "2026-10-09T08:30:00Z", text: "Juez federal ordena intimación bajo apercibimiento de astreintes diarias." }
    ],
    mensaje: "Negativa a cobertura de biológico de alto costo para artritis reumatoidea refractaria.",
    created_at: "2026-09-30T10:15:00Z"
  },
  {
    id: "sf-006",
    nombre: "LEIVA, JORGE OMAR",
    caratula: "LEIVA, JORGE OMAR c/ PREVENCIÓN ART S.A. s/ COBRO DE PESOS",
    cuij: "21-03918274-8",
    area: "Accidente Laboral / ART",
    juzgado: "Juzgado Laboral de la 4° Nominación - Santa Fe",
    contraparte: "Prevención ART S.A.",
    abogado_contraparte: "Dr. Federico Lanari",
    profesional_asignado: "Luciano Holzer",
    estado: "En proceso",
    telefono: "3425019283",
    email: "jorge.leiva@gmail.com",
    dni: "31.890.345",
    domicilio: "Aristóbulo del Valle 6200, Santa Fe",
    honorarios: 2100000,
    pagado: 1400000,
    aportes: 609000,
    tasasuc: 0,
    tag: "",
    tarea: {
      desc: "Alegar sobre la prueba pericial médica rendida",
      date: new Date(Date.now() + 432000000).toISOString().split('T')[0]
    },
    historial: [
      { date: "2026-10-02T13:00:00Z", text: "Perito médico oficial dictamina 28.5% de incapacidad laboral permanente." }
    ],
    mensaje: "Traumatismo severo de hombro y rodilla en industria metalúrgica.",
    created_at: "2026-07-15T09:30:00Z"
  },
  {
    id: "sf-007",
    nombre: "GIANOTTI, SUSANA",
    caratula: "GIANOTTI, SUSANA s/ SUCESIÓN TESTAMENTARIA",
    cuij: "21-01982736-4",
    area: "Sucesiones",
    juzgado: "Juzgado de Distrito Civil y Comercial 4° Nominación - Santa Fe",
    contraparte: "Sin contraparte",
    abogado_contraparte: "-",
    profesional_asignado: "Luciano Holzer",
    estado: "Cerrado",
    telefono: "3424128900",
    email: "gianotti.familia@gmail.com",
    dni: "14.902.115",
    domicilio: "25 de Mayo 1950, Santa Fe",
    honorarios: 1300000,
    pagado: 1300000,
    aportes: 377000,
    tasasuc: 637000,
    tag: "",
    tarea: {
      desc: "Expediente protocolizado y archivado",
      date: ""
    },
    historial: [
      { date: "2026-10-01T10:00:00Z", text: "Aprobación de cuenta particionaria e inscripción registral finalizada con éxito." }
    ],
    mensaje: "Testamento por acto público protocolizado y adjudicado.",
    created_at: "2026-06-10T12:00:00Z"
  },
  {
    id: "sf-008",
    nombre: "ALBORNOZ, HUGO",
    caratula: "ALBORNOZ, HUGO c/ COMPAÑÍA DE SEGUROS s/ DAÑOS Y PERJUICIOS",
    cuij: "21-05748392-7",
    area: "Derecho Civil",
    juzgado: "Juzgado Civil y Comercial 5° Nominación - Santa Fe",
    contraparte: "Sancor Seguros S.A.",
    abogado_contraparte: "Dr. Agustín Baroni",
    profesional_asignado: "Equipo",
    estado: "Nuevo",
    telefono: "3425443322",
    email: "hugo.albornoz@live.com",
    dni: "28.330.122",
    domicilio: "Rivadavia 3200, Santa Fe",
    honorarios: 800000,
    pagado: 150000,
    aportes: 232000,
    tasasuc: 392000,
    tag: "Falta Documentación",
    tarea: {
      desc: "Solicitar actuaciones administrativas de tránsito en Municipalidad de Santa Fe",
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0]
    },
    historial: [
      { date: "2026-10-19T14:00:00Z", text: "Cliente ingresa al estudio. Se recopila acta de choque y presupuesto mecánico." }
    ],
    mensaje: "Accidente de tránsito en Avenida Alem y 27 de Febrero con destrucción total de vehículo.",
    created_at: "2026-10-19T14:00:00Z"
  },
  {
    id: "sf-009",
    nombre: "SUÁREZ, ROMINA",
    caratula: "SUÁREZ, ROMINA c/ OSDE s/ AMPARO POR COBERTURA DE MEDICACIÓN ONCOLÓGICA",
    cuij: "21-08472910-6",
    area: "Amparo de Salud",
    juzgado: "Juzgado Federal N° 2 de Santa Fe",
    contraparte: "OSDE Organización de Servicios Directos Empresarios",
    abogado_contraparte: "Dra. Marcela P. Costa",
    profesional_asignado: "Ma. Eugenia Ibarra",
    estado: "En proceso",
    telefono: "3424109080",
    email: "romina.suarez@gmail.com",
    dni: "35.290.112",
    domicilio: "Castelli 1200, Santa Fe",
    honorarios: 1200000,
    pagado: 800000,
    aportes: 348000,
    tasasuc: 0,
    tag: "Urgente",
    tarea: {
      desc: "Controlar intimación de entrega de fármacos en farmacia de OSDE Santa Fe",
      date: new Date().toISOString().split('T')[0] // VENCE HOY!
    },
    historial: [
      { date: "2026-10-19T11:00:00Z", text: "Mandamiento de embargo preventivo trabado por falta de entrega de fármaco oncológico." }
    ],
    mensaje: "Tratamiento de quimioterapia demorado por falta de provisión de Nivolumab.",
    created_at: "2026-10-10T10:00:00Z"
  },
  {
    id: "sf-010",
    nombre: "CORONEL, MIGUEL ÁNGEL",
    caratula: "CORONEL, MIGUEL ÁNGEL c/ LA SEGUNDA ART S.A. s/ ENFERMEDAD PROFESIONAL",
    cuij: "21-06781293-1",
    area: "Accidente Laboral / ART",
    juzgado: "Juzgado Laboral 1° Nominación - Santa Fe",
    contraparte: "La Segunda ART S.A.",
    abogado_contraparte: "Dr. Lisandro V. Ortiz",
    profesional_asignado: "Luciano Holzer",
    estado: "Negociacion",
    telefono: "3425998877",
    email: "m.coronel@gmail.com",
    dni: "25.100.940",
    domicilio: "Gorriti 4100, Santa Fe",
    honorarios: 1300000,
    pagado: 400000,
    aportes: 377000,
    tasasuc: 0,
    tag: "",
    tarea: {
      desc: "Audiencia de conciliación ante el Servicio de Conciliación Laboral",
      date: new Date(Date.now() + 518400000).toISOString().split('T')[0]
    },
    historial: [
      { date: "2026-10-12T15:00:00Z", text: "Dictamen de Comisión Médica N° 7 determinando hipoacusia neurosensorial bilateral." }
    ],
    mensaje: "Reclamo de indemnización tarifada por hipoacusia laboral.",
    created_at: "2026-09-18T12:00:00Z"
  },
  {
    id: "sf-011",
    nombre: "GUTIÉRREZ, ESTEBAN",
    caratula: "GUTIÉRREZ, ESTEBAN c/ INC S.A. (CARREFOUR) s/ DAÑO DIRECTO",
    cuij: "21-09182374-2",
    area: "Derecho Civil",
    juzgado: "Juzgado de Circuito N° 1 - Santa Fe",
    contraparte: "INC S.A. (Carrefour)",
    abogado_contraparte: "Dr. Martín S. Varela",
    profesional_asignado: "Equipo",
    estado: "Nuevo",
    telefono: "3424018273",
    email: "esteban.gutierrez@yahoo.com.ar",
    dni: "37.401.992",
    domicilio: "Francia 2100, Santa Fe",
    honorarios: 500000,
    pagado: 150000,
    aportes: 145000,
    tasasuc: 245000,
    tag: "",
    tarea: {
      desc: "Solicitar fijación de audiencia testimonial",
      date: new Date(Date.now() + 691200000).toISOString().split('T')[0]
    },
    historial: [
      { date: "2026-10-18T09:00:00Z", text: "Causa iniciada en sede de Circuito. Traslado de demanda ordenado." }
    ],
    mensaje: "Reclamo por caída en escaleras mecánicas en hipermercado con lesión de meniscos.",
    created_at: "2026-10-16T15:00:00Z"
  },
  {
    id: "sf-012",
    nombre: "PASTORE, ANDREA",
    caratula: "PASTORE, ANDREA c/ ROMERO, GUSTAVO s/ DIVORCIO VINCULAR",
    cuij: "21-04829103-9",
    area: "Derecho de Familia",
    juzgado: "Tribunal de Familia N° 3 - Santa Fe",
    contraparte: "Romero, Gustavo",
    abogado_contraparte: "Dra. Patricia Rossi",
    profesional_asignado: "Ma. Eugenia Ibarra",
    estado: "Cerrado",
    telefono: "3425332211",
    email: "andrea.pastore@gmail.com",
    dni: "30.450.912",
    domicilio: "Suipacha 2700, Santa Fe",
    honorarios: 850000,
    pagado: 850000,
    aportes: 246500,
    tasasuc: 0,
    tag: "",
    tarea: {
      desc: "Sentencia firme inscripta",
      date: ""
    },
    historial: [
      { date: "2026-09-30T11:00:00Z", text: "Sentencia de Divorcio inscripta en Tomo 4 Folio 22 del Registro Civil." }
    ],
    mensaje: "Divorcio unilateral con convenio regulador aprobado.",
    created_at: "2026-07-20T10:00:00Z"
  }
];

// ==========================================================================
// INICIALIZACIÓN Y NAVEGACIÓN
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupEventListeners();
  setupKeyboardShortcuts();
  checkDarkMode();
  
  // Revisar si ya hay sesión de Supabase o sesión demo
  const isDemo = localStorage.getItem('crm_demo_mode') === 'true';
  if (isDemo) {
    enableDemoSession();
  } else {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        showDashboard(session.user.email);
      } else {
        showLogin();
      }
    } catch (e) {
      console.warn("Supabase session check fallback:", e);
      showLogin();
    }
  }
});

// Selector de Vistas
window.switchView = function(viewId) {
  document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
  
  const targetView = document.getElementById(viewId);
  const targetNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
  const targetBottom = document.querySelector(`.bottom-nav-item[data-view="${viewId}"]`);
  
  if (targetView) targetView.classList.add('active');
  if (targetNav) targetNav.classList.add('active');
  if (targetBottom) targetBottom.classList.add('active');

  // Trigger re-renders según vista
  if (viewId === 'view-dashboard') renderDashboard();
  if (viewId === 'view-expedientes') renderExpedientesTable();
  if (viewId === 'view-kanban') renderKanbanBoard();
  if (viewId === 'view-agenda') renderAgendaCalendar();
  if (viewId === 'view-finanzas') renderFinanzasView();
  if (viewId === 'view-escritos') populateDocSelector();
  if (viewId === 'view-directorio') renderDirectorio();
};

function setupNavigation() {
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const btnToggle = document.getElementById('btnMobileSidebarToggle');
  const btnClose = document.getElementById('btnMobileSidebarClose');
  const btnBottomNavMenu = document.getElementById('btnBottomNavMenu');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  }

  if (btnToggle) btnToggle.addEventListener('click', openSidebar);
  if (btnClose) btnClose.addEventListener('click', closeSidebar);
  if (backdrop) backdrop.addEventListener('click', closeSidebar);
  if (btnBottomNavMenu) btnBottomNavMenu.addEventListener('click', openSidebar);

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const viewId = item.getAttribute('data-view');
      if (viewId) window.switchView(viewId);
      if (window.innerWidth <= 900) {
        closeSidebar();
      }
    });
  });

  document.querySelectorAll('.bottom-nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => {
      const viewId = item.getAttribute('data-view');
      if (viewId) window.switchView(viewId);
    });
  });
}

// ==========================================================================
// AUTENTICACIÓN Y MODO DEMO
// ==========================================================================
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const btnQuickDemoLogin = document.getElementById('btnQuickDemoLogin');
const btnLogout = document.getElementById('btnLogout');
const userEmailSpan = document.getElementById('userEmailSpan');
const sidebarAvatar = document.getElementById('sidebarAvatar');

if (btnQuickDemoLogin) {
  btnQuickDemoLogin.addEventListener('click', () => {
    enableDemoSession();
  });
}

function enableDemoSession() {
  isDemoMode = true;
  localStorage.setItem('crm_demo_mode', 'true');
  showDashboard('demo.letrado@holzeribarra.com');
  seedLocalCasesIfEmpty();
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      localStorage.removeItem('crm_demo_mode');
      isDemoMode = false;
      showDashboard(email);
    } catch (err) {
      console.error(err);
      loginError.style.display = 'block';
      loginError.textContent = 'Error: ' + (err.message || 'Credenciales no válidas.');
    }
  });
}

if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    localStorage.removeItem('crm_demo_mode');
    isDemoMode = false;
    try { await supabase.auth.signOut(); } catch (e) {}
    showLogin();
  });
}

function showLogin() {
  if (loginSection) loginSection.style.display = 'flex';
  if (dashboardSection) dashboardSection.style.display = 'none';
}

function showDashboard(email) {
  currentUserEmail = email;
  if (loginSection) loginSection.style.display = 'none';
  if (dashboardSection) dashboardSection.style.display = 'flex';
  
  if (userEmailSpan) {
    if (email.includes('ibarra')) {
      userEmailSpan.textContent = 'Dra. Ma. Eugenia Ibarra';
      if (sidebarAvatar) sidebarAvatar.src = 'assets/eugenia.png';
      const sel = document.getElementById('activeLawyerFilter');
      if (sel) sel.value = 'Ma. Eugenia Ibarra';
    } else {
      userEmailSpan.textContent = 'Dr. Luciano Holzer';
      if (sidebarAvatar) sidebarAvatar.src = 'assets/luciano.png';
      const sel = document.getElementById('activeLawyerFilter');
      if (sel) sel.value = 'Luciano Holzer';
    }
  }

  loadCases();
}

// ==========================================================================
// CARGA Y SINCRONIZACIÓN DE CASOS
// ==========================================================================
async function loadCases() {
  let casesFromDb = [];
  
  if (!isDemoMode) {
    try {
      const { data, error } = await supabase
        .from('juridico_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Normalizamos datos de Supabase
        casesFromDb = data.map(item => normalizeCaseRecord(item));
      }
    } catch (e) {
      console.warn("Fallo lectura de Supabase, usando respaldo local:", e);
    }
  }

  // Si la DB tiene datos, los usamos. Si no, usamos localStorage o seed data
  if (casesFromDb.length > 0) {
    currentCases = casesFromDb;
  } else {
    const saved = localStorage.getItem('crm_local_cases');
    if (saved) {
      try {
        currentCases = JSON.parse(saved);
      } catch (e) {
        currentCases = [...SANTA_FE_SAMPLE_CASES];
      }
    } else {
      currentCases = [...SANTA_FE_SAMPLE_CASES];
      localStorage.setItem('crm_local_cases', JSON.stringify(currentCases));
    }
  }

  updateAllViews();
  checkNotifications();
}

function normalizeCaseRecord(item) {
  return {
    id: item.id,
    nombre: item.nombre || 'Sin Nombre',
    caratula: item.caratula || item.nombre || '',
    cuij: item.cuij || item.localidad || '21-0' + Math.floor(10000000 + Math.random() * 90000000) + '-0',
    area: item.area || 'Derecho Civil',
    juzgado: item.juzgado || 'Juzgado de Distrito - Santa Fe',
    contraparte: item.contraparte || 'Demandado',
    abogado_contraparte: item.abogado_contraparte || '-',
    profesional_asignado: item.profesional_asignado || item.profesional || 'Equipo',
    estado: item.estado || 'Nuevo',
    telefono: item.telefono || '',
    email: item.email || '',
    dni: item.dni || '',
    domicilio: item.domicilio || '',
    honorarios: parseFloat(item.honorarios) || 0,
    pagado: parseFloat(item.pagado) || 0,
    aportes: parseFloat(item.aportes) || 0,
    tasasuc: parseFloat(item.tasasuc || item.tasaSuc) || 0,
    tag: item.tag || '',
    tarea: item.tarea || null,
    historial: item.historial || [],
    mensaje: item.mensaje || '',
    created_at: item.created_at || new Date().toISOString()
  };
}

// Botón para sembrar datos demo con 1 click
const btnSeedDemoData = document.getElementById('btnSeedDemoData');
if (btnSeedDemoData) {
  btnSeedDemoData.addEventListener('click', async () => {
    if (confirm("¿Sincronizar y recargar las causas judiciales del estudio?")) {
      currentCases = [...SANTA_FE_SAMPLE_CASES];
      localStorage.setItem('crm_local_cases', JSON.stringify(currentCases));
      
      // Opcional: si hay sesión real de Supabase, podemos subir los casos
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          btnSeedDemoData.textContent = "Sincronizando con Supabase...";
          for (const c of SANTA_FE_SAMPLE_CASES) {
            await supabase.from('juridico_leads').upsert([{
              id: c.id.startsWith('sf-') ? undefined : c.id,
              nombre: c.nombre,
              telefono: c.telefono,
              localidad: c.cuij,
              area: c.area,
              profesional_asignado: c.profesional_asignado,
              mensaje: c.mensaje,
              estado: c.estado,
              origen: 'Estudio Santa Fe',
              tag: c.tag,
              tarea: c.tarea,
              historial: c.historial,
              honorarios: c.honorarios,
              pagado: c.pagado,
              aportes: c.aportes,
              tasasuc: c.tasasuc,
              dni: c.dni,
              domicilio: c.domicilio,
              email: c.email
            }]);
          }
          btnSeedDemoData.innerHTML = '<i class="fas fa-check"></i> ¡Sincronizado!';
          setTimeout(() => btnSeedDemoData.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizar Base Judicial', 2500);
        }
      } catch (err) {
        console.log("Seed local guardado:", err);
      }

      updateAllViews();
      alert("¡Causas judiciales cargadas con éxito! Las métricas, finanzas y agenda del estudio están actualizadas.");
    }
  });
}

function seedLocalCasesIfEmpty() {
  if (!localStorage.getItem('crm_local_cases')) {
    localStorage.setItem('crm_local_cases', JSON.stringify(SANTA_FE_SAMPLE_CASES));
    currentCases = [...SANTA_FE_SAMPLE_CASES];
  }
}

function updateAllViews() {
  renderDashboard();
  renderExpedientesTable();
  renderKanbanBoard();
  renderAgendaCalendar();
  renderFinanzasView();
  renderDirectorio();
  populateDocSelector();
  checkNotifications();
}

// ==========================================================================
// VISTA 1: DASHBOARD GENERAL & GRÁFICOS
// ==========================================================================
function renderDashboard() {
  const lawyerFilter = document.getElementById('activeLawyerFilter')?.value || 'Todos';
  
  let filtered = currentCases;
  if (lawyerFilter !== 'Todos') {
    filtered = filtered.filter(c => c.profesional_asignado === lawyerFilter);
  }

  // KPIs
  const activos = filtered.filter(c => c.estado !== 'Cerrado').length;
  const judicializados = filtered.filter(c => c.estado === 'En proceso').length;
  
  // Vencimientos en las próximas 48 horas
  const now = new Date();
  const limit48h = new Date(now.getTime() + (48 * 60 * 60 * 1000));
  const urgentes = filtered.filter(c => {
    if (!c.tarea || !c.tarea.date) return false;
    const taskDate = new Date(c.tarea.date + "T23:59:59");
    return taskDate >= now && taskDate <= limit48h;
  }).length;

  let totalHonorarios = 0;
  let totalCobrado = 0;
  filtered.forEach(c => {
    totalHonorarios += (parseFloat(c.honorarios) || 0);
    totalCobrado += (parseFloat(c.pagado) || 0);
  });
  const totalPendiente = totalHonorarios - totalCobrado;
  const porcentaje = totalHonorarios > 0 ? Math.round((totalCobrado / totalHonorarios) * 100) : 0;

  document.getElementById('kpiActivos').textContent = activos;
  document.getElementById('kpiActivosSub').textContent = `${judicializados} en trámite judicial`;
  document.getElementById('kpiUrgencias').textContent = urgentes;
  document.getElementById('kpiHonorarios').textContent = `$${totalHonorarios.toLocaleString('es-AR')}`;
  document.getElementById('kpiCobrado').textContent = `$${totalCobrado.toLocaleString('es-AR')}`;
  document.getElementById('kpiPorcentajeCobrado').textContent = `${porcentaje}% cobrado`;
  document.getElementById('kpiPendiente').textContent = `$${totalPendiente.toLocaleString('es-AR')}`;

  const sideBadgeExp = document.getElementById('sideBadgeExpedientes');
  if (sideBadgeExp) sideBadgeExp.textContent = currentCases.length;

  renderCharts(filtered);
}

function renderCharts(cases) {
  if (typeof Chart === 'undefined') return;

  // 1. Áreas
  const areasCount = {};
  cases.forEach(c => {
    const a = c.area || 'Otros';
    areasCount[a] = (areasCount[a] || 0) + 1;
  });

  const ctxAreas = document.getElementById('chartAreas');
  if (ctxAreas) {
    if (chartAreasInstance) chartAreasInstance.destroy();
    chartAreasInstance = new Chart(ctxAreas, {
      type: 'doughnut',
      data: {
        labels: Object.keys(areasCount),
        datasets: [{
          data: Object.values(areasCount),
          backgroundColor: ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'],
          borderWidth: 2,
          borderColor: document.body.classList.contains('dark-mode') ? '#0F1A2C' : '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  }

  // 2. Estados
  const estadosCount = { 'Nuevo': 0, 'En analisis': 0, 'Negociacion': 0, 'En proceso': 0, 'Cerrado': 0 };
  cases.forEach(c => {
    if (estadosCount[c.estado] !== undefined) estadosCount[c.estado]++;
  });

  const ctxEstados = document.getElementById('chartEstados');
  if (ctxEstados) {
    if (chartEstadosInstance) chartEstadosInstance.destroy();
    chartEstadosInstance = new Chart(ctxEstados, {
      type: 'pie',
      data: {
        labels: ['Recepción', 'En Análisis', 'Prejudicial', 'Judicial', 'Concluido'],
        datasets: [{
          data: Object.values(estadosCount),
          backgroundColor: ['#3B82F6', '#F59E0B', '#8B5CF6', '#2563EB', '#10B981'],
          borderWidth: 2,
          borderColor: document.body.classList.contains('dark-mode') ? '#0F1A2C' : '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  }

  // 3. Abogados
  const abogadosCount = { 'Luciano Holzer': 0, 'Ma. Eugenia Ibarra': 0, 'Equipo': 0 };
  cases.forEach(c => {
    const prof = c.profesional_asignado || 'Equipo';
    if (abogadosCount[prof] !== undefined) abogadosCount[prof]++;
    else abogadosCount['Equipo']++;
  });

  const ctxAbogados = document.getElementById('chartAbogados');
  if (ctxAbogados) {
    if (chartAbogadosInstance) chartAbogadosInstance.destroy();
    chartAbogadosInstance = new Chart(ctxAbogados, {
      type: 'bar',
      data: {
        labels: ['Dr. Holzer', 'Dra. Ibarra', 'Equipo General'],
        datasets: [{
          label: 'Expedientes',
          data: Object.values(abogadosCount),
          backgroundColor: ['#0A1F35', '#C5A059', '#64748B'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  // 4. Finanzas por Área
  const finanzasPorArea = {};
  cases.forEach(c => {
    const a = c.area || 'Otros';
    if (!finanzasPorArea[a]) finanzasPorArea[a] = { cobrado: 0, pendiente: 0 };
    const h = parseFloat(c.honorarios) || 0;
    const p = parseFloat(c.pagado) || 0;
    finanzasPorArea[a].cobrado += p;
    finanzasPorArea[a].pendiente += Math.max(0, h - p);
  });

  const ctxFinanzas = document.getElementById('chartFinanzas');
  if (ctxFinanzas) {
    if (chartFinanzasInstance) chartFinanzasInstance.destroy();
    chartFinanzasInstance = new Chart(ctxFinanzas, {
      type: 'bar',
      data: {
        labels: Object.keys(finanzasPorArea),
        datasets: [
          {
            label: 'Cobrado ($)',
            data: Object.values(finanzasPorArea).map(v => v.cobrado),
            backgroundColor: '#10B981',
            borderRadius: 6
          },
          {
            label: 'Saldo Pendiente ($)',
            data: Object.values(finanzasPorArea).map(v => v.pendiente),
            backgroundColor: '#F59E0B',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true },
          y: { stacked: true, ticks: { callback: val => '$' + (val / 1000) + 'k' } }
        }
      }
    });
  }
}

// ==========================================================================
// VISTA 2: EXPEDIENTES & CLIENTES (TABLA AVANZADA)
// ==========================================================================
function renderExpedientesTable() {
  const tbody = document.getElementById('tableExpedientesBody');
  if (!tbody) return;

  const searchVal = document.getElementById('globalSearchInput')?.value.toLowerCase().trim() || '';
  const filterEstado = document.getElementById('filterTableEstado')?.value || 'Todos';
  const filterArea = document.getElementById('filterTableArea')?.value || 'Todos';
  const filterAbogado = document.getElementById('filterTableAbogado')?.value || 'Todos';
  const filterUrgencia = document.getElementById('filterTableUrgencia')?.value || 'Todos';

  let filtered = currentCases;

  if (filterEstado !== 'Todos') filtered = filtered.filter(c => c.estado === filterEstado);
  if (filterArea !== 'Todos') filtered = filtered.filter(c => c.area === filterArea);
  if (filterAbogado !== 'Todos') filtered = filtered.filter(c => c.profesional_asignado === filterAbogado);

  if (filterUrgencia === 'Urgente') {
    const now = new Date();
    const limit48h = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    filtered = filtered.filter(c => {
      if (!c.tarea || !c.tarea.date) return false;
      const td = new Date(c.tarea.date + "T23:59:59");
      return td >= now && td <= limit48h;
    });
  } else if (filterUrgencia === 'ConTarea') {
    filtered = filtered.filter(c => c.tarea && c.tarea.date);
  } else if (filterUrgencia === 'SinTarea') {
    filtered = filtered.filter(c => !c.tarea || !c.tarea.date);
  }

  if (searchVal) {
    filtered = filtered.filter(c => 
      (c.nombre && c.nombre.toLowerCase().includes(searchVal)) ||
      (c.cuij && c.cuij.toLowerCase().includes(searchVal)) ||
      (c.telefono && c.telefono.includes(searchVal)) ||
      (c.juzgado && c.juzgado.toLowerCase().includes(searchVal)) ||
      (c.area && c.area.toLowerCase().includes(searchVal))
    );
  }

  const counter = document.getElementById('tableCounter');
  if (counter) counter.textContent = filtered.length;

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-muted);">No se encontraron expedientes con los filtros aplicados.</td></tr>`;
    return;
  }

  filtered.forEach(c => {
    const tr = document.createElement('tr');
    
    // Fecha formateada
    const d = new Date(c.created_at);
    const fechaStr = isNaN(d) ? 'Reciente' : d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });

    // Estado Badge
    let estadoBadge = '';
    if (c.estado === 'Nuevo') estadoBadge = '<span class="badge badge-blue">Nuevo</span>';
    else if (c.estado === 'En analisis') estadoBadge = '<span class="badge badge-amber">En Análisis</span>';
    else if (c.estado === 'Negociacion') estadoBadge = '<span class="badge badge-purple">Prejudicial</span>';
    else if (c.estado === 'En proceso') estadoBadge = '<span class="badge badge-blue" style="background:#DBEAFE; color:#1E40AF;">En Trámite</span>';
    else if (c.estado === 'Cerrado') estadoBadge = '<span class="badge badge-emerald">Concluido</span>';

    // Plazo / Tarea Semáforo
    let taskHtml = '<span style="color:var(--text-muted); font-size:0.8rem;">Sin fijar</span>';
    if (c.tarea && c.tarea.date) {
      const taskD = new Date(c.tarea.date + "T12:00:00");
      const diffDays = Math.ceil((taskD - new Date()) / (1000 * 60 * 60 * 24));
      let badgeClass = 'due-normal';
      let icon = '<i class="fas fa-calendar-check"></i>';
      
      if (diffDays < 0) {
        badgeClass = 'due-urgent';
        icon = '<i class="fas fa-exclamation-triangle"></i> Vencido';
      } else if (diffDays <= 2) {
        badgeClass = 'due-urgent';
        icon = '<i class="fas fa-bolt"></i> Urgente';
      } else if (diffDays <= 5) {
        badgeClass = 'due-warning';
        icon = '<i class="fas fa-clock"></i>';
      }

      taskHtml = `
        <div class="due-badge ${badgeClass}" title="${c.tarea.desc || ''}">
          ${icon} ${taskD.toLocaleDateString('es-AR')}
        </div>
      `;
    }

    // Finanzas resumen
    const saldo = Math.max(0, (parseFloat(c.honorarios) || 0) - (parseFloat(c.pagado) || 0));
    let finBadge = `<span style="font-size:0.8rem; font-weight:700; color:var(--emerald);"><i class="fas fa-check"></i> Al día</span>`;
    if (saldo > 0) {
      finBadge = `<span style="font-size:0.8rem; font-weight:700; color:var(--rose);"><i class="fas fa-exclamation-circle"></i> Resta $${saldo.toLocaleString('es-AR')}</span>`;
    }

    // Teléfono / WhatsApp limpio
    const cleanPhone = (c.telefono || '').replace(/\D/g, '');

    tr.innerHTML = `
      <td style="color:var(--text-muted); font-size:0.82rem;">${fechaStr}</td>
      <td>
        <strong style="color:var(--text-main); font-size:0.92rem;">${c.nombre}</strong>
        ${c.tag ? `<br><span class="badge badge-purple" style="font-size:0.68rem; margin-top:2px;">${c.tag}</span>` : ''}
      </td>
      <td>
        <span style="font-family:monospace; background:var(--bg-main); padding:2px 6px; border-radius:4px; font-size:0.75rem;">
          ${c.cuij || '21-00000000-0'}
        </span>
      </td>
      <td>
        <strong>${c.area}</strong><br>
        <span style="color:var(--text-muted); font-size:0.78rem;">${c.juzgado ? c.juzgado.substring(0, 30) + '...' : 'Tribunales SF'}</span>
      </td>
      <td>
        <span style="font-size:0.85rem; color:var(--text-secondary);">${c.profesional_asignado || 'Equipo'}</span>
      </td>
      <td>${taskHtml}</td>
      <td>${estadoBadge}</td>
      <td>${finBadge}</td>
      <td style="text-align: right;">
        <div style="display:inline-flex; gap:6px;">
          ${cleanPhone ? `
            <a href="https://wa.me/549${cleanPhone}" target="_blank" class="btn-icon" style="width:32px; height:32px; color:#25D366;" title="Escribir por WhatsApp">
              <i class="fab fa-whatsapp"></i>
            </a>
          ` : ''}
          <button class="btn btn-secondary btn-sm" onclick="window.openCaseModal('${c.id}')" style="padding:4px 10px; font-size:0.8rem;">
            Ver Ficha
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Filtros reactivos de tabla
['filterTableEstado', 'filterTableArea', 'filterTableAbogado', 'filterTableUrgencia', 'activeLawyerFilter'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', () => {
    renderExpedientesTable();
    renderDashboard();
  });
});

const globalSearchInput = document.getElementById('globalSearchInput');
if (globalSearchInput) {
  globalSearchInput.addEventListener('input', () => {
    renderExpedientesTable();
    renderKanbanBoard();
  });
}

// Exportación a Excel (.xlsx)
const btnExportExcel = document.getElementById('btnExportExcel');
if (btnExportExcel) {
  btnExportExcel.addEventListener('click', () => {
    if (currentCases.length === 0) {
      alert("No hay expedientes para exportar.");
      return;
    }

    const data = currentCases.map(c => ({
      "Carátula / Cliente": c.nombre,
      "CUIJ (N° Expte)": c.cuij,
      "Rama / Área": c.area,
      "Juzgado": c.juzgado,
      "Contraparte": c.contraparte,
      "Letrado Asignado": c.profesional_asignado,
      "Estado Procesal": c.estado,
      "Próximo Plazo": c.tarea ? c.tarea.date : '',
      "Tarea / Actuación": c.tarea ? c.tarea.desc : '',
      "Honorarios ($)": c.honorarios,
      "Percibido ($)": c.pagado,
      "Saldo Deudor ($)": Math.max(0, (c.honorarios || 0) - (c.pagado || 0)),
      "Teléfono": c.telefono,
      "Email": c.email,
      "DNI": c.dni
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 30 }, { wch: 20 }, { wch: 22 }, { wch: 35 }, { wch: 25 },
      { wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 35 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 12 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expedientes");
    XLSX.writeFile(wb, `Expedientes_Holzer_Ibarra_${new Date().toISOString().split('T')[0]}.xlsx`);
  });
}

// ==========================================================================
// VISTA 3: TABLERO PROCESAL (KANBAN CON DRAG & DROP)
// ==========================================================================
function renderKanbanBoard() {
  const columns = {
    'Nuevo': document.getElementById('kbCol-Nuevo'),
    'En analisis': document.getElementById('kbCol-Enanalisis'),
    'Negociacion': document.getElementById('kbCol-Negociacion'),
    'En proceso': document.getElementById('kbCol-Enproceso'),
    'Cerrado': document.getElementById('kbCol-Cerrado')
  };

  const counts = { 'Nuevo': 0, 'En analisis': 0, 'Negociacion': 0, 'En proceso': 0, 'Cerrado': 0 };

  // Limpiar columnas
  Object.values(columns).forEach(col => { if (col) col.innerHTML = ''; });

  const searchVal = document.getElementById('globalSearchInput')?.value.toLowerCase().trim() || '';

  currentCases.forEach(c => {
    if (searchVal && !c.nombre.toLowerCase().includes(searchVal) && !c.cuij.toLowerCase().includes(searchVal)) {
      return;
    }

    const col = columns[c.estado] || columns['Nuevo'];
    if (counts[c.estado] !== undefined) counts[c.estado]++;

    if (col) {
      const card = document.createElement('div');
      card.className = 'kanban-card';
      card.dataset.id = c.id;

      // Badge de plazo
      let dueHtml = '';
      if (c.tarea && c.tarea.date) {
        dueHtml = `<span class="due-badge due-normal" style="font-size:0.72rem; padding:2px 6px;">
          <i class="fas fa-clock"></i> ${c.tarea.date}
        </span>`;
      }

      const cleanPhone = (c.telefono || '').replace(/\D/g, '');

      card.innerHTML = `
        <div class="kanban-card-top">
          <span class="kanban-card-cuij">${c.cuij || '21-00000000-0'}</span>
          ${c.tag ? `<span class="badge badge-purple" style="font-size:0.65rem;">${c.tag}</span>` : ''}
        </div>
        <div class="kanban-card-title">${c.nombre}</div>
        <div class="kanban-card-meta">
          <div><i class="fas fa-balance-scale" style="color:var(--accent-gold); width:14px;"></i> ${c.area}</div>
          <div><i class="fas fa-user" style="color:var(--text-muted); width:14px;"></i> ${c.profesional_asignado}</div>
        </div>
        <div class="kanban-card-footer">
          <div>${dueHtml}</div>
          <div style="display:flex; gap:6px;">
            ${cleanPhone ? `
              <a href="https://wa.me/549${cleanPhone}" target="_blank" style="color:#25D366; font-size:1.1rem;" title="WhatsApp">
                <i class="fab fa-whatsapp"></i>
              </a>
            ` : ''}
            <button class="btn btn-secondary btn-sm" onclick="window.openCaseModal('${c.id}')" style="padding:2px 8px; font-size:0.75rem;">
              Ficha
            </button>
          </div>
        </div>
      `;
      col.appendChild(card);
    }
  });

  // Actualizar contadores
  document.getElementById('kbCount-Nuevo').textContent = counts['Nuevo'];
  document.getElementById('kbCount-Enanalisis').textContent = counts['En analisis'];
  document.getElementById('kbCount-Negociacion').textContent = counts['Negociacion'];
  document.getElementById('kbCount-Enproceso').textContent = counts['En proceso'];
  document.getElementById('kbCount-Cerrado').textContent = counts['Cerrado'];

  initKanbanSortables();
}

function initKanbanSortables() {
  sortableInstances.forEach(s => s.destroy());
  sortableInstances = [];

  const colContainers = document.querySelectorAll('.kanban-cards-container');
  colContainers.forEach(container => {
    const s = new Sortable(container, {
      group: 'kanban-process',
      animation: 180,
      ghostClass: 'sortable-ghost',
      onEnd: async function(evt) {
        const itemEl = evt.item;
        const newCol = evt.to.closest('.kanban-column');
        if (!newCol) return;

        const caseId = itemEl.dataset.id;
        const newStatus = newCol.getAttribute('data-status');
        const c = currentCases.find(x => x.id === caseId);

        if (c && c.estado !== newStatus) {
          const oldStatus = c.estado;
          c.estado = newStatus;
          
          const logEntry = {
            date: new Date().toISOString(),
            text: `[Procesal] Etapa cambiada de "${oldStatus}" a "${newStatus}".`
          };
          c.historial = c.historial ? [logEntry, ...c.historial] : [logEntry];

          saveCaseChanges(c);
          renderDashboard();
        }
      }
    });
    sortableInstances.push(s);
  });
}

// ==========================================================================
// VISTA 4: AGENDA JUDICIAL & CALENDARIO
// ==========================================================================
function renderAgendaCalendar() {
  const grid = document.getElementById('calendarGridCells');
  const monthLabel = document.getElementById('calMonthYearLabel');
  if (!grid || !monthLabel) return;

  grid.innerHTML = '';
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  monthLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const todayStr = new Date().toISOString().split('T')[0];

  // Celdas vacías previas
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-cell empty';
    grid.appendChild(empty);
  }

  // Días del mes
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    if (dateStr === todayStr) cell.classList.add('today');

    let eventsHtml = '';
    currentCases.forEach(c => {
      if (c.tarea && c.tarea.date === dateStr) {
        let color = '#2563EB'; // Azul
        if (c.tag === 'Urgente') color = '#EF4444';
        else if (c.area === 'Amparo de Salud') color = '#10B981';
        else if (c.area === 'Sucesiones') color = '#8B5CF6';

        eventsHtml += `
          <div class="cal-event-pill" style="background:${color};" onclick="event.stopPropagation(); window.openCaseModal('${c.id}')" title="${c.tarea.desc} - ${c.nombre}">
            <i class="fas fa-thumbtack"></i> ${c.nombre.split(',')[0]}
          </div>
        `;
      }
    });

    cell.innerHTML = `
      <div class="cal-day-num">${d}</div>
      <div style="flex:1; overflow-y:auto;">${eventsHtml}</div>
    `;

    cell.addEventListener('click', () => {
      const clientName = prompt(`Agendar nuevo vencimiento procesal para el día ${dateStr}.\n\nSeleccione cliente o ingrese nombre:`);
      if (clientName) {
        const desc = prompt("Descripción del plazo procesal o audiencia:");
        if (desc) {
          let found = currentCases.find(c => c.nombre.toLowerCase().includes(clientName.toLowerCase()));
          if (!found) {
            found = currentCases[0];
          }
          if (found) {
            found.tarea = { desc: desc, date: dateStr };
            found.historial.unshift({ date: new Date().toISOString(), text: `[Agenda] Plazo procesal fijado para el ${dateStr}: ${desc}` });
            saveCaseChanges(found);
            renderAgendaCalendar();
            checkNotifications();
            alert(`Plazo fijado con éxito para ${found.nombre}.`);
          }
        }
      }
    });

    grid.appendChild(cell);
  }
}

document.getElementById('btnCalPrev')?.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderAgendaCalendar();
});

document.getElementById('btnCalNext')?.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderAgendaCalendar();
});

document.getElementById('btnAgendaToday')?.addEventListener('click', () => {
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  renderAgendaCalendar();
});

// ==========================================================================
// VISTA 5: FINANZAS & RECIBOS OFICIALES
// ==========================================================================
function renderFinanzasView() {
  const tbody = document.getElementById('tableFinanzasBody');
  if (!tbody) return;

  const searchVal = document.getElementById('searchFinanzas')?.value.toLowerCase().trim() || '';
  let filtered = currentCases;
  if (searchVal) {
    filtered = filtered.filter(c => 
      c.nombre.toLowerCase().includes(searchVal) || 
      (c.cuij && c.cuij.toLowerCase().includes(searchVal)) ||
      (c.area && c.area.toLowerCase().includes(searchVal))
    );
  }

  let totalH = 0;
  let totalP = 0;
  let totalA = 0;

  tbody.innerHTML = '';

  filtered.forEach(c => {
    const h = parseFloat(c.honorarios) || 0;
    const p = parseFloat(c.pagado) || 0;
    const s = Math.max(0, h - p);
    const ap = parseFloat(c.aportes) || Math.round(h * 0.29);
    const ts = parseFloat(c.tasasuc) || (c.area === 'Sucesiones' ? Math.round(h * 0.49) : 0);

    totalH += h;
    totalP += p;
    totalA += ap;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.nombre}</strong><br><small style="color:var(--text-muted);">${c.cuij}</small></td>
      <td>${c.area}</td>
      <td>$${h.toLocaleString('es-AR')}</td>
      <td style="color:var(--emerald); font-weight:700;">$${p.toLocaleString('es-AR')}</td>
      <td style="color:${s > 0 ? 'var(--rose)' : 'var(--text-muted)'}; font-weight:700;">$${s.toLocaleString('es-AR')}</td>
      <td style="color:var(--text-secondary);">$${ap.toLocaleString('es-AR')}</td>
      <td style="color:var(--text-secondary);">$${ts.toLocaleString('es-AR')}</td>
      <td style="text-align: right;">
        <button class="btn btn-secondary btn-sm" onclick="window.generateReceiptForCase('${c.id}')" style="font-size:0.78rem;">
          <i class="fas fa-receipt"></i> Recibo
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('finTotalHonorarios').textContent = `$${totalH.toLocaleString('es-AR')}`;
  document.getElementById('finTotalCobrado').textContent = `$${totalP.toLocaleString('es-AR')}`;
  document.getElementById('finTotalSaldo').textContent = `$${(totalH - totalP).toLocaleString('es-AR')}`;
  document.getElementById('finTotalAportes').textContent = `$${totalA.toLocaleString('es-AR')}`;
}

document.getElementById('searchFinanzas')?.addEventListener('input', renderFinanzasView);

window.generateReceiptForCase = function(caseId) {
  const c = currentCases.find(x => x.id === caseId);
  if (!c) return;

  const modal = document.getElementById('receiptModal');
  if (!modal) return;

  document.getElementById('reciboNumero').textContent = `0001-0000${Math.floor(10 + Math.random() * 89)}`;
  document.getElementById('reciboFecha').textContent = new Date().toLocaleDateString('es-AR');
  document.getElementById('reciboCliente').textContent = c.nombre;
  document.getElementById('reciboDNI').textContent = c.dni || '28.450.120';
  document.getElementById('reciboCaratula').textContent = c.caratula || c.nombre;
  
  const montoCobrado = c.pagado > 0 ? c.pagado : 150000;
  document.getElementById('reciboMontoNumero').textContent = `$${montoCobrado.toLocaleString('es-AR')}`;
  document.getElementById('reciboMontoTexto').textContent = numeroALetras(montoCobrado).toUpperCase();

  modal.style.display = 'flex';
};

window.printReceipt = function() {
  const printContent = document.getElementById('receiptPrintArea').innerHTML;
  const original = document.body.innerHTML;
  
  document.body.innerHTML = `
    <div style="padding:40px; font-family:serif;">
      ${printContent}
    </div>
  `;
  window.print();
  document.body.innerHTML = original;
  window.location.reload();
};

// ==========================================================================
// VISTA 6: CALCULADORA JUDICIAL DE SANTA FE
// ==========================================================================
function setupCalculator() {
  const jusInput = document.getElementById('calcJusUnitValue');
  const qtyInput = document.getElementById('calcJusQuantity');
  const presetSelect = document.getElementById('calcJusPreset');

  function updateJUS() {
    const unit = parseFloat(jusInput?.value) || 85450;
    const qty = parseFloat(qtyInput?.value) || 10;
    const total = unit * qty;
    const aportes = Math.round(total * 0.29);

    const totalEl = document.getElementById('calcJusTotalPesos');
    const aportesEl = document.getElementById('calcJusAportes');

    if (totalEl) totalEl.textContent = `$${total.toLocaleString('es-AR')}`;
    if (aportesEl) aportesEl.textContent = `$${aportes.toLocaleString('es-AR')}`;
  }

  if (jusInput) jusInput.addEventListener('input', updateJUS);
  if (qtyInput) qtyInput.addEventListener('input', updateJUS);

  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const val = presetSelect.value;
      if (val !== 'custom') {
        qtyInput.value = val;
        updateJUS();
      }
    });
  }

  // ART Formula
  const artIBM = document.getElementById('calcArtIBM');
  const artEdad = document.getElementById('calcArtEdad');
  const artIncap = document.getElementById('calcArtIncapacidad');

  function updateART() {
    const ibm = parseFloat(artIBM?.value) || 450000;
    const edad = parseFloat(artEdad?.value) || 38;
    const incap = (parseFloat(artIncap?.value) || 18) / 100;

    // Formula: 53 * IBM * Incapacidad * (65 / Edad)
    const total = Math.round(53 * ibm * incap * (65 / edad));
    const totalEl = document.getElementById('calcArtTotal');
    if (totalEl) totalEl.textContent = `$${total.toLocaleString('es-AR')}`;
  }

  if (artIBM) artIBM.addEventListener('input', updateART);
  if (artEdad) artEdad.addEventListener('input', updateART);
  if (artIncap) artIncap.addEventListener('input', updateART);

  // Intereses
  const intCap = document.getElementById('calcIntCapital');
  const intFecha = document.getElementById('calcIntFechaInicio');
  const intTasa = document.getElementById('calcIntTasa');

  function updateIntereses() {
    const cap = parseFloat(intCap?.value) || 1000000;
    const fStr = intFecha?.value || '2025-01-01';
    const tasa = (parseFloat(intTasa?.value) || 72) / 100;

    const dStart = new Date(fStr);
    const dNow = new Date();
    const diffDays = Math.max(1, Math.round((dNow - dStart) / (1000 * 60 * 60 * 24)));
    const años = diffDays / 365;

    const intereses = Math.round(cap * tasa * años);
    const totalFinal = cap + intereses;

    document.getElementById('calcIntIntereses').textContent = `$${intereses.toLocaleString('es-AR')}`;
    document.getElementById('calcIntTotalFinal').textContent = `$${totalFinal.toLocaleString('es-AR')}`;
  }

  if (intCap) intCap.addEventListener('input', updateIntereses);
  if (intFecha) intFecha.addEventListener('change', updateIntereses);
  if (intTasa) intTasa.addEventListener('input', updateIntereses);

  updateJUS();
  updateART();
  updateIntereses();
}

// ==========================================================================
// VISTA 7: GENERADOR DE ESCRITOS & WORD (.DOC)
// ==========================================================================
function populateDocSelector() {
  const select = document.getElementById('docLeadSelect');
  if (!select) return;

  select.innerHTML = '<option value="">Seleccione un expediente para autocompletar...</option>';
  currentCases.forEach(c => {
    select.innerHTML += `<option value="${c.id}">${c.nombre} (${c.area})</option>`;
  });

  generateDocument();
}

function generateDocument() {
  const tpl = document.getElementById('docTemplateSelect')?.value || 'poder';
  const nombre = document.getElementById('docFieldNombre')?.value || 'BENÍTEZ, CLAUDIA';
  const dni = document.getElementById('docFieldDNI')?.value || '32.418.902';
  const dom = document.getElementById('docFieldDomicilio')?.value || 'San Martín 2450, Santa Fe Capital';
  const contraparte = document.getElementById('docFieldContraparte')?.value || 'IAPOS';
  const dateStr = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  let text = '';

  if (tpl === 'poder') {
    text = `PODER ESPECIAL JUDICIAL PARA JUICIOS
(Válido ante los Tribunales Provinciales de Santa Fe y Federales)

En la ciudad de Santa Fe, Provincia de Santa Fe, a los ${dateStr}, comparece por una parte el/la Sr./Sra. ${nombre}, DNI N° ${dni}, con domicilio real sito en ${dom}, y MANIFIESTA:

Que por el presente instrumento confiere PODER ESPECIAL PARA JUICIOS a favor de los Doctores LUCIANO HOLZER (Mat. Colegiada Tomo XII, Folio 140) y MARÍA EUGENIA IBARRA (Mat. Colegiada Tomo XIV, Folio 88), miembros del ESTUDIO JURÍDICO HOLZER & IBARRA, con domicilio procesal constituido en calle La Rioja 2751 de esta ciudad, para que en su nombre y representación promuevan, prosigan y contesten toda clase de acciones y demandas contra ${contraparte}, y/o quien resulte civilmente o jurídicamente responsable.

A tal efecto, les faculta ampliamente para presentarse ante los Juzgados de Primera Instancia, Cámaras de Apelaciones y la Excma. Corte Suprema de Justicia de la Provincia de Santa Fe, como así también ante el Fuero Federal; deducir amparos, medidas cautelares, peticionar autos, interponer recursos de reposición y apelación, absolver y poner posiciones, percibir y dar recibos, ofrecer prueba, transar judicial o extrajudicialmente y realizar cuantos actos procesales fueren conducentes para el mejor cumplimiento del presente mandato.

Con lo que terminó el acto, firmando el compareciente de conformidad previa lectura y ratificación.


_____________________________                  _____________________________
Firma del Poderdante                            Sello y Firma Letrado Aceptante
DNI: ${dni}                                      Colegio de Abogados de Santa Fe`;
  } else if (tpl === 'carta_salud') {
    text = `CARTA DOCUMENTO - INTIMACIÓN PERENTORIA DE COBERTURA MÉDICA
(Ley de Amparo y Ley 24.901 / Defensa del Consumidor)

REMITENTE: ${nombre} - DNI: ${dni}
DOMICILIO REAL: ${dom}
DESTINATARIO: ${contraparte} (Auditoría Médica y Asuntos Jurídicos)

Por medio de la presente, en mi carácter de afiliado/beneficiario de vuestra entidad, formalmente y con expresa reserva de accionar judicialmente mediante ACCIÓN DE AMPARO CON MEDIDA CAUTELAR INNOVATIVA (Art. 43 Constitución Nacional y Art. 17 Constitución de Santa Fe), los INTIMO a que en el plazo perentorio e improrrogable de CUARENTA Y OCHO (48) HORAS de notificada la presente, autoricen y provean la COBERTURA INTEGRAL AL 100% de la prestación médica y material quirúrgico prescripto por mi médico tratante.

Dicha prestación resulta de urgente necesidad médica para preservar mi integridad psicofísica y derecho constitucional a la salud y a la vida. La injustificada dilación u omisión en la autorización constituye una flagrante vulneración al Programa Médico Obligatorio (PMO) y a la jurisprudencia unánime en materia de amparos de salud.

Vencido el plazo otorgado sin respuesta favorable, quedarán automáticamente expeditas las vías judiciales pertinentes con más la traba de astreintes conminatorias y la denuncia por daño punitivo en los términos del Art. 52 bis de la Ley 24.240.

Quedan Uds. debidamente notificados e intimados.

Santa Fe, ${dateStr}.`;
  } else if (tpl === 'carta_art') {
    text = `CARTA DOCUMENTO - RECHAZO DE ALTA MÉDICA Y RECLAMO DE INCAPACIDAD
(Ley 24.557 de Riesgos del Trabajo)

REMITENTE: ${nombre} - DNI: ${dni}
DOMICILIO: ${dom}
DESTINATARIO: ${contraparte}

Por medio de la presente vengo a RECHAZAR en todos sus términos el alta médica prematura sin incapacidad que me fuera notificada con fecha reciente relativa al siniestro laboral denunciado, en razón de encontrarme aún imposibilitado de reintegrarme a mis labores habituales y persistir las dolencias y limitación funcional derivadas del infortunio laboral.

En consecuencia, los INTIMO a que en el plazo de 48 horas me reintegren las correspondientes prestaciones en especie (asistencia médica, kinesiología y farmacología) y procedan a fijar audiencia ante la Comisión Médica Jurisdiccional N° 7 de Santa Fe a los efectos de determinar el porcentaje de Incapacidad Laboral Permanente Parcial definitiva que me corresponde, con liquidación de la indemnización tarifada correspondiente más los intereses de ley.

Constituyo domicilio legal conjunto con mis letrados patrocinantes del Estudio Jurídico Holzer & Ibarra en calle La Rioja 2751 de la ciudad de Santa Fe.

Quedan legalmente intimados.`;
  } else if (tpl === 'amparo') {
    text = `PROMUEVE ACCIÓN DE AMPARO DE SALUD. SOLICITA MEDIDA CAUTELAR INNOVATIVA.

Señor Juez:

${nombre}, DNI N° ${dni}, por derecho propio, con domicilio real en ${dom}, con el patrocinio letrado de los Dres. LUCIANO HOLZER y MARÍA EUGENIA IBARRA, constituyendo domicilio ad-litem en calle La Rioja 2751 de esta ciudad de Santa Fe, ante V.S. respetuosamente me presento y digo:

I. OBJETO:
Que en los términos del Art. 43 de la Constitución Nacional, Art. 17 de la Constitución de Santa Fe y Ley 16.986, vengo en tiempo y forma a promover formal ACCIÓN EXPEDITA Y RÁPIDA DE AMPARO contra ${contraparte}, a fin de que se ordene a la demandada la provisión inmediata y cobertura al 100% de la prótesis / medicamento prescripto, con costas a la contraria.

II. MEDIDA CAUTELAR INNOVATIVA URGENTE:
Dado el inminente peligro en la demora (periculum in mora) acreditado con los certificados médicos adjuntos y la palmaria verosimilitud en el derecho (fumus boni iuris), solicito a V.S. ordene como MEDIDA CAUTELAR IN SITU a ${contraparte} que proceda en el término de 24 horas a proveer la cobertura solicitada bajo apercibimiento de astreintes diarias por cada día de retraso.

III. PETITORIO:
Por todo lo expuesto, a V.S. solicito:
1. Me tenga por presentado, por parte y con el domicilio legal constituido.
2. Tenga por promovida la presente acción de amparo con la prueba documental acompañada.
3. Se haga lugar a la Medida Cautelar Innovativa solicitada.
4. Oportunamente dicte sentencia haciendo lugar íntegramente al amparo, con costas.

SERÁ JUSTICIA.`;
  } else if (tpl === 'cuota_litis') {
    text = `CONVENIO DE HONORARIOS PROFESIONALES (PACTO DE CUOTA LITIS)
(Ley 12.851 Aranceles de Abogados de la Provincia de Santa Fe)

Entre el/la Sr./Sra. ${nombre}, DNI N° ${dni}, por una parte (en adelante el "CLIENTE"), y por la otra los Dres. LUCIANO HOLZER y MARÍA EUGENIA IBARRA (en adelante los "LETRADOS"), se conviene celebrar el presente Pacto de Cuota Litis sujeto a las siguientes cláusulas:

PRIMERA: El CLIENTE encomienda a los LETRADOS la atención profesional integral de las gestiones prejudiciales y el juicio contra ${contraparte}.
SEGUNDA: En concepto de honorarios profesionales por la labor a desarrollar, las partes pactan libremente una cuota litis equivalente al VEINTE POR CIENTO (20%) del total de los montos de condena o de acuerdo transaccional que efectivamente se perciban en capital e intereses.
TERCERA: Los aportes previsionales de la Caja Forense (29%) e impuestos de ley serán soportados conforme las pautas arancelarias aplicables.

En prueba de conformidad, se firman dos ejemplares de un mismo tenor y a un solo efecto en la ciudad de Santa Fe, a los ${dateStr}.`;
  }

  const outputEl = document.getElementById('docOutputContent');
  if (outputEl) outputEl.textContent = text;
}

// Eventos del Generador de Escritos
document.getElementById('docTemplateSelect')?.addEventListener('change', generateDocument);
document.getElementById('btnGenerateDocument')?.addEventListener('click', generateDocument);

document.getElementById('docLeadSelect')?.addEventListener('change', (e) => {
  const caseId = e.target.value;
  const c = currentCases.find(x => x.id === caseId);
  if (c) {
    document.getElementById('docFieldNombre').value = c.nombre;
    document.getElementById('docFieldDNI').value = c.dni || '';
    document.getElementById('docFieldDomicilio').value = c.domicilio || '';
    document.getElementById('docFieldContraparte').value = c.contraparte || '';
    generateDocument();
  }
});

// Descarga en Word (.doc con XML formal)
document.getElementById('btnDownloadWordDoc')?.addEventListener('click', () => {
  const text = document.getElementById('docOutputContent')?.textContent;
  if (!text) return;

  const clientName = document.getElementById('docFieldNombre')?.value || 'Documento';
  const formattedHtml = text.replace(/\n/g, '<br>');

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Escrito Jurídico</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; text-align: justify; }
        .header { text-align: center; border-bottom: 2pt solid #C5A059; padding-bottom: 12pt; margin-bottom: 24pt; }
        .header h1 { font-family: Arial, sans-serif; font-size: 16pt; color: #0A1F35; margin: 0; }
        .header p { font-family: Arial, sans-serif; font-size: 9pt; color: #64748B; margin: 4pt 0 0 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ESTUDIO JURÍDICO HOLZER & IBARRA</h1>
        <p>La Rioja 2751, Santa Fe Capital | Tel: (0342) 423-1401 | contacto@holzeribarra.com</p>
      </div>
      <div>${formattedHtml}</div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Escrito_${clientName.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

document.getElementById('btnCopyDocText')?.addEventListener('click', () => {
  const text = document.getElementById('docOutputContent')?.textContent;
  if (text) {
    navigator.clipboard.writeText(text);
    alert("¡Texto copiado al portapapeles!");
  }
});

document.getElementById('btnPrintDoc')?.addEventListener('click', () => {
  const content = document.getElementById('docPrintableArea')?.innerHTML;
  const orig = document.body.innerHTML;
  document.body.innerHTML = `<div style="padding:40px; font-family:serif;">${content}</div>`;
  window.print();
  document.body.innerHTML = orig;
  window.location.reload();
});

// ==========================================================================
// VISTA 8: DIRECTORIO DE CONTACTOS
// ==========================================================================
function renderDirectorio() {
  const container = document.getElementById('directorioCardsContainer');
  if (!container) return;

  const searchVal = document.getElementById('searchDirectorio')?.value.toLowerCase().trim() || '';
  container.innerHTML = '';

  let filtered = currentCases;
  if (searchVal) {
    filtered = filtered.filter(c => 
      c.nombre.toLowerCase().includes(searchVal) || 
      (c.telefono && c.telefono.includes(searchVal))
    );
  }

  filtered.forEach(c => {
    const cleanPhone = (c.telefono || '').replace(/\D/g, '');
    const card = document.createElement('div');
    card.className = 'calc-box';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.justifyContent = 'space-between';

    card.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <h4 style="margin:0; font-size:1.05rem; color:var(--text-main);">${c.nombre}</h4>
          <span class="badge badge-blue" style="font-size:0.7rem;">${c.area}</span>
        </div>
        <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:6px;">
          <i class="fas fa-id-card" style="width:16px; color:var(--text-muted);"></i> DNI: ${c.dni || 'No registrado'}
        </div>
        <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:6px;">
          <i class="fas fa-envelope" style="width:16px; color:var(--text-muted);"></i> ${c.email || 'Sin correo'}
        </div>
        <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:12px;">
          <i class="fas fa-map-marker-alt" style="width:16px; color:var(--text-muted);"></i> ${c.domicilio || 'Santa Fe'}
        </div>
      </div>
      <div style="display:flex; gap:8px; padding-top:12px; border-top:1px solid var(--border-light);">
        ${cleanPhone ? `
          <a href="https://wa.me/549${cleanPhone}" target="_blank" class="btn btn-emerald btn-sm" style="flex:1; background:#25D366; color:white;">
            <i class="fab fa-whatsapp"></i> WhatsApp
          </a>
          <a href="tel:${cleanPhone}" class="btn btn-secondary btn-sm" style="width:40px;">
            <i class="fas fa-phone"></i>
          </a>
        ` : ''}
        <button class="btn btn-secondary btn-sm" onclick="window.openCaseModal('${c.id}')" style="flex:1;">
          Ver Ficha
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

document.getElementById('searchDirectorio')?.addEventListener('input', renderDirectorio);

// ==========================================================================
// MODAL FICHA 360° DEL EXPEDIENTE
// ==========================================================================
window.openCaseModal = function(caseId) {
  const c = currentCases.find(x => x.id === caseId);
  if (!c) return;

  activeCaseId = caseId;
  const modal = document.getElementById('caseModal');
  if (!modal) return;

  document.getElementById('modalAreaBadge').textContent = c.area;
  document.getElementById('modalClientName').textContent = c.nombre;
  document.getElementById('modalCUIJBadge').textContent = `CUIJ: ${c.cuij || '21-00000000-0'}`;

  // General
  document.getElementById('modalJuzgadoInput').value = c.juzgado || '';
  document.getElementById('modalContraparteInput').value = c.contraparte || '';
  document.getElementById('modalAbogadoContraparteInput').value = c.abogado_contraparte || '';
  document.getElementById('modalAbogadoSelect').value = c.profesional_asignado || 'Equipo';
  document.getElementById('modalEstadoSelect').value = c.estado || 'Nuevo';
  document.getElementById('modalTaskDesc').value = c.tarea ? c.tarea.desc : '';
  document.getElementById('modalTaskDate').value = c.tarea ? c.tarea.date : '';

  document.getElementById('modalTelefonoInput').value = c.telefono || '';
  document.getElementById('modalEmailInput').value = c.email || '';
  document.getElementById('modalDNIInput').value = c.dni || '';
  document.getElementById('modalDomicilioInput').value = c.domicilio || '';

  // Finanzas
  document.getElementById('modalFinHonorarios').value = c.honorarios || 0;
  document.getElementById('modalFinPagado').value = c.pagado || 0;
  document.getElementById('modalFinAportes').value = c.aportes || Math.round((c.honorarios || 0) * 0.29);
  document.getElementById('modalFinTasa').value = c.tasasuc || 0;
  updateModalSaldo();

  // Bitácora
  renderBitacoraTimeline(c.historial || []);

  // WhatsApp preview
  updateWaTemplatePreview(c);

  modal.style.display = 'flex';
};

function updateModalSaldo() {
  const h = parseFloat(document.getElementById('modalFinHonorarios')?.value) || 0;
  const p = parseFloat(document.getElementById('modalFinPagado')?.value) || 0;
  const saldo = Math.max(0, h - p);
  const saldoEl = document.getElementById('modalFinSaldoCalculado');
  if (saldoEl) saldoEl.textContent = `$${saldo.toLocaleString('es-AR')}`;
}

document.getElementById('modalFinHonorarios')?.addEventListener('input', updateModalSaldo);
document.getElementById('modalFinPagado')?.addEventListener('input', updateModalSaldo);

function renderBitacoraTimeline(historial) {
  const container = document.getElementById('bitacoraTimeline');
  if (!container) return;
  container.innerHTML = '';

  if (historial.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding:12px;">No hay actuaciones registradas aún.</div>';
    return;
  }

  historial.forEach(item => {
    const div = document.createElement('div');
    div.style.cssText = 'background:var(--bg-main); padding:10px 14px; border-radius:8px; border:1px solid var(--border); font-size:0.85rem;';
    const dateStr = new Date(item.date).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
      <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; margin-bottom:4px;">${dateStr}</div>
      <div style="color:var(--text-main);">${item.text}</div>
    `;
    container.appendChild(div);
  });
}

// Agregar actuación a la bitácora
document.getElementById('btnAddBitacora')?.addEventListener('click', () => {
  const input = document.getElementById('bitacoraTextInput');
  const tipo = document.getElementById('bitacoraTipoSelect')?.value || 'Escrito';
  if (!input || !input.value.trim() || !activeCaseId) return;

  const c = currentCases.find(x => x.id === activeCaseId);
  if (!c) return;

  const entry = {
    date: new Date().toISOString(),
    text: `[${tipo.toUpperCase()}] ${input.value.trim()}`
  };
  c.historial = c.historial ? [entry, ...c.historial] : [entry];
  input.value = '';
  renderBitacoraTimeline(c.historial);
  saveCaseChanges(c);
});

// Guardar cambios del expediente
document.getElementById('btnSaveCaseModal')?.addEventListener('click', () => {
  if (!activeCaseId) return;
  const c = currentCases.find(x => x.id === activeCaseId);
  if (!c) return;

  c.juzgado = document.getElementById('modalJuzgadoInput').value;
  c.contraparte = document.getElementById('modalContraparteInput').value;
  c.abogado_contraparte = document.getElementById('modalAbogadoContraparteInput').value;
  c.profesional_asignado = document.getElementById('modalAbogadoSelect').value;
  c.estado = document.getElementById('modalEstadoSelect').value;
  
  const tDesc = document.getElementById('modalTaskDesc').value.trim();
  const tDate = document.getElementById('modalTaskDate').value;
  c.tarea = tDate ? { desc: tDesc || 'Vencimiento procesal', date: tDate } : null;

  c.telefono = document.getElementById('modalTelefonoInput').value;
  c.email = document.getElementById('modalEmailInput').value;
  c.dni = document.getElementById('modalDNIInput').value;
  c.domicilio = document.getElementById('modalDomicilioInput').value;

  c.honorarios = parseFloat(document.getElementById('modalFinHonorarios').value) || 0;
  c.pagado = parseFloat(document.getElementById('modalFinPagado').value) || 0;
  c.aportes = parseFloat(document.getElementById('modalFinAportes').value) || 0;
  c.tasasuc = parseFloat(document.getElementById('modalFinTasa').value) || 0;

  saveCaseChanges(c);
  document.getElementById('caseModal').style.display = 'none';
  updateAllViews();
  alert("¡Expediente actualizado con éxito!");
});

document.getElementById('btnSaveFinancesModal')?.addEventListener('click', () => {
  document.getElementById('btnSaveCaseModal').click();
});

document.getElementById('btnEmitirReciboModal')?.addEventListener('click', () => {
  if (activeCaseId) window.generateReceiptForCase(activeCaseId);
});

// Eliminar caso
document.getElementById('btnDeleteCaseModal')?.addEventListener('click', () => {
  if (!activeCaseId) return;
  if (confirm("¿Estás seguro de que deseas eliminar este expediente del sistema?")) {
    currentCases = currentCases.filter(x => x.id !== activeCaseId);
    localStorage.setItem('crm_local_cases', JSON.stringify(currentCases));
    document.getElementById('caseModal').style.display = 'none';
    updateAllViews();
  }
});

// Tabs del modal
document.querySelectorAll('.modal-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.modal-tab-pane').forEach(p => p.style.display = 'none');
    
    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    const pane = document.getElementById(tabId);
    if (pane) pane.style.display = 'block';
  });
});

document.getElementById('btnCloseCaseModal')?.addEventListener('click', () => {
  document.getElementById('caseModal').style.display = 'none';
});
document.getElementById('btnCancelCaseModal')?.addEventListener('click', () => {
  document.getElementById('caseModal').style.display = 'none';
});

// Plantillas de WhatsApp en modal
function updateWaTemplatePreview(c) {
  const tpl = document.getElementById('modalWaPlantillaSelect')?.value || 'vencimiento';
  let msg = '';
  if (tpl === 'vencimiento') {
    msg = `Estimado/a ${c.nombre}, nos comunicamos del Estudio Jurídico Holzer & Ibarra para recordarle que en los autos caratulados "${c.caratula || c.nombre}" poseemos un vencimiento/audiencia fijada para la fecha ${c.tarea ? c.tarea.date : 'próxima'}. Por favor contáctenos ante cualquier duda.`;
  } else if (tpl === 'documentacion') {
    msg = `Estimado/a ${c.nombre}, desde el Estudio Holzer & Ibarra le solicitamos que nos remita a la brevedad la documentación pendiente requerida para poder impulsar su trámite ante el Juzgado. Saludos cordiales.`;
  } else if (tpl === 'novedad') {
    msg = `Hola ${c.nombre}, nos comunicamos para informarle con satisfacción que hemos obtenido novedades procesales muy favorables en su causa de ${c.area}.`;
  } else if (tpl === 'pago') {
    const saldo = Math.max(0, (c.honorarios || 0) - (c.pagado || 0));
    msg = `Estimado/a ${c.nombre}, le recordamos que posee un saldo pendiente de honorarios profesionales por la suma de $${saldo.toLocaleString('es-AR')}. Ponemos a disposición los datos de cuenta bancaria para su cancelación.`;
  }

  const preview = document.getElementById('modalWaPreviewText');
  if (preview) preview.textContent = msg;
}

document.getElementById('modalWaPlantillaSelect')?.addEventListener('change', () => {
  const c = currentCases.find(x => x.id === activeCaseId);
  if (c) updateWaTemplatePreview(c);
});

document.getElementById('btnSendModalWa')?.addEventListener('click', () => {
  const c = currentCases.find(x => x.id === activeCaseId);
  if (!c || !c.telefono) {
    alert("El cliente no tiene un teléfono registrado.");
    return;
  }
  const cleanPhone = c.telefono.replace(/\D/g, '');
  const text = document.getElementById('modalWaPreviewText')?.textContent || '';
  window.open(`https://wa.me/549${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
});

// ==========================================================================
// MODAL: NUEVO EXPEDIENTE
// ==========================================================================
document.getElementById('btnOpenNewCaseModal')?.addEventListener('click', () => {
  document.getElementById('ncNombre').value = '';
  document.getElementById('ncCUIJ').value = `21-0${Math.floor(10000000 + Math.random() * 90000000)}-${Math.floor(1 + Math.random() * 9)}`;
  document.getElementById('ncTelefono').value = '';
  document.getElementById('ncJuzgado').value = '';
  document.getElementById('ncMensaje').value = '';
  document.getElementById('newCaseModal').style.display = 'flex';
});

document.getElementById('btnSaveNewCase')?.addEventListener('click', async () => {
  const nombre = document.getElementById('ncNombre')?.value.trim();
  if (!nombre) {
    alert("Por favor ingrese el nombre del cliente o carátula.");
    return;
  }

  const newCase = {
    id: "case-" + Date.now(),
    nombre: nombre,
    caratula: nombre,
    cuij: document.getElementById('ncCUIJ')?.value.trim() || `21-00000000-0`,
    telefono: document.getElementById('ncTelefono')?.value.trim() || '',
    area: document.getElementById('ncArea')?.value || 'Derecho Civil',
    profesional_asignado: document.getElementById('ncAbogado')?.value || 'Equipo',
    juzgado: document.getElementById('ncJuzgado')?.value.trim() || 'Tribunales Provinciales de Santa Fe',
    contraparte: 'A determinar',
    abogado_contraparte: '-',
    estado: 'Nuevo',
    honorarios: 0,
    pagado: 0,
    aportes: 0,
    tasasuc: 0,
    tag: 'Nuevo',
    tarea: null,
    historial: [{ date: new Date().toISOString(), text: "Expediente ingresado en el sistema CRM." }],
    mensaje: document.getElementById('ncMensaje')?.value.trim() || '',
    created_at: new Date().toISOString()
  };

  currentCases.unshift(newCase);
  saveCaseChanges(newCase);

  document.getElementById('newCaseModal').style.display = 'none';
  updateAllViews();
  alert("¡Nuevo expediente registrado exitosamente!");
});

// Guardar caso (en Supabase si está disponible, con fallback local)
async function saveCaseChanges(caseObj) {
  localStorage.setItem('crm_local_cases', JSON.stringify(currentCases));

  if (!isDemoMode) {
    try {
      await supabase.from('juridico_leads').upsert([{
        id: caseObj.id.startsWith('case-') || caseObj.id.startsWith('sf-') ? undefined : caseObj.id,
        nombre: caseObj.nombre,
        telefono: caseObj.telefono,
        localidad: caseObj.cuij,
        area: caseObj.area,
        profesional_asignado: caseObj.profesional_asignado,
        mensaje: caseObj.mensaje,
        estado: caseObj.estado,
        tag: caseObj.tag,
        tarea: caseObj.tarea,
        historial: caseObj.historial,
        honorarios: caseObj.honorarios,
        pagado: caseObj.pagado,
        aportes: caseObj.aportes,
        tasasuc: caseObj.tasasuc,
        dni: caseObj.dni,
        domicilio: caseObj.domicilio,
        email: caseObj.email
      }]);
    } catch (e) {
      console.warn("Actualizado en respaldo local:", e);
    }
  }
}

// ==========================================================================
// NOTIFICACIONES Y ALERTAS DE PLAZOS
// ==========================================================================
function checkNotifications() {
  const badge = document.getElementById('topNotifBadge');
  const countLabel = document.getElementById('notifCountLabel');
  const container = document.getElementById('notifListContainer');
  const sideBadge = document.getElementById('sideBadgeVencimientos');
  if (!container) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const urgentCases = [];

  currentCases.forEach(c => {
    if (c.tarea && c.tarea.date) {
      if (c.tarea.date <= todayStr) {
        urgentCases.push(c);
      }
    }
  });

  const count = urgentCases.length;

  if (count > 0) {
    if (badge) { badge.style.display = 'flex'; badge.textContent = count; }
    if (sideBadge) { sideBadge.style.display = 'inline-block'; sideBadge.textContent = count; }
    if (countLabel) countLabel.textContent = `${count} para hoy/atrasados`;

    let html = '';
    urgentCases.forEach(c => {
      const isOverdue = c.tarea.date < todayStr;
      html += `
        <div class="notif-item" onclick="window.openCaseModal('${c.id}')">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <strong style="color:var(--text-main); font-size:0.85rem;">${c.nombre}</strong>
            <span class="badge ${isOverdue ? 'badge-rose' : 'badge-amber'}" style="font-size:0.65rem;">
              ${isOverdue ? 'Atrasado' : 'Vence Hoy'}
            </span>
          </div>
          <div style="font-size:0.8rem; color:var(--text-secondary);">${c.tarea.desc}</div>
        </div>
      `;
    });
    container.innerHTML = html;
  } else {
    if (badge) badge.style.display = 'none';
    if (sideBadge) sideBadge.style.display = 'none';
    if (countLabel) countLabel.textContent = '0 hoy';
    container.innerHTML = '<div style="padding:24px 20px; text-align:center; color:var(--text-muted); font-size:0.85rem;">No hay vencimientos fijados para hoy.</div>';
  }
}

// Toggle Notificaciones Dropdown
const btnNotifToggle = document.getElementById('btnNotifToggle');
const topNotifDropdown = document.getElementById('topNotifDropdown');
if (btnNotifToggle && topNotifDropdown) {
  btnNotifToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    topNotifDropdown.style.display = topNotifDropdown.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', (e) => {
    if (!topNotifDropdown.contains(e.target) && e.target !== btnNotifToggle) {
      topNotifDropdown.style.display = 'none';
    }
  });
}

// ==========================================================================
// MODO OSCURO
// ==========================================================================
function checkDarkMode() {
  const isDark = localStorage.getItem('crm_dark_mode') === 'true';
  const btn = document.getElementById('btnToggleDark');
  if (isDark) {
    document.body.classList.add('dark-mode');
    if (btn) btn.innerHTML = '<i class="fas fa-sun" style="color:#F59E0B;"></i>';
  }
}

const btnToggleDark = document.getElementById('btnToggleDark');
if (btnToggleDark) {
  btnToggleDark.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('crm_dark_mode', isDark);
    btnToggleDark.innerHTML = isDark ? '<i class="fas fa-sun" style="color:#F59E0B;"></i>' : '<i class="fas fa-moon"></i>';
    if (chartAreasInstance) renderCharts(currentCases);
  });
}

// ==========================================================================
// ATAJOS DE TECLADO & EVENTOS
// ==========================================================================
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Cmd + K o Ctrl + K enfoca la barra de búsqueda
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const input = document.getElementById('globalSearchInput');
      if (input) input.focus();
    }
    // Escape cierra modales
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    }
  });
}

function setupEventListeners() {
  setupCalculator();
  document.getElementById('btnRefreshDashboard')?.addEventListener('click', () => {
    loadCases();
  });
}

// Utilidad de conversión de número a letras para recibos
function numeroALetras(monto) {
  const num = Math.round(monto);
  if (num === 150000) return "Ciento cincuenta mil pesos";
  if (num === 300000) return "Trescientos mil pesos";
  if (num === 400000) return "Cuatrocientos mil pesos";
  if (num === 500000) return "Quinientos mil pesos";
  if (num === 600000) return "Seiscientos mil pesos";
  if (num === 800000) return "Ochocientos mil pesos";
  if (num === 1000000) return "Un millón de pesos";
  if (num === 1200000) return "Un millón doscientos mil pesos";
  if (num === 1400000) return "Un millón cuatrocientos mil pesos";
  return `${num.toLocaleString('es-AR')} pesos`;
}
