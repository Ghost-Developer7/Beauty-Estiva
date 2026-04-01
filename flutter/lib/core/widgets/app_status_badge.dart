import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../constants/app_text_styles.dart';

/// Durum gösterge rozeti (Onaylandı, Tamamlandı, vb.)
class AppStatusBadge extends StatelessWidget {
  final String label;
  final Color color;

  const AppStatusBadge({
    super.key,
    required this.label,
    required this.color,
  });

  /// Randevu durum rengi
  static Color statusColor(String status) => switch (status) {
        'Scheduled' => const Color(0xFF3b82f6),
        'Confirmed' => AppColors.green,
        'Completed' => AppColors.cyan,
        'Cancelled' => AppColors.red,
        'NoShow' => AppColors.orange,
        _ => const Color(0xFF5a4d7a),
      };

  /// Randevu durum etiketi (TR)
  static String statusLabel(String status) => switch (status) {
        'Scheduled' => 'Planlandi',
        'Confirmed' => 'Onaylandi',
        'Completed' => 'Tamamlandi',
        'Cancelled' => 'Iptal',
        'NoShow' => 'Gelmedi',
        _ => status,
      };

  /// Randevu durumuna göre otomatik badge
  factory AppStatusBadge.appointment(String status) {
    return AppStatusBadge(
      label: statusLabel(status),
      color: statusColor(status),
    );
  }

  /// Aktif/Pasif durumu için badge
  factory AppStatusBadge.active(bool isActive) {
    return AppStatusBadge(
      label: isActive ? 'Aktif' : 'Pasif',
      color: isActive ? AppColors.green : const Color(0xFF5a4d7a),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        textAlign: TextAlign.center,
        style: AppTextStyles.badge(color: color),
      ),
    );
  }
}
