import 'package:flutter/material.dart';

/// Web CSS'ten birebir alınan renk paleti
/// Dark: globals.css .estiva-dashboard (dark)
/// Light: globals.css body.theme-light .estiva-dashboard
class AppColors {
  final bool isDark;
  const AppColors._(this.isDark);

  static const _dark = AppColors._(true);
  static const _light = AppColors._(false);

  static AppColors of(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    return brightness == Brightness.dark ? _dark : _light;
  }

  // ── Scaffold / Panel ──
  Color get panelBg => isDark ? const Color(0xFF090414) : const Color(0xFFF8F5FF);
  Color get scaffoldBg => isDark ? const Color(0xFF08040f) : const Color(0xFFF8F5FF);

  // ── Sidebar ──
  Color get sidebarStart => isDark ? const Color(0xFF140622) : const Color(0xFFFFFFFF);
  Color get sidebarEnd => isDark ? const Color(0xFF040309) : const Color(0xFFF1ECFF);
  Color get sidebarBorder => isDark ? Colors.transparent : const Color(0xFFE3D8FF);

  // ── Topbar ──
  Color get topbarBg => isDark ? const Color(0xFF0f0820) : Colors.white.withValues(alpha: 0.72);

  // ── Cards ──
  Color get cardBg => isDark ? const Color(0xFF0f0a1e) : Colors.white;
  Color get cardBorder => isDark ? const Color(0xFF1a1030) : const Color(0xFFE3D8FF);

  // ── Input ──
  Color get inputBg => isDark ? const Color(0xFF130e22) : const Color(0xFFF8F5FF);
  Color get inputBorder => isDark ? const Color(0xFF2a1f45) : const Color(0xFFDACFFF);

  // ── Text ──
  Color get textPrimary => isDark ? Colors.white : const Color(0xFF1F1233);
  Color get textMuted => isDark ? const Color(0xFF9a88c2) : const Color(0xFF6a5c8c);
  Color get textDim => isDark ? const Color(0xFF5a4d7a) : const Color(0xFF9a88c2);
  Color get textNav => isDark ? const Color(0xFF8a7cb0) : const Color(0xFF5c478d);

  // ── Nav ──
  Color get navIconBg => isDark ? const Color(0xFF0a0815) : const Color(0xFFF3EEFF);
  Color get navHover => isDark ? const Color(0xFF1a1030) : const Color(0xFFEDE5FF);
  Color get navActive => isDark ? const Color(0xFF1f1540) : const Color(0xFFE3D8FF);
  Color get navActiveText => isDark ? Colors.white : const Color(0xFF2e174e);

  // ── Table ──
  Color get tableRowAlt => isDark ? const Color(0xFF110c20) : const Color(0xFFF8F5FF);
  Color get tableHeaderBg => isDark ? const Color(0xFF0a0815) : const Color(0xFFF3EEFF);

  // ── Login ──
  Color get loginBg => isDark ? const Color(0xFF0b0614) : const Color(0xFFF7F4FF);
  Color get loginCardBg => isDark ? const Color(0xFF1a1030) : Colors.white;

  // ── Gradients ──
  LinearGradient get sidebarGradient => LinearGradient(
        colors: [sidebarStart, sidebarEnd],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      );

  // ── Static colors (same in both themes) ──
  static const primary = Color(0xFF6c5ce7);
  static const primaryLight = Color(0xFF8b5cf6);
  static const accent = Color(0xFFfd79a8);
  static const green = Color(0xFF10b981);
  static const red = Color(0xFFef4444);
  static const orange = Color(0xFFf59e0b);
  static const cyan = Color(0xFF06b6d4);

  static const primaryGradient = LinearGradient(
    colors: [primary, primaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const pinkGradient = LinearGradient(
    colors: [Color(0xFFffd1dc), Color(0xFFf3a4ff)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

class AppTheme {
  static ThemeData get darkTheme => _buildTheme(Brightness.dark);
  static ThemeData get lightTheme => _buildTheme(Brightness.light);

  static ThemeData _buildTheme(Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    final c = isDark ? const AppColors._(true) : const AppColors._(false);

    return ThemeData(
      brightness: brightness,
      scaffoldBackgroundColor: c.panelBg,
      primaryColor: AppColors.primary,
      colorScheme: ColorScheme(
        brightness: brightness,
        primary: AppColors.primary,
        secondary: AppColors.accent,
        surface: c.cardBg,
        error: AppColors.red,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: c.textPrimary,
        onError: Colors.white,
      ),
      fontFamily: 'Segoe UI',
      appBarTheme: AppBarTheme(
        backgroundColor: c.topbarBg,
        elevation: 0,
        foregroundColor: c.textPrimary,
      ),
      cardTheme: CardThemeData(
        color: c.cardBg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: c.cardBorder),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: c.inputBg,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: c.inputBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: c.inputBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        labelStyle: TextStyle(color: c.textMuted),
        hintStyle: TextStyle(color: c.textDim),
      ),
      textTheme: TextTheme(
        headlineLarge: TextStyle(color: c.textPrimary, fontWeight: FontWeight.bold),
        headlineMedium: TextStyle(color: c.textPrimary, fontWeight: FontWeight.bold),
        titleLarge: TextStyle(color: c.textPrimary, fontWeight: FontWeight.w600),
        bodyLarge: TextStyle(color: c.textPrimary),
        bodyMedium: TextStyle(color: c.textMuted),
        bodySmall: TextStyle(color: c.textDim),
      ),
    );
  }
}
