import 'package:flutter/material.dart';

class AppColors {
  // Sidebar & backgrounds (matching web)
  static const sidebarGradientStart = Color(0xFF140622);
  static const sidebarGradientEnd = Color(0xFF040309);
  static const panelBg = Color(0xFF090414);
  static const topbarBg = Color(0xFF0f0820);
  static const cardBg = Color(0xFF0f0a1e);
  static const cardBorder = Color(0xFF1a1030);
  static const inputBg = Color(0xFF130e22);
  static const inputBorder = Color(0xFF2a1f45);

  // Login
  static const loginBg = Color(0xFF0b0614);
  static const loginCardBg = Color(0xFF1a1030);

  // Accent
  static const primary = Color(0xFF6c5ce7);
  static const primaryLight = Color(0xFF8b5cf6);
  static const accent = Color(0xFFfd79a8);
  static const green = Color(0xFF10b981);
  static const red = Color(0xFFef4444);
  static const orange = Color(0xFFf59e0b);
  static const cyan = Color(0xFF06b6d4);

  // Text
  static const textWhite = Colors.white;
  static const textMuted = Color(0xFF9a88c2);
  static const textDim = Color(0xFF5a4d7a);
  static const textNav = Color(0xFF8a7cb0);

  // Nav
  static const navIconBg = Color(0xFF0a0815);
  static const navHover = Color(0xFF1a1030);
  static const navActive = Color(0xFF1f1540);

  // Gradient helpers
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

  static const sidebarGradient = LinearGradient(
    colors: [sidebarGradientStart, sidebarGradientEnd],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}

class AppTheme {
  static ThemeData get darkTheme => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.panelBg,
        primaryColor: AppColors.primary,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.primary,
          secondary: AppColors.accent,
          surface: AppColors.cardBg,
        ),
        fontFamily: 'Segoe UI',
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.topbarBg,
          elevation: 0,
        ),
        cardTheme: CardThemeData(
          color: AppColors.cardBg,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppColors.cardBorder),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.inputBg,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.inputBorder),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.inputBorder),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
          labelStyle: const TextStyle(color: AppColors.textMuted),
          hintStyle: const TextStyle(color: AppColors.textDim),
        ),
        textTheme: const TextTheme(
          headlineLarge: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          headlineMedium: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          titleLarge: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
          bodyLarge: TextStyle(color: Colors.white),
          bodyMedium: TextStyle(color: AppColors.textMuted),
          bodySmall: TextStyle(color: AppColors.textDim),
        ),
      );
}
