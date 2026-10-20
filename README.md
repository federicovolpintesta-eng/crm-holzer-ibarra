# CRM LegalTech - Estudio Jurídico Holzer & Ibarra

Sistema integral de gestión de expedientes judiciales, control financiero, agenda procesal y generador de escritos legales adaptado a la práctica profesional en la Provincia de Santa Fe, Argentina.

---

## 🚀 Despliegue en GitHub Pages (Completamente Gratuito y Aislado)

Este CRM es **100% estático** (corre directamente en el navegador comunicándose con Supabase vía CDN y APIs REST/Realtime), por lo que funciona de manera nativa en **GitHub Pages** sin necesidad de servidores Node.js ni configuraciones complejas.

### Opción 1: En un Repositorio Independiente en GitHub (Recomendado)
Para mantenerlo totalmente separado de la web de Hostinger:
1. Crea un nuevo repositorio en GitHub (ej: `crm-holzer-ibarra` o `legal-crm`).
2. Sube el contenido de esta carpeta `crm/` a la raíz de ese nuevo repositorio:
   ```bash
   cd crm
   git init
   git add .
   git commit -m "Initial commit: CRM LegalTech"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
   git push -u origin main
   ```
3. En tu repositorio de GitHub, ve a **Settings** > **Pages**.
4. En **Build and deployment** > **Source**, selecciona `Deploy from a branch`.
5. Selecciona la rama `main` y la carpeta `/ (root)`, luego haz clic en **Save**.
6. En 1 minuto tendrás tu enlace HTTPS oficial listo para compartir:
   `https://tu-usuario.github.io/tu-repositorio/`

### Opción 2: Correr Localmente para la Entrevista de Mañana
Puedes correrlo directamente en tu Mac sin depender de conexión a internet:
```bash
# Desde la carpeta raíz del proyecto:
python3 -m http.server 8080

# Luego abre en tu navegador:
http://localhost:8080/crm/
```
O simplemente haz doble clic en `crm/index.html`.

---

## ⚡ Modo Demostración Inmediato (Para Entrevistas)
En la pantalla de inicio de sesión dispones del botón:
> **"⚡ Ingresar con Casos de Prueba (Santa Fe)"**

Al hacer clic, ingresas directamente al panel sin pedir credenciales, con **12 causas judiciales de alta fidelidad precargadas** (amparos de salud contra IAPOS/OSDE, accidentes laborales contra Prevención ART/Asociart, sucesiones y reclamos de familia en Tribunales de Santa Fe), gráficos interactivos, calendario y liquidaciones financieras completas.

---

## ⚖️ Módulos y Funcionalidades Incluidas

1. **Dashboard Ejecutivo**:
   - KPIs de expedientes activos, causas en trámite judicial, alertas de vencimientos de 48hs y balances de honorarios.
   - Gráficos interactivos de distribución por rama, avance procesal, carga por abogado y cobranzas.

2. **Expedientes & Clientes (Tabla Avanzada)**:
   - Seguimiento por CUIJ, carátula, juzgado, contraparte y letrado.
   - Filtros instantáneos por estado, especialidad, letrado y nivel de urgencia.
   - Acceso directo a WhatsApp con plantillas legales contextuales.
   - Exportación completa a Excel (.xlsx) y CSV.

3. **Tablero Procesal (Kanban Ágil)**:
   - Columnas por etapa procesal (*Recepción*, *En Análisis*, *Prejudicial*, *En Trámite Judicial*, *Concluido*).
   - Drag & Drop automático que registra cada movimiento en la bitácora del caso.

4. **Agenda Judicial & Plazos**:
   - Calendario mensual de términos perentorios, audiencias y peritajes.
   - Alertas dinámicas con semáforo de urgencia y centro de notificaciones superior.

5. **Finanzas & Recibos**:
   - Control de honorarios acordados, cuotas percibidas y saldo deudor.
   - Cálculo automático de Aportes Jubilatorios a Caja Forense (29%) y Tasa de Justicia de Santa Fe (49%).
   - Generación de **Recibo Oficial Imprimible** con membrete formal del estudio.

6. **Calculadora Judicial de Santa Fe**:
   - Conversor de Unidad JUS vigente (Ley 12.851) a Pesos con cálculo de aportes.
   - Estimador de indemnización tarifada por ART / Ley 24.557 (Fórmula Vuotto / Méndez con RIPTE).
   - Calculadora de Intereses Judiciales por Tasa Activa del BNA.

7. **Generador de Escritos & Modelos**:
   - Redacción instantánea de *Poder Especial para Juicios*, *Carta Documento a Prepagas*, *Carta Documento a ART*, *Demanda de Amparo con Medida Cautelar* y *Pacto de Cuota Litis*.
   - Exportación directa a Microsoft Word (.doc) e impresión con formato tribunalicio.

8. **Directorio de Clientes**:
   - Tarjetas de contacto con llamada directa y WhatsApp en 1 clic.
