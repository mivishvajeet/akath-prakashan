import {
  getGitHubPagesBasePath,
  normalizeAppRoutePath,
  resolvePublicAssetUrl,
  getStaticBooks,
  getStaticExcerpts,
} from './githubPagesAdapter';

interface AssetPathComparisonRow {
  source: string;
  rawPath: string;
  resolvedPathname: string;
  expectedPathname: string;
  expectedBasePath: string;
  matchesExpectedBase: boolean;
  httpStatus: number;
  contentType: string;
  status: 'OK' | 'BASE_PATH_MISMATCH' | 'HTML_404_FALLBACK' | 'HTTP_ERROR';
  diagnosticNote: string;
}

interface GitHubPagesDiagnosticReport {
  timestamp: string;
  origin: string;
  currentUrl: string;
  rawPathname: string;
  normalizedRoute: string;
  configuredViteBaseUrl: string;
  detectedRuntimeBasePath: string;
  expectedRepositoryBasePath: string;
  basePathAligned: boolean;
  rootCauseFindings: string[];
  totalChecked: number;
  passedCount: number;
  failedCount: number;
  comparisons: AssetPathComparisonRow[];
}

const KNOWN_ROUTE_SEGMENTS = new Set([
  'books',
  'authors',
  'vachankatta',
  'about',
  'submit-manuscript',
  'contact',
  'cart',
  'checkout',
  'track-order',
  'shipping-returns',
  'privacy',
  'terms',
  'policies',
  'admin',
  'audit',
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'verify-email',
  'account',
  'author',
  'author-portal',
  'index.html',
]);

/**
 * Computes the expected repository base path from the live browser URL and environment.
 * On GitHub Pages project sites (https://<user>.github.io/<repo>/...), the expected
 * repository base path is '/<repo>/'. On root domains, it is '/'.
 */
function getExpectedRepositoryBasePath(): string {
  if (typeof window === 'undefined') return '/';

  const segments = window.location.pathname.split('/').filter(Boolean);
  if (
    window.location.hostname.endsWith('.github.io') &&
    segments.length > 0 &&
    !KNOWN_ROUTE_SEGMENTS.has(segments[0])
  ) {
    return `/${segments[0]}/`;
  }

  const detected = getGitHubPagesBasePath();
  if (detected) {
    return detected.endsWith('/') ? detected : `${detected}/`;
  }

  return '/';
}

/**
 * Computes what a given asset path SHOULD resolve to under the expected repository base path.
 */
function buildExpectedAssetPathname(
  rawOrResolvedPath: string,
  expectedBasePath: string
): string {
  const cleanBase = expectedBasePath === '/' ? '' : expectedBasePath.replace(/\/+$/, '');
  try {
    const parsed = new URL(rawOrResolvedPath, window.location.href);
    if (parsed.origin !== window.location.origin) {
      return parsed.href;
    }
    let pathname = parsed.pathname;
    if (cleanBase && pathname.startsWith(`${cleanBase}/`)) {
      return pathname;
    }
    return `${cleanBase}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  } catch {
    const cleanRel = rawOrResolvedPath.replace(/^\.\//, '');
    const withSlash = cleanRel.startsWith('/') ? cleanRel : `/${cleanRel}`;
    return `${cleanBase}${withSlash}`;
  }
}

/**
 * Diagnostic utility that logs the resolved paths of the site manifest and static assets
 * to the browser console and compares each path against the expected repository base path.
 */
export async function runGitHubPagesAssetDiagnostics(): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const configuredViteBaseUrl = String((import.meta as any).env?.BASE_URL || '/');
  const detectedBase = getGitHubPagesBasePath();
  const detectedRuntimeBasePath = detectedBase ? `${detectedBase}/` : '/';
  const expectedRepositoryBasePath = getExpectedRepositoryBasePath();
  const normalizedRoute = normalizeAppRoutePath(window.location.pathname);

  const rootCauseFindings: string[] = [];

  if (expectedRepositoryBasePath !== '/' && configuredViteBaseUrl === '/') {
    rootCauseFindings.push(
      `[VITE_BASE_PATH Mismatch] Site is running under repository subpath "${expectedRepositoryBasePath}", but Vite BASE_URL was built as "${configuredViteBaseUrl}". Any un-normalized root-relative "/assets/..." or "/manifest.json" request will resolve to "${window.location.origin}/assets/..." instead of "${window.location.origin}${expectedRepositoryBasePath}assets/...".`
    );
  }

  const candidates = new Map<
    string,
    { source: string; rawPath: string; resolvedPath: string }
  >();

  const addCandidate = (source: string, rawPath?: string, preResolved?: string) => {
    if (!rawPath || rawPath.startsWith('data:') || rawPath.startsWith('blob:')) {
      return;
    }
    const resolvedPath = preResolved || resolvePublicAssetUrl(rawPath) || rawPath;
    const key = `${source}::${rawPath}`;
    if (!candidates.has(key)) {
      candidates.set(key, { source, rawPath, resolvedPath });
    }
  };

  // 1. Site Manifest (<link rel="manifest"> and /manifest.json contents)
  const manifestLinkEl = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  const rawManifestHref = manifestLinkEl?.getAttribute('href') || '/manifest.json';
  const resolvedManifestHref =
    manifestLinkEl?.href || resolvePublicAssetUrl(rawManifestHref) || rawManifestHref;
  addCandidate('manifest:link[rel="manifest"]', rawManifestHref, resolvedManifestHref);

  try {
    const manifestUrl = new URL(
      resolvePublicAssetUrl('/manifest.json') || '/manifest.json',
      window.location.origin
    ).toString();
    const mRes = await window.fetch(manifestUrl, { method: 'GET' });
    const mType = mRes.headers.get('content-type') || '';
    if (mRes.ok && mType.includes('json')) {
      const mData = await mRes.json();
      if (Array.isArray(mData.icons)) {
        mData.icons.forEach((icon: { src?: string }, idx: number) => {
          if (icon?.src) {
            addCandidate(`manifest:icons[${idx}]`, icon.src);
          }
        });
      }
      if (Array.isArray(mData.static_assets)) {
        mData.static_assets.forEach((assetPath: string, idx: number) => {
          if (typeof assetPath === 'string') {
            addCandidate(`manifest:static_assets[${idx}]`, assetPath);
          }
        });
      }
    }
  } catch {
    // Manifest probe status is recorded in the comparison loop below
  }

  // 2. Brand & Metadata Assets
  addCandidate('brand:logo', '/assets/akath/akath-logo.png');
  addCandidate('brand:hero', '/assets/akath/hero-books.jpg');
  const ogImageMeta = document.querySelector<HTMLMetaElement>(
    'meta[property="og:image"]'
  );
  if (ogImageMeta?.content) {
    addCandidate(
      'meta:og:image',
      ogImageMeta.getAttribute('content') || ogImageMeta.content,
      ogImageMeta.content
    );
  }

  // 3. Static Book Catalogue Assets
  for (const book of getStaticBooks()) {
    addCandidate(`book:${book.slug}:cover`, book.coverImageUrl);
    addCandidate(`book:${book.slug}:spread`, book.coverSpreadUrl);
    addCandidate(`book:${book.slug}:pdf`, book.coverPdfUrl);
    if (Array.isArray(book.galleryImages)) {
      book.galleryImages.forEach((img, idx) => {
        addCandidate(`book:${book.slug}:gallery[${idx}]`, img.url);
      });
    }
  }

  // 4. First-Page Excerpt Assets
  for (const excerpt of getStaticExcerpts()) {
    addCandidate(`excerpt:${excerpt.id}:pdf`, excerpt.pdfDocumentUrl);
    if (Array.isArray(excerpt.folioPages)) {
      excerpt.folioPages.forEach((page, idx) => {
        addCandidate(
          `excerpt:${excerpt.id}:folio[${idx}]:illustration`,
          page.illustrationUrl
        );
        addCandidate(
          `excerpt:${excerpt.id}:folio[${idx}]:emblem`,
          page.emblemUrl
        );
      });
    }
  }

  // 5. Rendered DOM Bundles & Images (<script>, <link rel="stylesheet">, <img>)
  document
    .querySelectorAll<HTMLScriptElement>('script[src]')
    .forEach((el, idx) => {
      addCandidate(`dom:script[${idx}]`, el.getAttribute('src') || el.src, el.src);
    });
  document
    .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]')
    .forEach((el, idx) => {
      addCandidate(`dom:stylesheet[${idx}]`, el.getAttribute('href') || el.href, el.href);
    });
  document.querySelectorAll<HTMLImageElement>('img[src]').forEach((el, idx) => {
    addCandidate(`dom:img[${idx}]`, el.getAttribute('src') || el.src, el.src);
  });

  // 6. Compare each resolved path against expectedRepositoryBasePath & probe HTTP status
  const comparisons: AssetPathComparisonRow[] = [];

  for (const item of candidates.values()) {
    let resolvedUrlObj: URL;
    try {
      resolvedUrlObj = new URL(item.resolvedPath, window.location.href);
    } catch {
      const expectedPathname = buildExpectedAssetPathname(
        item.rawPath,
        expectedRepositoryBasePath
      );
      comparisons.push({
        source: item.source,
        rawPath: item.rawPath,
        resolvedPathname: item.resolvedPath,
        expectedPathname,
        expectedBasePath: expectedRepositoryBasePath,
        matchesExpectedBase: false,
        httpStatus: 0,
        contentType: 'invalid-url',
        status: 'BASE_PATH_MISMATCH',
        diagnosticNote: `Malformed URL "${item.resolvedPath}"; expected "${expectedPathname}"`,
      });
      continue;
    }

    const isSameOrigin = resolvedUrlObj.origin === window.location.origin;
    const resolvedPathname = isSameOrigin
      ? resolvedUrlObj.pathname
      : resolvedUrlObj.href;
    const expectedPathname = isSameOrigin
      ? buildExpectedAssetPathname(item.rawPath, expectedRepositoryBasePath)
      : resolvedUrlObj.href;

    const matchesExpectedBase = isSameOrigin
      ? resolvedPathname.startsWith(expectedRepositoryBasePath)
      : true;

    let httpStatus = 200;
    let contentType = 'external-origin';
    let status: AssetPathComparisonRow['status'] = 'OK';
    let diagnosticNote = `Resolved cleanly under base "${expectedRepositoryBasePath}"`;

    if (isSameOrigin) {
      try {
        let res = await window.fetch(resolvedUrlObj.toString(), { method: 'HEAD' });
        if (res.status === 405 || res.status === 404) {
          res = await window.fetch(resolvedUrlObj.toString(), { method: 'GET' });
        }
        httpStatus = res.status;
        contentType = res.headers.get('content-type') || '';
        const expectsHtml = resolvedPathname.endsWith('.html');
        const isHtmlFallback = !expectsHtml && contentType.includes('text/html');

        if (!matchesExpectedBase) {
          status = 'BASE_PATH_MISMATCH';
          diagnosticNote = `Resolved to "${resolvedPathname}" instead of "${expectedPathname}" (missing repository base path "${expectedRepositoryBasePath}")`;
        } else if (isHtmlFallback) {
          status = 'HTML_404_FALLBACK';
          diagnosticNote = `Server returned text/html fallback instead of static asset at "${resolvedPathname}"`;
        } else if (!res.ok) {
          status = 'HTTP_ERROR';
          diagnosticNote = `HTTP ${res.status} when requesting "${resolvedPathname}" (expected "${expectedPathname}")`;
        }
      } catch {
        httpStatus = 0;
        contentType = 'network-error';
        status = matchesExpectedBase ? 'HTTP_ERROR' : 'BASE_PATH_MISMATCH';
        diagnosticNote = `Network failure fetching "${resolvedPathname}" (expected "${expectedPathname}")`;
      }
    }

    comparisons.push({
      source: item.source,
      rawPath: item.rawPath,
      resolvedPathname,
      expectedPathname,
      expectedBasePath: expectedRepositoryBasePath,
      matchesExpectedBase,
      httpStatus,
      contentType,
      status,
      diagnosticNote,
    });
  }

  const failedRows = comparisons.filter((r) => r.status !== 'OK');
  const passedCount = comparisons.length - failedRows.length;

  for (const failed of failedRows) {
    rootCauseFindings.push(`[${failed.status}] ${failed.source}: ${failed.diagnosticNote}`);
  }

  const report: GitHubPagesDiagnosticReport = {
    timestamp: new Date().toISOString(),
    origin: window.location.origin,
    currentUrl: window.location.href,
    rawPathname: window.location.pathname,
    normalizedRoute,
    configuredViteBaseUrl,
    detectedRuntimeBasePath,
    expectedRepositoryBasePath,
    basePathAligned:
      detectedRuntimeBasePath === expectedRepositoryBasePath &&
      failedRows.length === 0,
    rootCauseFindings,
    totalChecked: comparisons.length,
    passedCount,
    failedCount: failedRows.length,
    comparisons,
  };

  (window as any).__AKATH_ASSET_DIAGNOSTICS__ = report;
  (window as any).runAkathAssetDiagnostics = runGitHubPagesAssetDiagnostics;

  console.group(
    `[Akath GitHub Pages Asset Diagnostics] Expected Base="${expectedRepositoryBasePath}" | Detected="${detectedRuntimeBasePath}" | ${passedCount}/${comparisons.length} OK`
  );
  console.log('Base Path Comparison Summary:', {
    origin: report.origin,
    rawPathname: report.rawPathname,
    normalizedRoute: report.normalizedRoute,
    configuredViteBaseUrl: report.configuredViteBaseUrl,
    detectedRuntimeBasePath: report.detectedRuntimeBasePath,
    expectedRepositoryBasePath: report.expectedRepositoryBasePath,
    basePathAligned: report.basePathAligned,
    passedCount: report.passedCount,
    failedCount: report.failedCount,
  });
  console.table(
    comparisons.map((c) => ({
      source: c.source,
      rawPath: c.rawPath,
      resolvedPathname: c.resolvedPathname,
      expectedPathname: c.expectedPathname,
      matchesExpectedBase: c.matchesExpectedBase,
      httpStatus: c.httpStatus,
      status: c.status,
    }))
  );
  if (rootCauseFindings.length > 0) {
    console.warn('Diagnostic Findings & Mismatches:', rootCauseFindings);
  } else {
    console.info(
      `All ${comparisons.length} manifest and static asset paths match the expected repository base path ("${expectedRepositoryBasePath}").`
    );
  }
  console.groupEnd();
}
