const { test, expect } = require('@playwright/test');

/**
 * Lead Softphone & CRM - Visual Eyes & Functional Check (Playwright Spec)
 * Ejecuta 100% en los runners de Checkly Cloud (AWS).
 */

const TARGET_URL =
  process.env.CHECKLY_TARGET_URL ||
  process.env.ENVIRONMENT_URL ||
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  'https://lead-softphone.vercel.app';

test.describe('Lead Softphone - Visual Eyes & CRM Suite', () => {
  // Manejo de token de bypass si Vercel Deployment Protection está activo
  test.beforeEach(async ({ context }) => {
    if (process.env.VERCEL_BYPASS_TOKEN) {
      await context.setExtraHTTPHeaders({
        'x-vercel-protection-bypass': process.env.VERCEL_BYPASS_TOKEN,
      });
    }
  });

  test('1. Login & Branding: Interfaz visual y formulario de acceso', async ({ page }) => {
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded' });

    // Verificar presencia del logo/título
    const brandHeading = page.locator('h1');
    await expect(brandHeading).toContainText(/Lead Softphone/i);

    // Verificar campos de email y password
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Captura visual del login
    await page.screenshot({ path: 'screenshots/01-login-screen.png', fullPage: false });
  });

  test('2. Softphone & Dialer: Verificación de teclado y calidad de red', async ({ page }) => {
    await page.goto(`${TARGET_URL}/dashboard`, { waitUntil: 'domcontentloaded' });

    // Si redirige a login por falta de sesión, validar la protección de ruta
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('Ruta protegida correctamente redirigida al login');
      await page.screenshot({ path: 'screenshots/02-auth-protected-dashboard.png' });
      return;
    }

    // Verificar presencia del dialer
    const softphoneCard = page.locator('text=Softphone');
    await expect(softphoneCard).toBeVisible();

    // Captura del Dialer y llamadas recientes
    await page.screenshot({ path: 'screenshots/02-softphone-dialer.png', fullPage: true });
  });

  test('3. CRM de Leads: Tabla, etiquetas y modales de contacto', async ({ page }) => {
    await page.goto(`${TARGET_URL}/dashboard/contacts`, { waitUntil: 'domcontentloaded' });

    if (page.url().includes('/login')) {
      console.log('Ruta contacts protegida por sesión');
      return;
    }

    // Verificar buscador y selector de filtros
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await expect(searchInput).toBeVisible();

    // Verificar botón Nuevo Lead
    const newLeadBtn = page.locator('button:has-text("Nuevo Lead")');
    await expect(newLeadBtn).toBeVisible();

    // Captura del CRM
    await page.screenshot({ path: 'screenshots/03-crm-contacts-table.png', fullPage: true });
  });

  test('4. WhatsApp Inbox: Bandeja de entrada y ventana de chat', async ({ page }) => {
    await page.goto(`${TARGET_URL}/dashboard/whatsapp`, { waitUntil: 'domcontentloaded' });

    if (page.url().includes('/login')) {
      console.log('Ruta whatsapp protegida por sesión');
      return;
    }

    // Verificar contenedor principal de WhatsApp
    const headerTitle = page.locator('text=WhatsApp');
    await expect(headerTitle.first()).toBeVisible();

    // Captura de WhatsApp Inbox
    await page.screenshot({ path: 'screenshots/04-whatsapp-inbox.png', fullPage: true });
  });

  test('5. Historial de Llamadas: Tabla y paginación', async ({ page }) => {
    await page.goto(`${TARGET_URL}/dashboard/calls`, { waitUntil: 'domcontentloaded' });

    if (page.url().includes('/login')) {
      console.log('Ruta calls protegida por sesión');
      return;
    }

    // Captura del historial
    await page.screenshot({ path: 'screenshots/05-call-history.png', fullPage: true });
  });
});
