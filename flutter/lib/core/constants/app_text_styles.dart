import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Merkezi tipografi sistemi
class AppTextStyles {
  AppTextStyles._();

  // Font family
  static const String fontFamily = 'Segoe UI';

  // ── Heading ──
  static TextStyle heading1(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textPrimary,
        fontSize: 28,
        fontWeight: FontWeight.bold,
        height: 1.2,
      );

  static TextStyle heading2(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textPrimary,
        fontSize: 24,
        fontWeight: FontWeight.bold,
      );

  static TextStyle heading3(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textPrimary,
        fontSize: 20,
        fontWeight: FontWeight.w600,
      );

  // ── Hero (Login sayfası vb.) ──
  static TextStyle hero(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textPrimary,
        fontSize: 42,
        fontWeight: FontWeight.bold,
        height: 1.15,
      );

  // ── Body ──
  static TextStyle bodyLarge(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textPrimary,
        fontSize: 16,
        fontWeight: FontWeight.w600,
      );

  static TextStyle body(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textPrimary,
        fontSize: 14,
      );

  static TextStyle bodyMuted(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textMuted,
        fontSize: 14,
      );

  static TextStyle bodySmall(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textDim,
        fontSize: 13,
      );

  static TextStyle bodySmallMuted(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textDim,
        fontSize: 12,
      );

  // ── KPI / Stat values ──
  static TextStyle kpiValue(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textPrimary,
        fontSize: 28,
        fontWeight: FontWeight.bold,
      );

  static TextStyle statValue(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textPrimary,
        fontSize: 26,
        fontWeight: FontWeight.bold,
      );

  // ── Labels ──
  static TextStyle label(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textDim,
        fontSize: 10,
        fontWeight: FontWeight.w600,
        letterSpacing: 1,
      );

  static TextStyle labelWide(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textDim,
        fontSize: 10,
        fontWeight: FontWeight.w600,
        letterSpacing: 2,
      );

  static TextStyle sectionTitle(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textDim,
        fontSize: 10,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.5,
      );

  static TextStyle caption(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textMuted,
        fontSize: 12,
        fontWeight: FontWeight.w600,
      );

  // ── Nav ──
  static TextStyle navItem(AppColors c, {bool active = false}) => TextStyle(
        fontFamily: fontFamily,
        color: active ? c.navActiveText : c.textNav,
        fontSize: 13,
        fontWeight: FontWeight.w500,
      );

  // ── Table ──
  static TextStyle tableHeader(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textDim,
        fontSize: 11,
        fontWeight: FontWeight.w600,
      );

  static TextStyle tableCell(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textPrimary,
        fontSize: 13,
      );

  static TextStyle tableCellBold(AppColors c) => TextStyle(
        fontFamily: fontFamily,
        color: c.textPrimary,
        fontSize: 13,
        fontWeight: FontWeight.w500,
      );

  // ── Button ──
  static const TextStyle buttonPrimary = TextStyle(
    fontFamily: fontFamily,
    color: Colors.white,
    fontSize: 15,
    fontWeight: FontWeight.w600,
  );

  static const TextStyle buttonSmall = TextStyle(
    fontFamily: fontFamily,
    color: Colors.white,
    fontSize: 13,
    fontWeight: FontWeight.w600,
  );

  // ── Badge / Status ──
  static TextStyle badge({required Color color}) => TextStyle(
        fontFamily: fontFamily,
        color: color,
        fontSize: 11,
        fontWeight: FontWeight.w600,
      );
}
