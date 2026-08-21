package com.apizaco.rutas.util;

import java.util.regex.Pattern;

public final class SecuritySanitizer {

    private static final Pattern SCRIPT_TAG_PATTERN = Pattern.compile("<script[^>]*>(.*?)</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");
    private static final Pattern EVENT_HANDLER_PATTERN = Pattern.compile("(?i)\\b(on\\w+)\\s*=", Pattern.CASE_INSENSITIVE);
    private static final Pattern JAVASCRIPT_PROTOCOL_PATTERN = Pattern.compile("(?i)javascript:", Pattern.CASE_INSENSITIVE);

    private SecuritySanitizer() {
    }

    /**
     * Sanitiza texto eliminando etiquetas HTML peligrosas, scripts y manipuladores de eventos JavaScript.
     */
    public static String sanitizarTexto(String input) {
        if (input == null) {
            return null;
        }

        String limpio = input.trim();
        // 1. Eliminar bloques <script>...</script>
        limpio = SCRIPT_TAG_PATTERN.matcher(limpio).replaceAll("");
        // 2. Eliminar etiquetas HTML
        limpio = HTML_TAG_PATTERN.matcher(limpio).replaceAll("");
        // 3. Eliminar eventos inline tipo onerror=, onclick=
        limpio = EVENT_HANDLER_PATTERN.matcher(limpio).replaceAll("");
        // 4. Eliminar protocolos javascript:
        limpio = JAVASCRIPT_PROTOCOL_PATTERN.matcher(limpio).replaceAll("");

        return limpio.trim();
    }
}
